import dotenv from 'dotenv'
import express from 'express'
import payload from 'payload'

dotenv.config()

const start = async () => {
  const app = express()

  await payload.init({
    secret: process.env.PAYLOAD_SECRET ?? '',
    mongoURL: process.env.MONGODB_URI ?? '',
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
