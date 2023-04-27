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
      format: t => `Please refer to the background information I provided, ${t}`,
    },
    {
      title: '背景内容',
      path: 'step2',
      row: 2,
      format: (t, s) => `Before considering the answer ${t}, please refer to the following background content: \n${s}`,
    },
    {
      title: '分步要求',
      path: 'step3',
      row: 2,
      format: (t, s) => `At ${t}, please follow the following requirements:\n${s}`,
    },
    {
      title: '分步操作',
      path: 'step4',
      row: 2,
      format: (t, s) => `When ${t}, let's take it step by step:\n${s}`,
    },
    {
      title: '回复要求',
      path: 'step5',
      row: 2,
      format: (_, s) => `When replying, it is required to strictly follow the following content and examples:\n${s}`,
    },
    {
      title: '你的问题',
      path: 'step6',
      row: 2,
      format: (_, s) => `Strictly follow the above requirements and then think and reply:\n${s}`,
    },
  ])

  function formatPrompt() {
    const result = formItems.value
      .filter(i => checkbox.value.includes(i.path))
      .map(({ path, format }) => format(formValue.value[path], formValue.value[path]))
      .join('\n\n')
    checkbox.value = ['step1']
    formValue.value = {}
    emitResult(result)
    close()
  }

  const rules = computed(() => formItems.value.map(({ path, rule }) => ({ path, rule })).filter(i => i.rule).reduce((acc, cur) => ({ ...acc, [cur.path]: cur.rule }), {}))
  const options = computed(() => formItems.value.map(i => ({ label: i.title, value: i.path, ...i })))
  const checkForms = computed(() => options.value.filter(i => checkbox.value.includes(i.value)))

  function setDemo() {
    checkbox.value = ['step1', 'step2', 'step6']
    formValue.value = {
      step1: 'Help me generate Midjourany\'s prompt',
      step2: 'Midjourany is an AI drawing tool that, similar to ChatGpt, outputs results by inputting prompt, Midjourany uses English commas to separate keywords, There are some rules to follow that I will explain to you: I will use the command "/imagine" followed by a subject I want to render. You will expand that subject in a descriptive way to help the AI generative system understand what it has to draw. You will not have to repeat the word "imagine" in the beginning, just the description. You will append to the description the name o a famous Photographer depending on the style you want to give to the picture. Example: "photographed by Richard Avedon". The name will be followed by a full stop "." You will add the name of a professional photo camera model. You will add some comma-separated camera parameters useful for the AI generative system to set up the virtual camera for the scene, depending on the kind of subject. You will decide the parameters based on the style of the photographer. An example is: "shutter speed 1/50, aperture f11, ISO 100". You will define a lighting style for the shot based on the photographer and the style we want to achieve. Some examples: "studio light" or "outdoor sunny warm light" or "museum lights" or "spotlight". Feel free to use other lighting setups you know apart from these. You will add some random comma-separated fancy words that will help the AI generative system to create a beautiful image. Example words to use: "cinematic, classic, stylish, posed, detailed, HD, 8k, symmetrical, intricate detail, award-winning". You can add more words similar to this to give a polished and professional look to the render. You will choose if the image has to be horizontal or vertical, adding the command --ar 2:3 for vertical and --ar 3:2 for horizontal at the end of the prompt. You will just provide the command without any other indication. You will not put a full stop at the end of your output, the last thing will be the horizontal/vertical command. ',
      step6: 'I want to create a poetic Hanging Garden',
    }
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
