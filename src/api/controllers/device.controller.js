const { parseApiError } = require('../common/parseApiError')
const { ArgumentError } = require('../errors/ArgumentError')

const deviceService = require('../services/device.service')

/**
 * Retrieves the devices.
 */
const getDevices = async (req, res) => {
  const {
    query: { isSensor },
  } = req

  try {
    const devices = await deviceService.getAllDevices(isSensor)

    res.send(devices)
  } catch (e) {
    console.error(`An error occurred while getting the devices`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

/**
 * Retrieves the device nodes.
 */
const getAllNodesByDeviceId = async (req, res) => {
  const {
    params: { deviceId },
  } = req

  try {
    const devices = await deviceService.getAllNodesByDeviceId(deviceId)

    res.send(devices)
  } catch (e) {
    console.error(`An error occurred while getting the device nodes`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

/**
 * Unregister a device.
 */
const unregisterDevice = async (req, res) => {
  const {
    params: { deviceId },
  } = req

  try {
    const response = await deviceService.unregisterDevice(deviceId)

    res.send(response)
  } catch (e) {
    console.error(`An error occurred while unregistering a device: ${deviceId}`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const updateDeviceNameById = async (req, res) => {
  const {
    params: { deviceId },
    body: productName,
  } = req

  try {
    const response = await deviceService.updateDeviceNameById(deviceId, productName)

    res.send(response)
  } catch (e) {
    console.error(`An error occurred while rename device by Id`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const getDSNByMacAndSerial = async (req, res) => {
  const {
    query: { macAddress, serialNumber },
  } = req

  try {
    const response = await deviceService.getDSNByMacAndSerialNumber(macAddress, serialNumber)

    res.send(response)
  } catch (e) {
    console.error(`An error occurred while fetching DSN by Mac & Serial Number`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const getConnectionHistoryByDevice = async (req, res) => {
  const {
    params: { deviceId },
    query: { page = 1, limit = 10, sortBy = 'eventTime', sortDirection = 'desc' },
  } = req

  const pageInt = parseInt(page, 10)
  const limitInt = parseInt(limit, 10)

  if (Number.isNaN(pageInt) || pageInt < 1) {
    return res.status(400).json({ errorMessage: 'Page must be a positive integer.' })
  }

  if (Number.isNaN(limitInt) || limitInt < 1) {
    return res.status(400).json({ errorMessage: 'Limit must be a positive integer.' })
  }

  try {
    const response = await deviceService.getConnectionHistoryByDeviceId(deviceId, pageInt, limitInt, sortBy, sortDirection)

    res.send(response)
  } catch (error) {
    console.error(`An error occurred while getting connection history for a device`, error.message)

    if (error instanceof ArgumentError) {
      return res.status(400).json({ errorMessage: error.message })
    }

    const { errorMessage, status } = parseApiError(error)
    const errorStatus = status || 500

    return res.status(errorStatus).json({ errorMessage })
  }
}

const addDeviceConnectionHistory = async (req, res) => {
  try {
    const {
      params: { deviceId },
      body: { status, eventTime },
    } = req
    const response = await deviceService.addDeviceConnectionHistory(deviceId, status, eventTime)

    res.status(201).json(response)
  } catch (error) {
    console.error(`An error occurred while creating connection history for a device`, error.message)

    if (error instanceof ArgumentError) {
      return res.status(400).json({ errorMessage: error.message })
    }

    const { errorMessage, status } = parseApiError(error)
    const errorStatus = status || 500

    return res.status(errorStatus).json({ errorMessage })
  }
}

module.exports = {
  getDevices,
  getAllNodesByDeviceId,
  unregisterDevice,
  updateDeviceNameById,
  getDSNByMacAndSerial,
  getConnectionHistoryByDevice,
  addDeviceConnectionHistory,
}
