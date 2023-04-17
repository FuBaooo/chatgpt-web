import 'reflect-metadata'
import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'
dotenv.config()

export const AppDataSource = new DataSource({
  name: 'gpt',
  type: 'mysql',
  host: process.env.CHAT_WEB_DATABASE_HOST,
  port: +process.env.CHAT_WEB_DATABASE_PORT,
  username: process.env.CHAT_WEB_USERNAME,
  password: process.env.CHAT_WEB_PASSWORD,
  database: process.env.CHAT_WEB_DATABASE,
  entities: ['**/model/*.ts'],
})
