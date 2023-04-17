import type { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from 'src/'

// 存储当前处于活动状态的 JWT 令牌
export const activeTokens: { [token: string]: boolean } = {}

// 存储当前活动的 JWT 令牌和已登陆用户名的 Map 映射表
const activeSessions = new Map()

// 自定义身份验证中间件函数
export const authenticateToken = (req, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token)
    return res.send({ status: 'Fail', message: '未授权的用户', data: null })

  try {
    // 验证 JWT 令牌，并解码包含的负载
    const decoded = jwt.verify(token, SECRET_KEY) as { username: string }
    // 检查此用户是否已拥有一个有效的 JWT
    const existingToken = activeSessions.get(decoded.username)
    if (existingToken && existingToken !== token)
      return res.send({ status: 'Fail', message: '已经在另外的地方登录过了', data: null })

    // 将已解码的 JWT 负载存储到请求对象中以供其他中间件和路由处理程序使用
    req.user = decoded
    next()
  }
  catch (err) {
    return res.send({ status: 'Fail', message: '登录失效请重新登录', data: null })
  }
}

// 自定义注销函数，用于从目录中删除指定用户的 JWT 令牌
export const logoutUser = (username: string) => {
  activeSessions.delete(username)
}

export const loginUser = (username: string, token: string) => {
  activeSessions.set(username, token)
}
