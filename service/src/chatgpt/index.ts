import 'isomorphic-fetch'
import * as dotenv from 'dotenv'
import type { ChatGPTAPIOptions, ChatGPTUnofficialProxyAPI, ChatMessage, SendMessageOptions } from 'chatgpt'
import { ChatGPTAPI } from 'chatgpt'
import httpsProxyAgent from 'https-proxy-agent'
import { ERROR_CODE_MESSAGE } from 'src/utils/error'
import { sendResponse } from '../utils'
import { isNotEmptyString } from '../utils/is'
import type { ChatContext, ModelConfig } from '../types'
import type { RequestOptions, SetProxyOptions, UsageResponse } from './types'

const { HttpsProxyAgent } = httpsProxyAgent
dotenv.config()

const timeoutMs: number = !isNaN(+process.env.TIMEOUT_MS) ? +process.env.TIMEOUT_MS : 100 * 1000
const disableDebug: boolean = process.env.OPENAI_API_DISABLE_DEBUG === 'true'

const model = isNotEmptyString(process.env.OPENAI_API_MODEL) ? process.env.OPENAI_API_MODEL : 'gpt-3.5-turbo'

if (!isNotEmptyString(process.env.OPENAI_API_KEY) && !isNotEmptyString(process.env.OPENAI_ACCESS_TOKEN))
  throw new Error('Missing OPENAI_API_KEY or OPENAI_ACCESS_TOKEN environment variable')

let api: ChatGPTAPI | ChatGPTUnofficialProxyAPI

(async () => {
  const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL

  const options: ChatGPTAPIOptions = {
    apiKey: process.env.OPENAI_API_KEY,
    completionParams: { model },
    debug: !disableDebug,
  }

  // increase max token limit if use gpt-4
  if (model.toLowerCase().includes('gpt-4')) {
    // if use 32k model
    if (model.toLowerCase().includes('32k')) {
      options.maxModelTokens = 32768
      options.maxResponseTokens = 8192
    }
    else {
      options.maxModelTokens = 8192
      options.maxResponseTokens = 2048
    }
  }

  if (isNotEmptyString(OPENAI_API_BASE_URL))
    options.apiBaseUrl = `${OPENAI_API_BASE_URL}/v1`

  api = new ChatGPTAPI({ ...options })
})()

async function chatReplyProcess(options: RequestOptions) {
  const { message, lastContext, process, systemMessage, temperature, top_p, model: m = model } = options
  try {
    const options: SendMessageOptions = { timeoutMs }

    if (isNotEmptyString(systemMessage))
      options.systemMessage = systemMessage
    options.completionParams = { model: m, temperature, top_p }

    if (lastContext != null)
      options.parentMessageId = lastContext.parentMessageId

    const response = await api.sendMessage(message, {
      ...options,
      onProgress: (partialResponse) => {
        process?.(partialResponse)
      },
    })
    return sendResponse({ type: 'Success', data: response })
  }
  catch (error: any) {
    const code = error.statusCode
    global.console.log(error)
    if (Reflect.has(ERROR_CODE_MESSAGE, code))
      return sendResponse({ type: 'Fail', message: ERROR_CODE_MESSAGE[code] })
    return sendResponse({ type: 'Fail', message: error.message ?? 'Please check the back-end console' })
  }
}

async function fetchUsage() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL

  if (!isNotEmptyString(OPENAI_API_KEY))
    return Promise.resolve('-')

  const API_BASE_URL = isNotEmptyString(OPENAI_API_BASE_URL)
    ? OPENAI_API_BASE_URL
    : 'https://api.openai.com'

  const [startDate, endDate] = formatDate()

  // 每月使用量
  const urlUsage = `${API_BASE_URL}/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`

  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  }

  const options = {} as SetProxyOptions

  try {
    // 获取已使用量
    const useResponse = await options.fetch(urlUsage, { headers })
    if (!useResponse.ok)
      throw new Error('获取使用量失败')
    const usageData = await useResponse.json() as UsageResponse
    const usage = Math.round(usageData.total_usage) / 100
    return Promise.resolve(usage ? `$${usage}` : '-')
  }
  catch (error) {
    global.console.log(error)
    return Promise.resolve('-')
  }
}

function formatDate(): string[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const lastDay = new Date(year, month, 0)
  const formattedFirstDay = `${year}-${month.toString().padStart(2, '0')}-01`
  const formattedLastDay = `${year}-${month.toString().padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`
  return [formattedFirstDay, formattedLastDay]
}

async function chatConfig() {
  const usage = await fetchUsage()
  const reverseProxy = process.env.API_REVERSE_PROXY ?? '-'
  const httpsProxy = (process.env.HTTPS_PROXY || process.env.ALL_PROXY) ?? '-'
  const socksProxy = (process.env.SOCKS_PROXY_HOST && process.env.SOCKS_PROXY_PORT)
    ? (`${process.env.SOCKS_PROXY_HOST}:${process.env.SOCKS_PROXY_PORT}`)
    : '-'
  return sendResponse<ModelConfig>({
    type: 'Success',
    data: { reverseProxy, timeoutMs, socksProxy, httpsProxy, usage },
  })
}

export type { ChatContext, ChatMessage }

export { chatReplyProcess, chatConfig }
