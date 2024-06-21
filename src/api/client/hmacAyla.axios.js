const axios = require('axios')
const { generateAylaHmacAuthorizationHeader } = require('../auth/hmac/aylaHmacAuthenticator')
const { getCurrentTimeFormattedInUTC } = require('../common/utils')
const { AUTHORIZATION_HEADER, HDR_SSO_DATE, HDR_AYLA_ORIGIN_HOST } = require('../common/constants')

const appId = process.env.HMAC_APP_ID
const scope = process.env.HMAC_SCOPE
const secret = process.env.HMAC_SECRET
const salt = process.env.HMAC_SALT
if (!appId || !scope || !secret || !salt) {
  throw new Error('Missing required environment variables for HMAC configuration')
}

// Function to create the HMAC Ayla client
const createHmacAylaClient = baseUrl => {
  const client = axios.create({ baseURL: baseUrl })
  const host = new URL(baseUrl).hostname

  // Function to add the authorization headers to the request
  const addAuthorizationHeaders = config => {
    if (!config.headers[AUTHORIZATION_HEADER]) {
      const fullUrl = new URL(config.url, baseUrl)
      const canonicalUrl = fullUrl.pathname
      const canonicalQueryString = fullUrl.searchParams.toString()
      const method = config.method.toUpperCase()
      const time = getCurrentTimeFormattedInUTC()

      const authorization = generateAylaHmacAuthorizationHeader({
        appId,
        scope,
        salt,
        secret,
        host,
        canonicalUrl,
        canonicalQueryString,
        method,
        time,
      })

      return {
        ...config,
        headers: {
          ...config.headers,
          [AUTHORIZATION_HEADER]: authorization,
          [HDR_SSO_DATE]: time,
          [HDR_AYLA_ORIGIN_HOST]: host,
        },
      }
    }
    return config
  }

  client.interceptors.request.use(addAuthorizationHeaders, error => {
    console.error('Error in request interceptor:', error)
    return Promise.reject(error)
  })

  return client
}

const aylaHmacClient = createHmacAylaClient(process.env.HMAC_AYLA_API_URL)

module.exports = {
  aylaHmacClient,
}
