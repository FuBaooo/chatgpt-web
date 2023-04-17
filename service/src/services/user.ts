import { AppDataSource } from 'src/database'
import { User } from 'src/database/model/User'
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from 'src/'
import { loginUser } from 'src/middleware/auth'

export const JWT_STORE = new Map()

export async function authLogin(req, res) {
  try {
    const { username, password } = req.body as { username: string; password: string }
    if (!username || !password)
      throw new Error('账户密码不能为空')

    try {
      const result = await AppDataSource.manager.findOne(User, {
        where: {
          username,
          password,
        },
        select: ['id', 'username', 'realname', 'user_usage', 'max_usage', 'models', 'last_ip'],
      })
      await AppDataSource.manager.update(User, result.id, {
        last_ip: req.ip,
      })

      const token = jwt.sign(
        JSON.parse(JSON.stringify(result)),
        SECRET_KEY,
        {
          expiresIn: 60 * 60 * 24 * 5,
        },
      )
      loginUser(result.username, token)

      res.send({
        status: 'Success',
        message: '登录成功',
        data: {
          token,
          user: {
            id: result.id,
            username: result.username,
            name: result.realname,
            userUsage: result.user_usage,
            maxUsage: result.max_usage,
            models: result.models,
          },
        },
      })
    }
    catch (e) {
      throw new Error('账户密码错误')
    }
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
}

export async function userUsage(req, res) {
  try {
    const result = await AppDataSource.manager.findOne(User, {
      where: { id: req.user.id },
      select: ['user_usage', 'max_usage', 'models'],
    })
    res.send({
      status: 'Success',
      message: '操作成功',
      data: result,
    })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
}
