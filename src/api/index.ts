import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { get, post } from '@/utils/request'
import { useSettingStore, useUserStore } from '@/store'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  const settingStore = useSettingStore()

  let data: Record<string, any> = {
    prompt: params.prompt,
    options: params.options,
  }

  data = {
    ...data,
    systemMessage: settingStore.systemMessage,
    temperature: settingStore.temperature,
    top_p: settingStore.top_p,
    model: settingStore.model,
  }

  return post<T>({
    url: '/chat-process',
    data,
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  }).then((res) => {
    const userStore = useUserStore()
    userStore.refreshUsage()
    return res
  })
}

export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(username: string, password: string) {
  return post<T>({
    url: '/login',
    data: { username, password },
  })
}

export function fetchUsage<T>() {
  return get<T>({
    url: '/usage',
  })
}
