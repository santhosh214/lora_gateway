const { parseApiError } = require('../common/parseApiError')
const deviceService = require('../services/device.service')
const propertyService = require('../services/property.service')
const devicePropertyDataItemService = require('../services/devicePropertyDataItem.service')
const { NotFoundError } = require('../errors/NotFoundError')
const { ArgumentError } = require('../errors/ArgumentError')

const getDeviceByDsn = async (req, res) => {
  try {
    const {
      params: { dsn },
    } = req
    const device = await deviceService.getDeviceByDSN(dsn)
    res.status(200).json(device)
  } catch (error) {
    console.error('Error retrieving device by dsn', error)
    const { errorMessage, status } = parseApiError(error)
    res.status(status).json({ error: errorMessage })
  }
}

const getDevicePropertiesByDsn = async (req, res) => {
  try {
    const {
      params: { dsn },
    } = req
    const deviceProperties = await deviceService.getPropertiesByDeviceDSN(dsn)
    res.status(200).json(deviceProperties)
  } catch (error) {
    console.error('Error retrieving device properties by dsn', error)
    const { errorMessage, status } = parseApiError(error)
    res.status(status).json({ error: errorMessage })
  }
}

const getDeviceAddressByDsn = async (req, res) => {
  try {
    const {
      params: { dsn },
    } = req
    const deviceAddress = await deviceService.getDeviceAddressByDsn(dsn)
    res.status(200).json(deviceAddress)
  } catch (error) {
    console.error('Error retrieving device address by dsn', error)
    const { errorMessage, status } = parseApiError(error)
    res.status(status).json({ error: errorMessage })
  }
}

/**
 * Retrieves the devices given the list of dsns.
 */
const getDevicesByDsns = async (req, res) => {
  const {
    query: { dsns },
  } = req

  try {
    const devices = await deviceService.getDevicesByDsns(dsns)

    res.send(devices)
  } catch (e) {
    console.error(`An error occurred while getting the devices by dsns: ${dsns}`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const getDeviceMetadata = async (req, res) => {
  try {
    const {
      params: { dsn },
    } = req
    const deviceProperties = await deviceService.getMetadata(dsn)
    res.status(200).json(deviceProperties)
  } catch (error) {
    console.error('Error retrieving device metadata by dsn', error)
    const { errorMessage, status } = parseApiError(error)
    res.status(status).json({ error: errorMessage })
  }
}

/**
 * Retrieves the device property given the dsn and property name.
 */
const getDevicePropertyByDsnAndPropertyName = async (req, res) => {
  const {
    params: { dsn, propertyName },
  } = req

  try {
    const property = await propertyService.getDevicePropertyByDsnAndPropertyName(dsn, propertyName)

    res.send(property)
  } catch (e) {
    console.error(
      `An error occurred while getting the device property. dsn: ${dsn}, propertyName: ${propertyName}`,
      e.message,
    )

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const updateDeviceAddressByDsn = async (req, res) => {
  try {
    const {
      params: { dsn },
    } = req
    const deviceAddress = { ...req.body }
    const deviceId = await deviceService.updateDeviceAddressByDsn(dsn, deviceAddress)
    res.status(200).json({ deviceId })
  } catch (error) {
    console.error('Error updating device address by dsn', error)
    const { errorMessage, status } = parseApiError(error)
    res.status(status).json({ error: errorMessage })
  }
}

/**
 * Returns Gateway Details with the node.
 */
const getGatewayDetails = async (req, res) => {
  const {
    params: { dsn },
  } = req
  try {
    const response = await deviceService.getGatewayDetails(dsn)

    res.send(response)
  } catch (e) {
    console.error(`An error occurred while get gateway details`, e)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

/**
 * Registers a device by dsn.
 */
const registerDeviceByDsn = async (req, res) => {
  const {
    params: { dsn },
    body: userUuid,
  } = req

  try {
    const response = await deviceService.registerDevice(dsn, userUuid)

    res.send(response)
  } catch (e) {
    console.error(`An error occurred while registering a device: ${dsn}`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const getDeviceDatapointsByDsnAndPropertyName = async (req, res) => {
  const {
    params: { dsn, propertyName },
    query: { limit },
  } = req

  try {
    const response = await deviceService.getDeviceDatapointsByDsnAndPropertyName(dsn, propertyName, limit)

    res.send(response)
  } catch (e) {
    console.error(`An error occurred at create datapoint for device property`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const getDeviceDetailsByDsn = async (req, res) => {
  const {
    params: { dsn },
  } = req

  try {
    const deviceDetails = await deviceService.getGatewayDetails(dsn)
    const deviceProperties = await deviceService.getPropertiesByDeviceDSN(dsn)
    res.send({ deviceDetails, deviceProperties })
  } catch (e) {
    console.error(`An error occurred at getAllDetailsByDsns for device`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const getHistoryAlertsByDeviceDsn = async (req, res) => {
  const {
    params: { dsn },
    query: { page, limit, startDate, endDate },
  } = req

  try {
    const response = await deviceService.getHistoryAlertsByDeviceDsns(dsn, startDate, endDate, page, limit)

    res.send(response)
  } catch (e) {
    console.error(`An error occurred when fetching history alerts for device`, e.message)
    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const getThermostatSystemMode = async (req, res) => {
  try {
    const {
      params: { dsn },
      query: { createdAtSince, createdAtEnd },
    } = req

    if (!createdAtSince || !createdAtEnd)
      return res.status(400).send({ errorMessage: 'required  createdAtSince, createdAtEnd' })

    const result = await deviceService.getThermostatSystemMode(dsn, createdAtSince, createdAtEnd)
    res.status(200).send(result)
  } catch (e) {
    const { errorMessage, status } = parseApiError(e)
    res.status(status).send({ status, errorMessage })
  }
}

const getAllDeviceDatapoints = async (req, res) => {
  const {
    params: { dsn },
    query,
  } = req

  try {
    const response = await deviceService.getAllDeviceDatapoints(dsn, query)

    res.send(response)
  } catch (e) {
    console.error(`An error occurred while getting a device datapoints`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const getAllDevicePropertyDataItems = async (req, res) => {
  const { dsn, propertyName } = req.params
  try {
    const dataItems = await devicePropertyDataItemService.getAllDevicePropertyDataItems(dsn, propertyName)

    res.send(dataItems)
  } catch (error) {
    console.error(
      `An error occurred while getting the data items by dsn: ${dsn} and property name: ${propertyName}`,
      error.message,
    )

    if (error instanceof ArgumentError) {
      console.error('ArgumentError', error.message)
      return res.status(400).json({ errorMessage: error.message })
    }

    const { errorMessage, status } = parseApiError(error)

    res.status(status).send({ status, errorMessage })
  }
}

const getDevicePropertyDataItemById = async (req, res) => {
  const {
    params: { dsn, propertyName, dataItemId },
  } = req

  try {
    const dataItem = await devicePropertyDataItemService.getDevicePropertyDataItemById(dsn, propertyName, dataItemId)

    res.send(dataItem)
  } catch (error) {
    console.error(
      `An error occurred while getting the data item by dsn: ${dsn} and property name: ${propertyName} and data item id: ${dataItemId}`,
      error.message,
    )

    if (error instanceof NotFoundError) {
      return res.status(404).json({ errorMessage: error.message })
    }

    const { errorMessage, status } = parseApiError(error)

    res.status(status).send({ status, errorMessage })
  }
}

const createDevicePropertyDataItem = async (req, res) => {
  const { dsn, propertyName } = req.params
  const dataItem = req.body

  try {
    const dataItemCreated = await devicePropertyDataItemService.createDevicePropertyDataItem(dsn, propertyName, dataItem)

    return res.status(201).json(dataItemCreated)
  } catch (error) {
    console.error(
      `An error occurred while creating the data item by dsn: ${dsn} and property name: ${propertyName}`,
      error.message,
    )

    const { errorMessage, status } = parseApiError(error)
    const errorStatus = status || 500

    return res.status(errorStatus).json({ errorMessage })
  }
}

const updateDevicePropertyDataItem = async (req, res) => {
  const { dsn, propertyName, dataItemId } = req.params
  const dataItem = req.body

  try {
    const dataItemUpdated = await devicePropertyDataItemService.updateDevicePropertyDataItem(
      dsn,
      propertyName,
      dataItemId,
      dataItem,
    )

    return res.status(200).json(dataItemUpdated)
  } catch (error) {
    console.error(
      `An error occurred while updating the data item by dsn: ${dsn} and property name: ${propertyName} and data item id: ${dataItemId}`,
      error.message,
    )

    if (error instanceof NotFoundError) {
      return res.status(404).json({ errorMessage: error.message })
    }

    const { errorMessage, status } = parseApiError(error)
    const errorStatus = status || 500

    return res.status(errorStatus).json({ errorMessage })
  }
}

const deleteDevicePropertyDataItem = async (req, res) => {
  const { dsn, propertyName, dataItemId } = req.params
  try {
    await devicePropertyDataItemService.deleteDevicePropertyDataItem(dsn, propertyName, dataItemId)

    return res.status(200).send()
  } catch (error) {
    console.error(
      `An error occurred while deleting the data item by dsn: ${dsn} and property name: ${propertyName} and data item id: ${dataItemId}`,
      error.message,
    )

    if (error instanceof NotFoundError) {
      return res.status(404).json({ errorMessage: error.message })
    }

    const { errorMessage, status } = parseApiError(error)
    const errorStatus = status || 500

    return res.status(errorStatus).json({ errorMessage })
  }
}

const createDeviceMessageDatapoint = async (req, res) => {
  const { dsn, propertyName } = req.params
  const dataPoint = req.body

  try {
    const response = await deviceService.createMessageDatapointByPropertyName(dsn, propertyName, dataPoint.value)

    return res.status(201).json(response)
  } catch (error) {
    console.error(
      `An error occurred while creating a message datapoint by dsn: ${dsn} and property name: ${propertyName}`,
      error.message,
    )

    const { errorMessage, status } = parseApiError(error)
    const errorStatus = status || 500

    return res.status(errorStatus).json({ errorMessage })
  }
}

const getLatestDeviceMessageDatapoint = async (req, res) => {
  const { dsn, propertyName } = req.params

  try {
    const response = await deviceService.getLatestDeviceMessagePropertyValue(dsn, propertyName)

    return res.status(200).json(response)
  } catch (error) {
    console.error(
      `An error occurred while getting latest device message property value by dsn: ${dsn} and property name: ${propertyName}`,
      error.message,
    )

    const { errorMessage, status } = parseApiError(error)
    const errorStatus = status || 500

    return res.status(errorStatus).json({ errorMessage })
  }
}

const uploadFileDatapoint = async (req, res) => {
  const {
    params: { dsn, propertyName },
    file,
  } = req

  try {
    const response = await deviceService.uploadFileDatapointByDsn(dsn, propertyName, file)

    res.status(201).send(response.data)
  } catch (e) {
    console.error(`An error occurred while uploading the datapoints file for device ${dsn}`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const downloadFileDatapoint = async (req, res) => {
  const {
    params: { dsn, propertyName, datapointId },
  } = req

  try {
    const file = await deviceService.downloadFileDatapointByDsn(dsn, propertyName, datapointId)

    const decodedFile = Buffer.from(file, 'base64')

    res.end(decodedFile)
  } catch (e) {
    console.error(`An error occurred while getting a device datapoints`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const getDevicePropertyDataItemValues = async (req, res) => {
  const {
    params: { dsn, propertyName },
    query: { limit, previous, next, startDate, endDate },
  } = req

  try {
    const response = await deviceService.getDataPointsValuesForDeviceByDsn(dsn, {
      propertyName,
      limit,
      previous,
      next,
      startDate,
      endDate,
    })

    res.status(200).send(response)
  } catch (e) {
    console.error(`An error occurred while getting a device datapoints`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

const getDeviceExtendedData = async (req, res) => {
  try {
    const { dsn } = req.params
    const details = await deviceService.getDeviceExtendedData(dsn)
    res.status(200).json(details)
  } catch (error) {
    console.error(`An error occurred while getting device extended data`, error.message)
    if (error instanceof ArgumentError) {
      return res.status(400).json({ errorMessage: error.message })
    }
    const { errorMessage, status } = parseApiError(error)
    const errorStatus = status || 500
    return res.status(errorStatus).json({ errorMessage })
  }
}

module.exports = {
  getDeviceByDsn,
  getDevicePropertiesByDsn,
  getDeviceAddressByDsn,
  getDevicesByDsns,
  getDeviceMetadata,
  getDevicePropertyByDsnAndPropertyName,
  updateDeviceAddressByDsn,
  getGatewayDetails,
  registerDeviceByDsn,
  getDeviceDatapointsByDsnAndPropertyName,
  getDeviceDetailsByDsn,
  getHistoryAlertsByDeviceDsn,
  getAllDeviceDatapoints,
  getAllDevicePropertyDataItems,
  getDevicePropertyDataItemById,
  createDevicePropertyDataItem,
  updateDevicePropertyDataItem,
  deleteDevicePropertyDataItem,
  createDeviceMessageDatapoint,
  getLatestDeviceMessageDatapoint,
  uploadFileDatapoint,
  downloadFileDatapoint,
  getThermostatSystemMode,
  getDevicePropertyDataItemValues,
  getDeviceExtendedData,
}
