import type { Router } from 'express'
import { authenticateToken } from 'src/middleware/auth'
import { chatConfig, chatProcess } from './chatgpt'
import { authLogin, userUsage } from './user'

export function setupRouters(router: Router) {
  router.post('/chat-process', [authenticateToken], chatProcess)
  router.get('/config', [authenticateToken], chatConfig)

  router.post('/login', authLogin)
  router.get('/usage', [authenticateToken], userUsage)
}
