const crypto = require('crypto')

/**
 * Validates the HMAC algorithm.
 * @param {string} hmacAlgorithm - The HMAC algorithm to be used.
 * @throws Will throw an error if the HMAC algorithm is not specified.
 */
const validateHmacAlgorithm = hmacAlgorithm => {
  if (!hmacAlgorithm) {
    throw new Error('HMAC algorithm must be specified')
  }
}

/**
 * Signs a message using the specified HMAC algorithm and secret.
 * @param {string} hmacAlgorithm - The HMAC algorithm to use.
 * @param {Buffer} secretBuffer - The secret key as a buffer.
 * @param {Buffer} messageBuffer - The message to sign as a buffer.
 * @return {Buffer} The generated HMAC signature.
 */
const signMessage = (hmacAlgorithm, secretBuffer, messageBuffer) => {
  const hmac = crypto.createHmac(hmacAlgorithm, secretBuffer)
  hmac.update(messageBuffer)
  return hmac.digest()
}

/**
 * Creates an HMAC authenticator for the specified algorithm.
 * @param {string} hmacAlgorithm - The HMAC algorithm to use.
 * @return {Object} An object with 'sign' and 'signHex' methods.
 */
const createHmacAuthenticator = hmacAlgorithm => {
  validateHmacAlgorithm(hmacAlgorithm)

  return {
    /**
     * Generates an HMAC signature.
     * @param {string} secret - The secret key.
     * @param {string} message - The message to sign.
     * @return {Buffer} HMAC signature.
     */
    sign: (secret, message) => signMessage(hmacAlgorithm, Buffer.from(secret), Buffer.from(message)),

    /**
     * Generates an HMAC signature in hexadecimal format.
     * @param {string} secret - The secret key.
     * @param {string} message - The message to sign.
     * @return {string} HMAC signature in hexadecimal format.
     */
    signHex: (secret, message) => signMessage(hmacAlgorithm, Buffer.from(secret), Buffer.from(message)).toString('hex'),
  }
}

module.exports = createHmacAuthenticator
