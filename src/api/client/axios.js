const axios = require('axios')
const httpContext = require('express-http-context')

const BASE_URL = 'http://base-url'

const client = axios.create({
  baseURL: BASE_URL,
})

const getAccessToken = () => httpContext.get('accessToken')

const addAuthorizationHeader = config => {
  const accessToken = getAccessToken()

  if (accessToken && !config.headers.Authorization) {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `auth_token ${accessToken}`,
      },
    }
  }

  return config
}

client.interceptors.request.use(async config => {
  const accessToken = getAccessToken()

  if (accessToken && !config.headers.Authorization) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `auth_token ${accessToken}`
  }

  return config
})

client.interceptors.request.use(addAuthorizationHeader, error => {
  console.error('Error in request interceptor:', error)
  return Promise.reject(error)
})

module.exports = {
  client,
}
