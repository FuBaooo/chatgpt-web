import type { IncomingHttpHeaders } from 'http'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const extractBearerTokenFromHeaders = ({ authorization }: IncomingHttpHeaders) => {
  if (!authorization)
    throw new Error('Error: 无访问权限 | No access rights')

  if (!authorization.startsWith('Bearer'))
    throw new Error('Error: 无访问权限 | No access rights')

  return authorization.slice('Bearer'.length + 1)
}

const auth = async (req, res, next) => {
  // Extract the token
  const token = extractBearerTokenFromHeaders(req.headers)

  await jwtVerify(
    token,
    createRemoteJWKSet(new URL(`${process.env.VITE_LOGTO_ENDPOINT}/oidc/jwks`)),
    {
      issuer: `${process.env.VITE_LOGTO_ENDPOINT}/oidc`,
    },
  )

  return next()
}

export { auth }
