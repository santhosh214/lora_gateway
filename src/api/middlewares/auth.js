const httpContext = require('express-http-context')

const validateAuthorization = authorization => {
  if (!authorization) {
    const e = new Error('Unauthorized')
    e.status = 401

    throw e
  }
}

const auth = () => async (req, res, next) => {
  try {
    const { authorization } = req.headers

    validateAuthorization(authorization)

    const authToken = authorization.replace('Bearer ', '')
    req.headers.aylaAuthtoken = authToken
    // Setting the Ayla auth token to do a pass through when calling Ayla API endpoints.
    httpContext.set('accessToken', authToken)

    next()
  } catch (e) {
    next(e)
  }
}

module.exports = auth
