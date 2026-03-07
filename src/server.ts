import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import payload from 'payload'

dotenv.config()

if (!process.env.PAYLOAD_CONFIG_PATH) {
  const configFileName = __filename.endsWith('.ts') ? 'payload.config.ts' : 'payload.config.js'
  process.env.PAYLOAD_CONFIG_PATH = path.resolve(__dirname, configFileName)
}

const start = async () => {
  const app = express()
  const publicDir = path.resolve(__dirname, '../public')

  app.use(express.static(publicDir))

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

  const port = Number(process.env.PORT ?? 3000)
  app.listen(port, () => {
    payload.logger.info(`Server running at http://localhost:${port}`)
  })
}

void start()
