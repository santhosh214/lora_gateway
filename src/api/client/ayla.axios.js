const axios = require('axios')
const httpContext = require('express-http-context')
const { AUTHORIZATION_HEADER, ACCESS_TOKEN_KEY, TOKEN_PREFIX } = require('../common/constants')

/**
 * Creates an Axios instance with a given base URL and common interceptors.
 * @param {string} baseUrl - The base URL for the Axios instance.
 * @returns {AxiosInstance} Configured Axios instance.
 */
const createAylaClient = (baseUrl) => {
  const client = axios.create({ baseURL: baseUrl })

  /**
   * Interceptor function to add the Authorization header.
   * @param {Object} config - The Axios request configuration.
   * @returns {Object} The modified or original configuration.
   */
  const addAuthorizationHeader = (config) => {
    const accessToken = httpContext.get(ACCESS_TOKEN_KEY)

    if (accessToken && !config.headers[AUTHORIZATION_HEADER]) {
      return {
        ...config,
        headers: {
          ...config.headers,
          [AUTHORIZATION_HEADER]: `${TOKEN_PREFIX} ${accessToken}`,
        },
      }
    }

    return config
  }

  client.interceptors.request.use(addAuthorizationHeader, error => {
    console.error('Error in request interceptor:', error)
    return Promise.reject(error)
  })

  return client
}

const aylaClient = createAylaClient(process.env.AYLA_ADS_API_URL)
const aylaClientNoAuth = axios.create({ baseURL: process.env.AYLA_ADS_API_URL })

module.exports = {
  aylaClient,
  aylaClientNoAuth,
}
