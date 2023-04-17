import * as dotenv from 'dotenv'
import express from 'express'
import { expressjwt } from 'express-jwt'
import { AppDataSource } from './database'
import { setupRouters } from './services'
dotenv.config()

export const SECRET_KEY = process.env.CHAT_WEB_JWT_SECRET_KEY

AppDataSource.initialize().then(() => {
  const app = express()
  const router = express.Router()

  app.use(express.static('public'))
  app.use(express.json())

  app.all('*', (_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
    res.header('Access-Control-Allow-Methods', '*')
    next()
  })

  setupRouters(router)

  app.use('', router)
  app.use(expressjwt({
    secret: SECRET_KEY,
    algorithms: ['HS256'],
  }))

  app.use('/api', router)
  app.set('trust proxy', 1)

  app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
})
