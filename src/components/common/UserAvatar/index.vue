<script setup lang='ts'>
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'
import { useLogto } from '@logto/vue'
import { useUserStore } from '@/store'
import defaultAvatar from '@/assets/avatar.jpg'
import { isString } from '@/utils/is'

const logto = useLogto()
const { signIn, signOut, isAuthenticated, fetchUserInfo } = logto
const onClickSignIn = () => signIn('http://localhost:1002/callback')
const onClickSignOut = () => signOut('http://localhost:1002')

if (isAuthenticated.value) {
  const { userInfo: { name, avatar }, updateUserInfo } = useUserStore()
  fetchUserInfo().then((userInfo) => {
    if (!userInfo)
      return
    updateUserInfo({
      name: userInfo.username || name,
      avatar: userInfo.picture || avatar,
    })
  })
}

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
</script>

<template>
  <div class="flex items-center overflow-hidden">
    <div class="w-10 h-10 overflow-hidden rounded-full shrink-0">
      <template v-if="isString(userInfo.avatar) && userInfo.avatar.length > 0">
        <NAvatar size="large" round :src="userInfo.avatar" :fallback-src="defaultAvatar" />
      </template>
      <template v-else>
        <NAvatar size="large" round :src="defaultAvatar" />
      </template>
    </div>
    <div class="flex-1 min-w-0 ml-2">
      <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
        {{ userInfo.name }}
      </h2>
      <div v-if="isAuthenticated">
        <button @click="onClickSignOut">
          登出
        </button>
      </div>
      <div v-else>
        <button @click="onClickSignIn">
          登录
        </button>
      </div>
    </div>
  </div>
</template>
