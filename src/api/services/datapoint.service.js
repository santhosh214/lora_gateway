const { aylaClient } = require('../client/ayla.axios')
const { AYLA_DATAPOINTS_ENDPOINT } = require('../common/aylaEndPoints')
const { handleApiError } = require('../common/utils')

const createDatapoints = async datapoints => {
  let response
  try {
    const { data } = await aylaClient.post(AYLA_DATAPOINTS_ENDPOINT, {
      batch_datapoints: datapoints,
    })
    response = data
  } catch (error) {
    handleApiError(error, 'create datapoint')
  }

  return response
}

module.exports = {
  createDatapoints,
}
