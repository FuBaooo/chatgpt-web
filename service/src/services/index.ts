import type { Router } from 'express'
import { authenticateToken } from 'src/middleware/auth'
import { limiter } from 'src/middleware/limiter'
import { chatConfig, chatProcess } from './chatgpt'
import { authLogin, userUsage } from './user'

export function setupRouters(router: Router) {
  router.post('/chat-process', [authenticateToken, limiter], chatProcess)
  router.get('/config', [authenticateToken], chatConfig)

  router.post('/login', authLogin)
  router.get('/usage', [authenticateToken], userUsage)
}
