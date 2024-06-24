const { loraClient } = require("../client/lora.axios")
const { handleApiError, checkResponseStatus } = require("../common/utils")
const {
  getGatewaysEndPoint,
  getGatewayByIdEndPoint,
  getCreateGatewayByOrganizationIdEndPoint,
  getDeleteGatewayByGatewayIdEndPoint
} = require("../common/loraEndPoints")

const getAllGateways = async () => {
  let response
  try {
    response = await loraClient.get(getGatewaysEndPoint())
  } catch (error) {
    handleApiError(error, 'get gateways')
  }

  checkResponseStatus(response, 'Error retrieving gateways')

  return response.data
}

const getGatewayById = async (gatewayId) => {
  let response
  try {
    response = await loraClient.get(getGatewayByIdEndPoint(gatewayId))
  } catch (err) {
    handleApiError(err, `getting gateway with ID: ${gatewayId}`)
  }

  checkResponseStatus(response, `Error Getting gateway with ID: ${gatewayId}`)

  return response.data
}

const createGatewayByOrganizationId = async (organizationId, payload) => {
  let response
  try {
    response = await loraClient.post(getCreateGatewayByOrganizationIdEndPoint(organizationId), payload)
  } catch (error) {
    handleApiError(error, 'Create gateway')
  }

  checkResponseStatus(response, 'Error Creating gateways')

  return response.data
}

const deleteGatewayByGatewayId = async (gatewayId) => {
  let response
  try {
    response = await loraClient.delete(getDeleteGatewayByGatewayIdEndPoint(gatewayId))
  } catch (err) {
    handleApiError(err, 'delete gateway')
  }
  checkResponseStatus(response, 'Error deleting gateways')

  return response.data
}

module.exports = { getAllGateways, getGatewayById, createGatewayByOrganizationId, deleteGatewayByGatewayId }