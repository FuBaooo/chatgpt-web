<script setup lang='ts'>
import { useToggle } from '@vueuse/core'
import { NButton, NCheckbox, NCheckboxGroup, NForm, NFormItem, NInput, NModal, NSpace, NTabPane, NTabs } from 'naive-ui'
import { useLong } from './useLong'
import { usePrompt } from './usePrompt'

const emit = defineEmits(['sendFormat', 'sendLong'])
const [visible, toggleVisible] = useToggle(false)

const {
  checkbox,
  formValue,
  formRef,
  formatPrompt,
  rules,
  options,
  checkForms,
  setDemo,
} = usePrompt(val => emit('sendFormat', val), () => toggleVisible(false))

const {
  longContent,
  sendLongPrompt,
} = useLong(val => emit('sendLong', val), () => toggleVisible(false))

function open() {
  toggleVisible(true)
}

defineExpose({ open })
</script>

<template>
  <NModal
    v-model:show="visible" :auto-focus="false" preset="card" :title="$t('chat.formatPrompt')"
    style="width: 90%; max-width: 640px"
  >
    <NTabs type="line" animated>
      <NTabPane name="prompt" tab="提示词">
        <NCheckboxGroup v-model:value="checkbox" class="mb-4">
          <NSpace item-style="display: flex;">
            <NCheckbox v-for="option in options" :key="option.value" :value="option.value">
              {{ option.label }}
            </NCheckbox>
          </NSpace>
        </NCheckboxGroup>
        <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules">
          <NFormItem v-for="item in checkForms" :key="item.value" :label="item.label" :path="item.value">
            <NInput v-model:value="formValue[item.value]" :rows="item.row" type="textarea" />
          </NFormItem>
          <NFormItem>
            <div class="flex items-center justify-center gap-x-2 w-full">
              <NButton type="primary" @click="setDemo">
                查看示例
              </NButton>
              <NButton type="primary" @click="formatPrompt">
                确定
              </NButton>
            </div>
          </NFormItem>
        </NForm>
      </NTabPane>
      <NTabPane name="long" tab="发送长文本">
        <NInput v-model:value="longContent" rows="10" type="textarea" placeholder="请输入需要发送的长文本，超过一定字数会自动分段发送" />
        <div class="flex mt-4 items-center justify-center gap-x-2 w-full">
          <NButton type="primary" @click="sendLongPrompt">
            确定
          </NButton>
        </div>
      </NTabPane>
    </NTabs>
  </NModal>
</template>
