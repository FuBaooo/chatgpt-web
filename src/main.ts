import { createApp } from 'vue'
import type { LogtoConfig } from '@logto/vue'
import { UserScope, createLogto } from '@logto/vue'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets, setupScrollbarStyle } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'

const config: LogtoConfig = {
  endpoint: process.env.VITE_LOGTO_ENDPOINT || '',
  appId: process.env.VITE_LOGTO_APPID || '',
  resources: [
    `${process.env.VITE_LOGTO_ENDPOINT}/api`,
    `${window.location.origin}/api`,
  ],
  scopes: [
    UserScope.Profile,
    UserScope.Email,
    UserScope.Phone,
    UserScope.CustomData,
    UserScope.Identities,
  ],
}

async function bootstrap() {
  const app = createApp(App)
  setupAssets()

  setupScrollbarStyle()

  setupStore(app)

  setupI18n(app)

  await setupRouter(app)

  app.use(createLogto, config)

  app.mount('#app')
}

bootstrap()
