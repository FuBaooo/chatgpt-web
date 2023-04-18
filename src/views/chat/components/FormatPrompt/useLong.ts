import { computed, ref, watch } from 'vue'
import { useChatStore } from '@/store'

export function useLong(emitResult: (val: string) => void, close: () => void) {
  const longContent = ref('')

  function sendLongPrompt() {
    emitResult(longContent.value)
    close()
  }

  return {
    longContent,
    sendLongPrompt,
  }
}

export async function sendLongContent(content: string, sendContent: (val: string) => void) {
  const filterContent = content.trim().replace(/\n|\r|\t/g, '').replace(/(http|https):\/\/[^\s]+/g, '')
  const contentList = splitContent(filterContent)
  // sendContent(`阅读文本然后回复 OK\n${contentList[0]}`)
  // const res = await waitGptReceive()
  // 循环发送内容，并且确定每段内容gpt接受完整，再发送下一段，如果gpt没有接受完整，就重新发送上一段
  let lastSendContentIdx = 0
  for (let i = lastSendContentIdx; i < contentList.length; i++) {
    const content = contentList[i]
    sendContent(`阅读以下文本，然后回复 OK\n${content}`)
    const res = await waitGptReceive()
    if (res)
      lastSendContentIdx = i + 1
    else
      i--
  }
}

/**
 * 把content 分割成每段小于20字的内容, 并且需要保存上一段的最后10个字符
 * 例如 你好！我是chatgpt, 我可以回答你的一些问题。
 * 将会分割为 ['你好！我是chatgpt, 我可以回答你', 'pt, 我可以回答你的一些问题。']
 */
function splitContent(content: string, maxLength = 800, keepLength = 5) {
  const result = []
  let start = 0
  while (start < content.length) {
    let end = start + maxLength
    if (end > content.length)
      end = content.length

    let segment = content.substring(start, end)
    if (start > 0)
      segment = content.substring(start - keepLength, end)

    result.push(segment)
    start += maxLength
  }
  return result
}

function waitGptReceive() {
  const chatStore = useChatStore()
  const dataSources = computed(() => chatStore.getChatByUuid())
  let timer: NodeJS.Timeout | null = null

  return new Promise<boolean>((resolve) => {
    const stopWatch = watch(() => dataSources.value, (val, oldVal) => {
      const last = val[val.length - 1]
      if (!last.loading && last.text === 'OK') {
        stopWatch()
        clearTimeout(timer!)
        resolve(true)
      }
    }, { deep: true })

    timer = setTimeout(() => {
      stopWatch()
      clearTimeout(timer!)
      resolve(false)
    }, 30000)
  })
}
