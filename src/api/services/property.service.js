const { getDevicePropertyByPropertyNameEndpoint } = require('../common/aylaEndPoints')
const { handleApiError } = require('../common/utils')
const { createDatapoints } = require('./datapoint.service')
const { aylaClient } = require('../client/ayla.axios')

const updateProperties = async properties => {
  let response
  try {
    const { data } = await createDatapoints(properties)
    response = data
  } catch (error) {
    handleApiError(error, 'update properties')
  }

  return response
}

/**
 * Retrieves a device property given a device DSN, and the property name.
 */
const getDevicePropertyByDsnAndPropertyName = async (dsn, propertyName) => {
  let response
  try {
    const { data: property } = await aylaClient.get(getDevicePropertyByPropertyNameEndpoint(dsn, propertyName))
    response = property
  } catch (error) {
    handleApiError(error, 'get device property by DSN and property name')
  }

  return response
}

module.exports = {
  getDevicePropertyByDsnAndPropertyName,
  updateProperties,
}
