<script setup lang='ts'>
import { ref } from 'vue'
import { NButton, NModal } from 'naive-ui'
import { useLogto } from '@logto/vue'
import Icon403 from '@/icons/403.vue'

interface Props {
  visible: boolean
}

defineProps<Props>()

const loading = ref(false)

const { signIn } = useLogto()

async function handleLogin() {
  loading.value = true
  signIn(`${window.location.origin}/callback`)
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
        <NButton
          block
          type="primary"
          :loading="loading"
          @click="handleLogin"
        >
          {{ $t('common.login') }}
        </NButton>
      </div>
    </div>
  </NModal>
</template>
