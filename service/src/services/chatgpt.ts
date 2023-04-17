import type { ChatMessage } from 'chatgpt'
import { chatReplyProcess, chatConfig as config } from 'src/chatgpt'
import { AppDataSource } from 'src/database'
import { UsageRecord } from 'src/database/model/UsageRecord'
import { User } from 'src/database/model/User'
import type { RequestProps } from 'src/types'
import { computedUsages } from 'src/utils/usage'
import dayjs from 'dayjs'

export async function chatProcess(req, res) {
  res.setHeader('Content-type', 'application/octet-stream')
  let usage = 0
  try {
    const { prompt, options = {}, systemMessage, temperature, top_p, model } = req.body as RequestProps
    if (!req.user.models.includes(model))
      throw new Error('没有使用该模型的权限')

    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
        usage = computedUsages(chat.text)
      },
      systemMessage,
      temperature,
      top_p,
      model,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    recordUsage(req.user.id, req.body.model || 'gpt-3.5-turbo', computedUsages(req.body.prompt) + usage)
    res.end()
  }
}

export async function chatConfig(_, res) {
  try {
    const response = await config()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
}

export async function recordUsage(id, model, usage) {
  const user = await AppDataSource.manager.findOne(User, { where: { id } })
  await AppDataSource.manager.update(User, id, {
    user_usage: user.user_usage + usage,
  })
  const where = {
    user: id,
    usage_date: dayjs().format('YYYY-MM-DD'),
    model,
  }
  const userRecord = await AppDataSource.manager.findOne(UsageRecord, { where })
  // 更新用量
  if (userRecord) {
    await AppDataSource.manager.update(UsageRecord, userRecord.id, {
      usage_amount: userRecord.usage_amount + usage,
    })
  }
  else {
    await AppDataSource.manager.save(UsageRecord, {
      ...where,
      usage_amount: usage,
    })
  }
}
