const { v4: uuidv4 } = require('uuid')
const { handleApiError } = require('../common/utils')
const { VantivaError } = require('../errors/VantivaError')
const { NotFoundError } = require('../errors/NotFoundError')
const { ArgumentError } = require('../errors/ArgumentError')
const deviceService = require('./device.service')

const getAllDevicePropertyDataItems = async (dsn, propertyName) => {
  try {
    const deviceMessageProperty = await deviceService.getDevicePropertyByName(dsn, propertyName)

    // Getting data point id from the last part of the message property value
    if (!deviceMessageProperty || deviceMessageProperty.value === null) {
      return []
    }

    if (deviceMessageProperty.baseType !== 'string') {
      throw new ArgumentError(`Property ${propertyName} must be of type string`)
    }

    const messageDatapoint = deviceMessageProperty.value

    if (!messageDatapoint) {
      return []
    }

    const dataItems = JSON.parse(messageDatapoint)

    return dataItems
  } catch (error) {
    if (error instanceof VantivaError) {
      throw error
    }

    handleApiError(error, `getting all data items by dsn: ${dsn} and property name: ${propertyName}`)
  }
}

const getDevicePropertyDataItemById = async (dsn, propertyName, dataItemId) => {
  const dataItems = await getAllDevicePropertyDataItems(dsn, propertyName)

  const dataItem = dataItems.find(item => item.id === dataItemId)

  if (!dataItem) {
    throw new NotFoundError(`Data item with id ${dataItemId} not found for dsn: ${dsn} and property name: ${propertyName}`)
  }

  return dataItem
}

const createDevicePropertyDataItem = async (dsn, propertyName, dataItemData) => {
  const dataItems = await getAllDevicePropertyDataItems(dsn, propertyName)
  const dataItemId = uuidv4()
  // eslint-disable-next-line no-unused-vars
  const { id: _, ...restOfDataItem } = dataItemData
  const newDataItem = {
    id: dataItemId,
    ...restOfDataItem,
  }

  dataItems.push(newDataItem)
  const newDataItemDatapointValue = JSON.stringify(dataItems)
  const deviceDetails = await deviceService.getDeviceByDSN(dsn)
  await deviceService.createDataPointForDeviceProperty(deviceDetails.id, propertyName, newDataItemDatapointValue)

  return newDataItem
}

const updateDevicePropertyDataItem = async (dsn, propertyName, dataItemId, dataItemData) => {
  const dataItems = await getAllDevicePropertyDataItems(dsn, propertyName)
  const dataItemIndex = dataItems.findIndex(item => item.id === dataItemId)
  if (dataItemIndex === -1) {
    throw new NotFoundError(`Data item with id ${dataItemId} not found for dsn: ${dsn} and property name: ${propertyName}`)
  }

  // eslint-disable-next-line no-unused-vars
  const { id: _, ...restOfDataItemData } = dataItemData
  const dataItemToUpdate = {
    id: dataItemId,
    ...restOfDataItemData,
  }
  dataItems[dataItemIndex] = dataItemToUpdate

  const newDataItemsDatapointValue = JSON.stringify(dataItems)
  const deviceDetails = await deviceService.getDeviceByDSN(dsn)
  await deviceService.createDataPointForDeviceProperty(deviceDetails.id, propertyName, newDataItemsDatapointValue)

  return dataItemToUpdate
}

const deleteDevicePropertyDataItem = async (dsn, propertyName, dataItemId) => {
  const dataItems = await getAllDevicePropertyDataItems(dsn, propertyName)
  const dataItemIndex = dataItems.findIndex(item => item.id === dataItemId)
  if (dataItemIndex === -1) {
    throw new NotFoundError(`Data item with id ${dataItemId} not found for dsn: ${dsn} and property name: ${propertyName}`)
  }

  dataItems.splice(dataItemIndex, 1)

  const newDataItemsDatapointValue = JSON.stringify(dataItems)
  const deviceDetails = await deviceService.getDeviceByDSN(dsn)
  await deviceService.createDataPointForDeviceProperty(deviceDetails.id, propertyName, newDataItemsDatapointValue)
}

module.exports = {
  getAllDevicePropertyDataItems,
  getDevicePropertyDataItemById,
  createDevicePropertyDataItem,
  updateDevicePropertyDataItem,
  deleteDevicePropertyDataItem,
}
