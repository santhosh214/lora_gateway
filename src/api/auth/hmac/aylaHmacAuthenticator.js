const createHmacAuthenticator = require('./hmacAuthenticator')

const HDR_AYLA_ORIGIN_HOST = 'x-ayla-origin-host'
const HDR_SSO_DATE = 'x-sso-date'
const HMAC_ALGORITHM = 'SHA256'
const HMAC_SCHEMA = 'HMAC-SHA256'

const hmacAuthenticator = createHmacAuthenticator(HMAC_ALGORITHM)

const generateAylaHmacAuthorizationHeader = ({
  appId,
  scope,
  salt,
  secret,
  host,
  canonicalUrl,
  canonicalQueryString,
  method,
  time,
}) => {
  if (!appId || !scope || !salt || !secret || !host || !canonicalUrl || !method || !time) {
    throw new Error('Missing required parameters')
  }

  const signedHeaders = `${HDR_AYLA_ORIGIN_HOST};${HDR_SSO_DATE}`
  const canonicalHeaders = `${HDR_AYLA_ORIGIN_HOST}: ${host}\n${HDR_SSO_DATE}: ${time}\n`
  const canonicalRequest = `${method}\n${canonicalUrl}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}`
  const stringToSign = `${HMAC_SCHEMA}\n${time}\n${scope}\n${canonicalRequest}`

  try {
    const signingKey = hmacAuthenticator.sign(secret + salt, time)
    const signature = hmacAuthenticator.signHex(signingKey, stringToSign)
    const authorizationHeader = `${HMAC_SCHEMA} Credential=${appId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    return authorizationHeader
  } catch (error) {
    console.error('Error generating Ayla HMAC authorization header:', error)
    throw error
  }
}

module.exports = {
  generateAylaHmacAuthorizationHeader,
}
