const axios = require("axios");
const httpContext = require("express-http-context")
const { AUTHORIZATION_HEADER } = require('../common/constants')


const createLoraClient = (baseUrl) => {
  const client = axios.create({ baseURL: baseUrl })

  const addAuthorizationHeader = (config) => {
    const accessToken = process.env.LORA_SECRET

    if (accessToken && !config.headers[AUTHORIZATION_HEADER]) {
      return {
        ...config,
        headers: {
          ...config.headers,
          [AUTHORIZATION_HEADER]: `Bearer ${accessToken}`,
        },
      }
    }

    return config
  }

  client.interceptors.request.use(addAuthorizationHeader, (error) => {
    console.error('Error in request interceptor:', error)
    return Promise.reject(error)
  })

  return client
}

const loraClient = createLoraClient(process.env.LORA_API_URL)

module.exports = { loraClient }