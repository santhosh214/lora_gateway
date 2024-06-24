const axios = require("axios");
const loraService = require("../services/lora.service")
const { parseApiError } = require("../common/parseApiError")

const getAllGateways = async (req, res) => {

  try {
    const gateways = await loraService.getAllGateways()

    res.status(200).send(gateways)
  } catch (err) {
    console.error(`An error occurred while getting the gateways from lora`, err.message)

    const { errorMessage, status } = parseApiError(err)

    res.status(status).send({ status, errorMessage })
  }
}

const getGatewayById = async (req, res) => {
  const {
    params: { gatewayId }
  } = req
  try {
    const gateway = await loraService.getGatewayById(gatewayId);

    res.status(200).send(gateway)
  } catch (err) {
    console.error(`An error occurred while getting the gateways from lora`, err.message)

    const { errorMessage, status } = parseApiError(err)

    res.status(status).send({ status, errorMessage })
  }
}

const createGateway = async (req, res) => {
  const {
    params: { organizationId },
    body: payload,
  } = req

  try {
    const response = await loraService.createGatewayByOrganizationId(organizationId, payload);

    res.status(201).send(response)
  } catch (err) {
    console.error(`An error occurred while creating gateway`, err.message)

    const { errorMessage, status } = parseApiError(err)

    res.status(status).send({ status, errorMessage })
  }
}

const deleteGateway = async (req, res) => {
  const {
    params: { gatewayId }
  } = req

  try {
    const response = await loraService.deleteGatewayByGatewayId(gatewayId)

    res.status(200).send(response)
  } catch (err) {
    console.error(`An error occurred while deleting gateway with gatewayId: ${gatewayId}`, err.message)

    const { errorMessage, status } = parseApiError(err)

    res.status(status).send({ status, errorMessage })
  }
}


module.exports = { getAllGateways, getGatewayById, createGateway, deleteGateway };
