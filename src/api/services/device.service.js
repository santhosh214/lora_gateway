const { aylaClient, aylaClientNoAuth } = require('../client/ayla.axios')
const { ArgumentError } = require('../errors/ArgumentError')

const {
  getDeviceByIdEndPoint,
  getDeviceByDsnEndPoint,
  getApplyTemplateToDeviceEndPoint,
  getCreateDataPointForDevicePropertyEndPoint,
  getSearchDevicesByOemModelAndTemplateEndPoint,
  getPropertiesByDeviceDsnEndPoint,
  getDeviceAddressByIdEndPoint,
  getRenameDeviceByIdEndPoint,
  AYLA_DEVICE_ENDPOINT,
  getDeviceMetadata,
  getRenameDeviceByDsnEndPoint,
  getAllNodesEndpoint,
  getDataPointForDevicePropertyEndPoint,
  getUnregisterDeviceEndpoint,
  getRegisterDeviceEndpoint,
  getAlertHistoryForDeviceEndpoint,
  getDataPointForDevicePropertyEndPointWithLimit,
  getDSNByMacAndSerialNumberEndPoint,
  getConectionHistoryByDeviceEndPoint,
  getAddConectionHistoryForDeviceEndPoint,
  getDevicePropertyByNameAndDSNEndPoint,
  getDataPointByPropertyNameAndDSNAndIdEndPoint,
  getCreateMessageDatapointByPropertynNameAndDSNEndPoint,
  getDataPointsCreateFileForDeviceEndpoint,
  getDataPointByDataPointIdEndpoint,
  getDataPointForDevicePropertyEndPointWithPagination,
} = require('../common/aylaEndPoints')
const {
  checkResponseStatus,
  handleApiError,
  getDeviceInfoByOemModel,
  parseFromSnakeCaseToCamelCase,
  validateGetConnectionHistoryArguments,
  validateAddConnectionHistoryArguments,
  mapConnectionHistory,
  mergeThermostatDataPoints,
  isBase64,
  buildDeviceExtendedData,
} = require('../common/utils')

const { DEVICE_PROPERTY_BASE_TYPE_FILE, THERMOSTAT_DATA_POINT } = require('../common/constants')

const formatDatapoint = datapoint => ({
  updatedAt: datapoint.updated_at || undefined,
  createdAt: datapoint.created_at || undefined,
  createdAtFromDevice: datapoint.created_at_from_device || undefined,
  value: datapoint.value,
  id: datapoint.id,
  generatedFrom: datapoint.generated_from || undefined,
  metadata: datapoint.metadata || undefined,
  dsn: datapoint.dsn,
  propertyName: datapoint.propertyName,
})

const calculateOnlineOfflineCounts = deviceDetail => {
  const finalCount = {}
  const { nodes_count: nodesCount } = deviceDetail

  const onlineCount = deviceDetail.nodes.filter(element => element.connection_status === 'Online').length
  const offlineCount = deviceDetail.nodes.filter(element => element.connection_status === 'Offline').length
  finalCount.online_count = onlineCount
  finalCount.offline_count = offlineCount

  if (nodesCount === 0) {
    finalCount.online_percentage = 0
    finalCount.offline_percentage = 0
  } else {
    finalCount.online_percentage = (onlineCount / nodesCount) * 100
    finalCount.offline_percentage = (offlineCount / nodesCount) * 100
  }

  return finalCount
}

const getDeviceByDSN = async dsn => {
  let response
  try {
    response = await aylaClient.get(getDeviceByDsnEndPoint(dsn))
  } catch (error) {
    handleApiError(error, 'get device by DSN')
  }

  checkResponseStatus(response, 'Error retrieving device by DSN')

  return response.data.device
}

const getDeviceById = async id => {
  let response
  try {
    response = await aylaClient.get(getDeviceByIdEndPoint(id))
  } catch (error) {
    handleApiError(error, 'get device by id')
  }

  checkResponseStatus(response, 'Error retrieving device by id')

  return response.data.device
}

const applyTemplateToDevice = async (templateId, deviceId) => {
  let response
  try {
    response = await aylaClient.put(getApplyTemplateToDeviceEndPoint(templateId, deviceId))
  } catch (error) {
    handleApiError(error, 'apply template to device')
  }

  checkResponseStatus(response, 'Error applying template to device')
}

const createDataPointForDeviceProperty = async (deviceId, propertyName, value) => {
  let response
  try {
    const datapoint = {
      value,
    }
    response = await aylaClient.post(getCreateDataPointForDevicePropertyEndPoint(deviceId, propertyName), { datapoint })
  } catch (error) {
    handleApiError(error, `create data point for device id ${deviceId}, and property ${propertyName}`)
  }

  checkResponseStatus(response, `Error creating data point for device id ${deviceId}, and property ${propertyName}`)
}

const getDevicesByOemModelAndTemplate = async (oemModel, templateId, page = 0, pageSize = 10) => {
  let response
  try {
    response = await aylaClient.get(getSearchDevicesByOemModelAndTemplateEndPoint(oemModel, templateId, page, pageSize))
  } catch (error) {
    handleApiError(error, `get devices by oem model ${oemModel} and template id ${templateId}`)
  }

  checkResponseStatus(response, `Error getting devices by oem model ${oemModel} and template id ${templateId}`)

  return response.data
}

const getPropertiesByDeviceDSN = async dsn => {
  let response
  try {
    response = await aylaClient.get(getPropertiesByDeviceDsnEndPoint(dsn))
  } catch (error) {
    handleApiError(error, `get properties by device dsn ${dsn}`)
  }

  checkResponseStatus(response, `Error getting properties by device dsn ${dsn}`)

  return response.data
}

const getDeviceAddress = async deviceId => {
  let response
  try {
    response = await aylaClient.get(getDeviceAddressByIdEndPoint(deviceId))
  } catch (error) {
    handleApiError(error, `get device address ${deviceId}`)
  }

  checkResponseStatus(response, `Error updating device address by id ${deviceId}`)

  return response.data.addr
}

const getDeviceAddressByDsn = async dsn => {
  let response
  try {
    const device = await getDeviceByDSN(dsn)
    response = await aylaClient.get(getDeviceAddressByIdEndPoint(device.id))
  } catch (error) {
    handleApiError(error, `get device address ${dsn}`)
  }

  checkResponseStatus(response, `Error updating device address by id ${dsn}`)

  return response.data.addr
}

const updateDeviceAddress = async (deviceId, { street, city, state, country, zip }) => {
  let response
  try {
    const addr = {
      street,
      city,
      state,
      country,
      zip,
    }
    response = await aylaClient.put(getDeviceAddressByIdEndPoint(deviceId), { addr })
  } catch (error) {
    handleApiError(error, `update device address ${deviceId}`)
  }

  checkResponseStatus(response, `Error retrieving device address by id ${deviceId}`)

  return response.data.addr
}

const updateDeviceAddressByDsn = async (dsn, address) => {
  // Note. Since Ayla does not provide an endpoint to update the device address by DSN,
  // we need to retrieve the device id first, and then update the device address by id.
  const device = await getDeviceByDSN(dsn)
  await updateDeviceAddress(device.id, address)
  return device.id
}

const updateDeviceNameById = async (deviceId, newName) => {
  let response
  try {
    const device = {
      product_name: newName,
    }
    response = await aylaClient.put(getRenameDeviceByIdEndPoint(deviceId), { device })
  } catch (error) {
    handleApiError(error, `update device name for ${deviceId}`)
  }

  checkResponseStatus(response, `Error updating device name by id ${deviceId}`)

  return response.data.addr
}

const renameDeviceByDsn = async (dsn, newName) => {
  let response
  try {
    const device = {
      product_name: newName,
    }
    response = await aylaClient.put(getRenameDeviceByDsnEndPoint(dsn), { device })
  } catch (error) {
    handleApiError(error, `update device name for ${dsn}`)
  }

  checkResponseStatus(response, `Error updating device name by dsn ${dsn}`)

  return response.data.addr
}

/**
 * Retrieves the device list for the given device DSNs.
 */
const getDevicesByDsns = async dsns => {
  const dsnList = dsns.split(',')
  const devices = []
  // eslint-disable-next-line no-restricted-syntax
  for await (const dsn of dsnList) {
    const device = await getDeviceByDSN(dsn)
    if (device) {
      const deviceInfo = getDeviceInfoByOemModel(device.oem_model)

      devices.push({ ...device, ...deviceInfo })
    }
  }

  return devices
}

/**
 * Retrieves the device properties given the device DSN.
 */
const getAllDevices = async isSensor => {
  let response = []
  try {
    const { data: devices } = await aylaClient.get(AYLA_DEVICE_ENDPOINT)

    if (isSensor) {
      response = devices.filter(device => {
        const dev = getDeviceInfoByOemModel(device.device.oem_model)
        return dev && dev.is_sensor
      })
    } else {
      response = devices
    }
  } catch (error) {
    handleApiError(error, 'get all devices')
  }

  return response
}

const getMetadata = async dsn => {
  let response
  try {
    const { data } = await aylaClient.get(getDeviceMetadata(dsn))
    response = data
  } catch (error) {
    handleApiError(error, 'get metadata')
  }

  return response
}

const getAllNodesByDeviceId = async deviceId => {
  let response
  try {
    response = await aylaClient.get(getAllNodesEndpoint(deviceId))
  } catch (error) {
    handleApiError(error, 'get all nodes')
  }

  checkResponseStatus(response, `Error retrieving all nodes for deviceId: ${deviceId}`)

  return response.data
}

const registerDevice = async (dsn, userUuid) => {
  let response
  try {
    response = await aylaClient.put(getRegisterDeviceEndpoint(dsn), {
      user_uuid: userUuid,
    })
  } catch (error) {
    handleApiError(error, 'register device')
  }
  checkResponseStatus(response, `Error registering device`)

  return response.data
}

const unregisterDevice = async deviceId => {
  let response
  try {
    response = await aylaClient.put(getUnregisterDeviceEndpoint(deviceId))
  } catch (error) {
    handleApiError(error, 'unregister device')
  }
  checkResponseStatus(response, `Error unregistering device`)

  return response.data
}

const getGatewayDetails = async dsn => {
  let response
  try {
    const deviceDetail = await getDeviceByDSN(dsn)
    const propertyNames = getDeviceInfoByOemModel(deviceDetail.oem_model)

    if (!deviceDetail.nodes) {
      deviceDetail.nodes = []
    }

    const nodesCount = deviceDetail.nodes.length
    deviceDetail.nodes_count = nodesCount

    const allApis = []

    deviceDetail.nodes.forEach(item => {
      allApis.push(getPropertiesByDeviceDSN(item.dsn))
    })

    const responses = await Promise.all(allApis)

    responses.forEach((property, index) => {
      const properties = property.reduce((prevItem, currentItem) => {
        return {
          ...prevItem,
          [currentItem.property.name]: currentItem.property.value,
        }
      }, {})

      deviceDetail.nodes[index] = {
        ...deviceDetail.nodes[index],
        properties,
      }
    })

    const finalNodesCount = calculateOnlineOfflineCounts(deviceDetail)

    response = { ...deviceDetail, ...finalNodesCount, ...propertyNames }
  } catch (error) {
    handleApiError(error, 'get gateway details')
  }

  return response
}

const getDeviceDatapointsByDsnAndPropertyName = async (dsn, propertyName, limit) => {
  let response
  try {
    const propertyDatapoints = await aylaClient.get(getDataPointForDevicePropertyEndPointWithLimit(dsn, propertyName, limit))
    response = propertyDatapoints.data.map(item => item.datapoint)
  } catch (error) {
    handleApiError(error, `get property data for device id ${dsn}, and property ${propertyName}`)
  }

  return response
}

const getHistoryAlertsByDeviceDsns = async (dsns, startDate, endDate, page = 1, pageSize = 10) => {
  let response
  try {
    const alertHistory = await aylaClient.get(getAlertHistoryForDeviceEndpoint(dsns, startDate, endDate, page, pageSize))

    const {
      data: {
        alert_histories: alerts,
        previous_page: previousPage,
        next_page: nextPage,
        current_page_number: currentPage,
        total,
      },
    } = alertHistory

    const oemModel = alerts.length > 0 ? alerts[0].alert_history.raw_message.device.oem_model : ''
    const device = getDeviceInfoByOemModel(oemModel)

    const alertHistories = alerts.map(({ alert_history: alert }) => {
      const camelCaseAlert = parseFromSnakeCaseToCamelCase(alert)

      const { sentAt, contentDescription, propertyValue, propertyName } = camelCaseAlert

      return {
        sentAt,
        contentDescription,
        genericName: device ? device.generic_name : null,
        propertyValue,
        propertyName,
      }
    })

    response = {
      previousPage,
      nextPage,
      currentPage,
      total,
      alertHistories,
    }
  } catch (error) {
    handleApiError(error, `get history alerts for device ${dsns}`)
  }

  return response
}

/**
 * Retrieves the datapoints for given dsn, property and pagination query params.
 */
const getDeviceDatapointsByPropertyNameAndDate = async (dsn, propertyName, { ...params }) => {
  let response

  try {
    const {
      data: { meta, datapoints },
    } = await aylaClient.get(getDataPointForDevicePropertyEndPoint(dsn, propertyName), { params })

    response = { meta, datapoints: datapoints.map(row => formatDatapoint({ ...row.datapoint, dsn, propertyName })) }
  } catch (error) {
    handleApiError(error, `get datapoints for device id ${dsn}, and property ${propertyName}`)
  }
  return response
}

const getAllDeviceDatapoints = async (dsn, query) => {
  const { propertyName, ...params } = query
  const newDatapoints = []
  let datapointsData = {}

  let next = ''

  next = ''
  while (next !== null) {
    // eslint-disable-next-line no-await-in-loop
    const { meta, datapoints } = await getDeviceDatapointsByPropertyNameAndDate(dsn, propertyName, {
      ...params,
      per_page: 100,
      paginated: true,
      is_forward_page: true,
      next: next || undefined,
    })

    newDatapoints.push(...datapoints)
    next = meta.next_page
  }
  datapointsData = { propertyName, datapoints: newDatapoints }

  return { datapointsData }
}

const getThermostatLastDataPoints = async (propertyNames, dsn, date) => {
  const params = { filter: { created_at_end_date: date }, paginated: true, per_page: 1 } // Created on or before this date.

  const promises = propertyNames.map(propertyName => getDeviceDatapointsByPropertyNameAndDate(dsn, propertyName, params))
  const setPointList = await Promise.all(promises)

  const oldSetPoints = { actual: null, heating: null, cooling: null }

  setPointList?.forEach(setPoints => {
    const propertyName = setPoints?.datapoints?.[0]?.propertyName
    const value = setPoints?.datapoints?.[0]?.value || null

    if (propertyName === THERMOSTAT_DATA_POINT.COOL_SETPOINT_READ) {
      oldSetPoints.cooling = value
    } else if (propertyName === THERMOSTAT_DATA_POINT.HEAT_SETPOINT_READ) {
      oldSetPoints.heating = value
    } else if (propertyName === THERMOSTAT_DATA_POINT.LOCAL_TEMP) {
      oldSetPoints.actual = value
    }
  })

  return oldSetPoints
}

const getThermostatSystemMode = async (dsn, createdAtSince, createdAtEnd) => {
  const propertyNames = [
    THERMOSTAT_DATA_POINT.COOL_SETPOINT_READ,
    THERMOSTAT_DATA_POINT.HEAT_SETPOINT_READ,
    THERMOSTAT_DATA_POINT.LOCAL_TEMP,
  ]
  const setPoints = { actual: [], heating: [], cooling: [] }

  for (let index = 0; index < propertyNames.length; index += 1) {
    const dataPoints = []
    const propertyName = propertyNames[index]
    let next = ''
    while (next !== null) {
      // eslint-disable-next-line no-await-in-loop
      const { meta, datapoints } = await getDeviceDatapointsByPropertyNameAndDate(dsn, propertyName, {
        filter: { created_at_since_date: createdAtSince, created_at_end_date: createdAtEnd },
        per_page: 100,
        paginated: true,
        is_forward_page: true,
        next: next || undefined,
      })

      dataPoints.push(...datapoints)
      next = meta.next_page
    }

    if (propertyName === THERMOSTAT_DATA_POINT.COOL_SETPOINT_READ) {
      setPoints.cooling = dataPoints
    } else if (propertyName === THERMOSTAT_DATA_POINT.HEAT_SETPOINT_READ) {
      setPoints.heating = dataPoints
    } else if (propertyName === THERMOSTAT_DATA_POINT.LOCAL_TEMP) {
      setPoints.actual = dataPoints
    }
  }

  const lastDataPoints = await getThermostatLastDataPoints(propertyNames, dsn, createdAtSince)
  return mergeThermostatDataPoints(createdAtSince, createdAtEnd, setPoints, lastDataPoints)
}

const getDataPointsForDevicePropertyEndPoint = async (
  dsn,
  { propertyName, limit, isPaginated, orderAttribute, direction, previous, next, startDate, endDate },
) => {
  let response

  try {
    const {
      data: { meta, datapoints },
    } = await aylaClient.get(
      getDataPointForDevicePropertyEndPointWithPagination(dsn, propertyName, {
        limit,
        isPaginated,
        orderAttribute,
        direction,
        previous: previous || undefined,
        next: next || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    )

    response = { meta, datapoints: datapoints.map(row => formatDatapoint({ ...row.datapoint, dsn, propertyName })) }
  } catch (error) {
    handleApiError(error, `get datapoints for device id ${dsn}, and property ${propertyName}`)
  }
  return response
}

const getDSNByMacAndSerialNumber = async (macAddress, serialNumber) => {
  let response
  try {
    const { data } = await aylaClient.get(getDSNByMacAndSerialNumberEndPoint(macAddress || '', serialNumber || ''))
    if (data) {
      response = data.devices
    }
  } catch (error) {
    handleApiError(error, `get DSN by Mac Address and Serial Number`)
  }
  return response
}

const getConnectionHistoryByDeviceId = async (
  deviceId,
  page = 1,
  limit = 10,
  sortBy = 'eventTime',
  sortDirection = 'desc',
) => {
  validateGetConnectionHistoryArguments(deviceId, page, limit, sortBy, sortDirection)

  const aylaSortByMap = {
    eventTime: 'event_time',
    status: 'status',
  }
  const aylaSortBy = aylaSortByMap[sortBy]

  let response
  try {
    response = await aylaClient.get(getConectionHistoryByDeviceEndPoint(deviceId, page, limit, aylaSortBy, sortDirection))
  } catch (error) {
    handleApiError(error, `Error getting connection history for device: ${deviceId}`)
  }

  checkResponseStatus(response, `Error getting connection history for device: ${deviceId}`)

  return response.data.map(mapConnectionHistory)
}

const addDeviceConnectionHistory = async (deviceId, status, eventTime) => {
  validateAddConnectionHistoryArguments(deviceId, status, eventTime)

  let response
  try {
    const payload = {
      connection: {
        status,
        event_time: eventTime,
      },
    }
    response = await aylaClient.post(getAddConectionHistoryForDeviceEndPoint(deviceId), payload, {
      headers: {
        Accept: 'application/json',
      },
    })
  } catch (error) {
    handleApiError(error, `Error creating connection history for device: ${deviceId}`)
  }

  checkResponseStatus(response, `Error creating connection history for device: ${deviceId}`)

  return mapConnectionHistory(response.data)
}

const getDevicePropertyByName = async (dsn, propertyName) => {
  let response
  try {
    response = await aylaClient.get(getDevicePropertyByNameAndDSNEndPoint(propertyName, dsn), {
      headers: {
        Accept: 'application/json',
      },
    })
  } catch (error) {
    handleApiError(error, `get device property by name: ${propertyName} and dsn: ${dsn}`)
  }

  checkResponseStatus(response, `Error getting device property by name: ${propertyName} and dsn: ${dsn}`)

  return parseFromSnakeCaseToCamelCase(response.data.property)
}

const getDatapointByPropertyNameAndId = async (dsn, propertyName, datapointId) => {
  let response
  try {
    response = await aylaClient.get(getDataPointByPropertyNameAndDSNAndIdEndPoint(dsn, propertyName, datapointId))
  } catch (error) {
    handleApiError(error, `get datapoint by property name: ${propertyName.name} and dsn: ${dsn} and id: ${datapointId}`)
  }

  checkResponseStatus(
    response,
    `Error getting datapoint by property name: ${propertyName.name} and dsn: ${dsn} and id: ${datapointId}`,
  )

  return response.data.datapoint
}

const createMessageDatapointByPropertyName = async (dsn, propertyName, datapoint) => {
  let response
  try {
    const payload = {
      datapoint: {
        value: datapoint,
      },
    }
    response = await aylaClient.post(getCreateMessageDatapointByPropertynNameAndDSNEndPoint(propertyName, dsn), payload)
  } catch (error) {
    handleApiError(error, `create datapoint by property name: ${propertyName} and dsn: ${dsn}`)
  }

  checkResponseStatus(response, `Error creating datapoint by property name: ${propertyName} and dsn: ${dsn}`)
}

const getLatestDeviceMessagePropertyValue = async (dsn, propertyName) => {
  try {
    const deviceMessageProperty = await getDevicePropertyByName(dsn, propertyName)

    if (deviceMessageProperty.baseType !== 'message') {
      throw new ArgumentError(`Property ${propertyName} must be of type message`)
    }

    // Getting data point id from the last part of the message property value
    if (!deviceMessageProperty || deviceMessageProperty.value === null) {
      return null
    }

    const messageValuesSplitted = deviceMessageProperty.value.split('/')
    const datapointId = messageValuesSplitted[messageValuesSplitted.length - 1]
    const messageDatapoint = await getDatapointByPropertyNameAndId(dsn, propertyName, datapointId)

    if (!messageDatapoint && !messageDatapoint.value) {
      return null
    }

    return messageDatapoint.value
  } catch (error) {
    handleApiError(error, `getting latest device message property value by dsn: ${dsn} and property name: ${propertyName}`)
  }
}

const validateProperty = async (dsn, propertyName, fileType) => {
  try {
    const response = await getDevicePropertyByName(dsn, propertyName)

    if (response.baseType !== fileType) {
      throw new Error('The property types is not valid to upload/download files')
    }
  } catch (error) {
    handleApiError(error, `the property ${propertyName} type is not valid to upload/download files fos dsn ${dsn}`)
  }
}

const uploadFileDatapointByDsn = async (dsn, propertyName, fileData) => {
  let response

  try {
    await validateProperty(dsn, propertyName, DEVICE_PROPERTY_BASE_TYPE_FILE)

    const createFileResponse = await aylaClient.post(getDataPointsCreateFileForDeviceEndpoint(dsn, propertyName))

    await aylaClientNoAuth.put(createFileResponse.data.datapoint.file, fileData, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })

    response = await aylaClient.put(createFileResponse.data.datapoint.value, {
      datapoint: {
        closed: 1,
      },
    })
  } catch (error) {
    handleApiError(error, `upload datapoints file for device id ${dsn}`)
  }

  return response
}

const getDataPointById = async (deviceId, propertyName, datapointId) => {
  let response

  try {
    response = await aylaClient.get(getDataPointByDataPointIdEndpoint(deviceId, propertyName, datapointId))
  } catch (error) {
    handleApiError(error, `get datapoint by id ${datapointId}, deviceId ${deviceId} and propertyName ${propertyName}`)
  }

  return response.data
}

const fetchAylaDocument = async fileUrl => {
  let response

  try {
    response = await aylaClientNoAuth.get(fileUrl, {
      responseType: 'arraybuffer',
    })

    if (isBase64(response.data)) {
      response = {
        ...response,
        data: Buffer.from(response.data).toString(),
      }
    } else {
      response = {
        ...response,
        data: Buffer.from(response.data, 'binary').toString('base64'),
      }
    }
  } catch (error) {
    handleApiError(error, `fetching file from ayla for url ${fileUrl}`)
  }

  return response.data
}

const downloadFileDatapointByDsn = async (dsn, propertyName, datapointId) => {
  let response

  try {
    await validateProperty(dsn, propertyName, DEVICE_PROPERTY_BASE_TYPE_FILE)

    const device = await getDeviceByDSN(dsn)

    const datapoint = await getDataPointById(device.id, propertyName, datapointId)

    const datapointInfo = await aylaClient.get(datapoint.datapoint.value)

    response = await fetchAylaDocument(datapointInfo.data.datapoint.file)
  } catch (error) {
    handleApiError(error, `download datapoints file for device id ${dsn}`)
  }

  return response
}

const getDataPointsValuesForDeviceByDsn = async (dsn, { propertyName, limit, previous, next, startDate, endDate }) => {
  let response

  try {
    const { meta, datapoints } = await getDataPointsForDevicePropertyEndPoint(dsn, {
      propertyName,
      limit,
      previous: previous || undefined,
      next: next || undefined,
      startDate,
      endDate,
    })

    const datapointsWithFileValue = []
    const errors = []

    for (let i = 0; i < datapoints.length; i += 1) {
      const datapoint = datapoints[i]
      let file = ''

      let datapointInfo = {}
      try {
        // eslint-disable-next-line no-await-in-loop
        datapointInfo = await aylaClient.get(datapoint.value)
        // eslint-disable-next-line no-await-in-loop
        file = await fetchAylaDocument(datapointInfo.data.datapoint.file)
      } catch (error) {
        console.error(`Error while getting file: ${datapointInfo?.data?.datapoint?.file}`)
        errors.push({
          dsn,
          datapointId: datapointInfo?.data?.datapoint?.id,
          errorMessage: error.message,
          errorCode: error.code,
        })
      }

      datapointsWithFileValue.push({ ...datapoint, file })
    }

    response = { meta, datapoints: datapointsWithFileValue, errors }
  } catch (error) {
    handleApiError(error, `get datapoints for device id ${dsn}, and property ${propertyName}`)
  }
  return response
}

const getDeviceExtendedData = async dsn => {
  const deviceDetailPromise = getDeviceByDSN(dsn)
  const devicePropertiesPromise = getPropertiesByDeviceDSN(dsn)

  const [deviceDetail, deviceProperties] = await Promise.all([deviceDetailPromise, devicePropertiesPromise])
  const extendedData = buildDeviceExtendedData(deviceDetail, deviceProperties)
  return extendedData
}

module.exports = {
  getDeviceById,
  getDeviceByDSN,
  applyTemplateToDevice,
  createDataPointForDeviceProperty,
  getDevicesByOemModelAndTemplate,
  getPropertiesByDeviceDSN,
  getDeviceAddress,
  getDeviceAddressByDsn,
  updateDeviceAddress,
  updateDeviceAddressByDsn,
  updateDeviceNameById,
  getDevicesByDsns,
  getAllDevices,
  getMetadata,
  renameDeviceByDsn,
  getAllNodesByDeviceId,
  registerDevice,
  unregisterDevice,
  getGatewayDetails,
  getDeviceDatapointsByDsnAndPropertyName,
  getHistoryAlertsByDeviceDsns,
  getAllDeviceDatapoints,
  getDSNByMacAndSerialNumber,
  getConnectionHistoryByDeviceId,
  addDeviceConnectionHistory,
  getDevicePropertyByName,
  getDatapointByPropertyNameAndId,
  createMessageDatapointByPropertyName,
  getLatestDeviceMessagePropertyValue,
  uploadFileDatapointByDsn,
  downloadFileDatapointByDsn,
  getDataPointsForDevicePropertyEndPoint,
  getDataPointsValuesForDeviceByDsn,
  getDeviceExtendedData,
  getThermostatSystemMode,
}
