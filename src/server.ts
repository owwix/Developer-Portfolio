import dotenv from 'dotenv'
import express from 'express'
import fs from 'fs'
import next from 'next'
import path from 'path'
import payload from 'payload'
import { evaluateCloudflareAccess, shouldProtectRequest } from './security/accessControl'

dotenv.config()

if (!process.env.PAYLOAD_CONFIG_PATH) {
  const configFileName = __filename.endsWith('.ts') ? 'payload.config.ts' : 'payload.config.js'
  process.env.PAYLOAD_CONFIG_PATH = path.resolve(__dirname, configFileName)
}

const start = async () => {
  const mediaDir = process.env.PAYLOAD_MEDIA_DIR
    ? path.resolve(process.env.PAYLOAD_MEDIA_DIR)
    : path.resolve(process.cwd(), 'src/media')
  fs.mkdirSync(mediaDir, { recursive: true })

  const app = express()
  const dev = process.env.NODE_ENV !== 'production'
  const nextApp = next({ dev, dir: path.resolve(__dirname, '..') })
  const nextHandler = nextApp.getRequestHandler()

  // Defense-in-depth: enforce Cloudflare Access identity checks at the app layer,
  // even if network policies are misconfigured upstream.
  app.use((req, res, nextMiddleware) => {
    if (!shouldProtectRequest(req.path, req.method)) {
      return nextMiddleware()
    }

    const decision = evaluateCloudflareAccess(req)
    if (decision.allowed) {
      return nextMiddleware()
    }

    if (req.path.startsWith('/api/')) {
      return res.status(decision.status).json({
        error: 'Access denied',
        reason: decision.reason,
      })
    }

    return res.status(decision.status).type('text/plain').send('Access denied')
  })

  await payload.init({
    secret: process.env.PAYLOAD_SECRET ?? '',
    express: app,
    onInit: () => {
      payload.logger.info(`Payload admin URL: ${payload.getAdminURL()}`)
    },
  })

  app.get('/health', (_, res) => {
    res.status(200).json({ ok: true })
  })

  await nextApp.prepare()

  app.all('*', (req, res) => {
    void nextHandler(req, res)
  })

  const port = Number(process.env.PORT ?? 3000)
  app.listen(port, () => {
    payload.logger.info(`Server running at http://localhost:${port}`)
  })
}

void start()
