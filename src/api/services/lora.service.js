const { loraClient } = require("../client/lora.axios")
const { handleApiError, checkResponseStatus } = require("../common/utils")

const getAllGateways = async () => {
  let response
  try {
    response = await loraClient.get(getDeviceByIdEndPoint(id))
  } catch (error) {
    handleApiError(error, 'get gateways')
  }

  checkResponseStatus(response, 'Error retrieving gateways')

  return response.data
}

module.exports = { getAllGateways }