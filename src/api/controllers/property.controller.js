const { parseApiError } = require('../common/parseApiError')
const propertyService = require('../services/property.service')

/**
 * Updates the device properties.
 */
const updateProperties = async (req, res) => {
  const { body: properties } = req

  try {
    const response = await propertyService.updateProperties(properties)

    res.send(response)
  } catch (e) {
    console.error(`An error occurred while updating device properties: ${JSON.stringify(properties)}`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

module.exports = {
  updateProperties,
}
