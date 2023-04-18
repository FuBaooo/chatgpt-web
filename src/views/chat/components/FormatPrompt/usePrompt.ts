import type { FormInst } from 'naive-ui'
import { computed, ref } from 'vue'

export interface FormItem {
  title: string
  path: string
  rule?: any[]
  disabled?: boolean
  row?: number
  format: (theme: string, str: string) => string
}

export function usePrompt(emitResult: (val: string) => void, close: () => void) {
  const checkbox = ref(['step1'])
  const formValue = ref<Record<string, string>>({})
  const formRef = ref<FormInst | null>(null)
  const formItems = ref<FormItem[]>([
    {
      title: '你的需求',
      path: 'step1',
      rule: [
        {
          required: true,
          message: '请输入你的需求',
          trigger: ['input', 'blur'],
        },
      ],
      disabled: true,
      row: 2,
      format: t => `请根据我提供的背景内容，${t}`,
    },
    {
      title: '分步要求',
      path: 'step2',
      row: 2,
      format: (t, s) => `在${t}时，请遵循下述要求:\n${s}`,
    },
    {
      title: '分步操作',
      path: 'step3',
      row: 2,
      format: (t, s) => `${t}时，让我们一步一步来:\n${s}`,
    },
    {
      title: '回复要求',
      path: 'step4',
      row: 2,
      format: (_, s) => `回复时要求严格遵循以下内容和示例:\n${s}`,
    },
  ])

  function formatPrompt() {
    const result = formItems.value
      .filter(i => checkbox.value.includes(i.path))
      .map(({ path, format }) => format(formValue.value[path], formValue.value[path]))
      .join('\n\n')
    emitResult(result)
    close()
  }

  const rules = computed(() => formItems.value.map(({ path, rule }) => ({ path, rule })).filter(i => i.rule).reduce((acc, cur) => ({ ...acc, [cur.path]: cur.rule }), {}))
  const options = computed(() => formItems.value.map(i => ({ label: i.title, value: i.path, ...i })))
  const checkForms = computed(() => options.value.filter(i => checkbox.value.includes(i.value)))

  function setDemo() {

  }

  return {
    checkbox,
    formValue,
    formRef,
    formItems,
    formatPrompt,
    rules,
    options,
    checkForms,
    setDemo,
  }
}
