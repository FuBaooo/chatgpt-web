<script setup lang='ts'>
import { computed, ref } from 'vue'
import type { FormItemRule } from 'naive-ui'
import { NButton, NForm, NFormItem, NInput, NModal, useMessage } from 'naive-ui'
import { fetchVerify } from '@/api'
import { useAuthStore, useUserStore } from '@/store'
import Icon403 from '@/icons/403.vue'
import type { UserInfo } from '@/store/modules/user/helper'

interface Props {
  visible: boolean
}

defineProps<Props>()

const authStore = useAuthStore()
const userStore = useUserStore()

const ms = useMessage()

const loading = ref(false)
const formValue = ref({ username: '', password: '' })
const rules = ref({
  username: {
    required: true,
    trigger: ['input', 'blur'],
    validator: (rule: FormItemRule, value: string) => {
      return new Promise<void>((resolve, reject) => {
        if (!value.trim())
          reject(Error('请输入账号'))
        resolve()
      })
    },
  },
  password: {
    required: true,
    trigger: ['input', 'blur'],
    validator: (rule: FormItemRule, value: string) => {
      return new Promise<void>((resolve, reject) => {
        if (!value.trim())
          reject(Error('请输入密码'))
        resolve()
      })
    },
  },
})
const disabled = computed(() => !formValue.value.username.trim() || !formValue.value.password.trim() || loading.value)

async function handleVerify() {
  const a = formValue.value.username.trim()
  const p = formValue.value.password.trim()

  if (!a || !p)
    return

  try {
    loading.value = true
    const { data: { token, user } } = await fetchVerify<{ token: string; user: UserInfo }>(a, p)
    authStore.setToken(token)
    ms.success('success')
    userStore.updateUserInfo(user)
    // window.location.reload()
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
    authStore.removeToken()
    formValue.value.username = ''
    formValue.value.password = ''
  }
  finally {
    loading.value = false
  }
}

function handlePress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleVerify()
  }
}
</script>

<template>
  <NModal :show="visible" style="width: 90%; max-width: 640px">
    <div class="p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4">
        <header class="space-y-2">
          <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
            403
          </h2>
          <p class="text-base text-center text-slate-500 dark:text-slate-500">
            {{ $t('common.unauthorizedTips') }}
          </p>
          <Icon403 class="w-[200px] m-auto" />
        </header>
        <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules">
          <NFormItem label="账户" path="user.name">
            <NInput v-model:value="formValue.username" placeholder="请输入账户" />
          </NFormItem>
          <NFormItem label="密码" path="user.age">
            <NInput v-model:value="formValue.password" type="password" placeholder="请输入密码" @keypress="handlePress" />
          </NFormItem>
          <NFormItem>
            <NButton block type="primary" :disabled="disabled" :loading="loading" @click="handleVerify">
              {{ $t('common.verify') }}
            </NButton>
          </NFormItem>
        </NForm>
      </div>
    </div>
  </NModal>
</template>
