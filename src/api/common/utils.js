const moment = require('moment')
const { HttpError } = require('../errors/HttpError')
const { ArgumentError } = require('../errors/ArgumentError')
const {
  OEM_MODEL_CAMERA_NODE,
  OEM_MODEL_DOOR_SENSOR,
  OEM_MODEL_DOOR_SENSOR_2,
  OEM_MODEL_LINUX_EVB,
  OEM_MODEL_MOTION_SENSOR,
  OEM_MODEL_MOTION_SENSOR_2,
  OEM_MODEL_TEMPERATURE_SENSOR,
  OEM_MODEL_TEMPERATURE_SENSOR_2,
  OEM_MODEL_THERMOSTAT_SENSOR,
  OEM_MODEL_SALAS_THERMOSTAT_SENSOR,
  OEM_MODEL_WATER_LEAK_SENSOR,
  OEM_SMART_LOCK_SENSOR,
} = require('./constants')

const checkResponseStatus = (response, actionDescription) => {
  if (response.status !== 200 && response.status !== 201) {
    throw new HttpError(`${actionDescription}. HTTP Status: ${response.status}`, response.status)
  }
}

const handleApiError = (error, actionDescription) => {
  const errorMessage = error.message || 'Unknown error message'
  const errorCode = error.code || 'No error code'

  console.error(`Error during "${actionDescription}": ${errorMessage} (Code: ${errorCode})`)

  if (error.response) {
    console.error(`Response status: ${error.response.status}. Response body: ${JSON.stringify(error.response.data)}`)
  }

  throw new Error(`Failed to ${actionDescription}. Please try again or contact support if the issue persists.`)
}

const getDeviceInfoByOemModel = oemModel => {
  let deviceInfo

  switch (oemModel) {
    case OEM_MODEL_DOOR_SENSOR:
    case OEM_MODEL_DOOR_SENSOR_2:
      deviceInfo = {
        is_sensor: true,
        generic_name: 'Door',
        property_name: 'dev:iaszone:status',
        property_names: ['dev:iaszone:status'],
      }

      break
    case OEM_MODEL_MOTION_SENSOR:
    case OEM_MODEL_MOTION_SENSOR_2:
      deviceInfo = {
        is_sensor: true,
        generic_name: 'Motion',
        property_name: 'dev:motion:status',
        property_names: ['dev:motion:status'],
      }

      break
    case OEM_MODEL_TEMPERATURE_SENSOR:
    case OEM_MODEL_TEMPERATURE_SENSOR_2:
      deviceInfo = {
        is_sensor: true,
        generic_name: 'Temperature',
        property_name: 'dev:thm:local_temperature',
        property_names: ['dev:thm:local_temperature', 'dev:thm:local_humidity'],
      }
      break
    case OEM_MODEL_THERMOSTAT_SENSOR:
    case OEM_MODEL_SALAS_THERMOSTAT_SENSOR:
      deviceInfo = {
        is_sensor: true,
        generic_name: 'Thermostat',
        property_name: 'dev:thermost:local_temperature',
        property_names: ['dev:thermost:local_temperature'],
      }
      break
    case OEM_MODEL_WATER_LEAK_SENSOR:
      deviceInfo = {
        is_sensor: true,
        generic_name: 'Water Leak',
        property_name: 'dev:leak:leak_alarm',
        property_names: ['dev:leak:leak_alarm'],
      }

      break
    case OEM_MODEL_CAMERA_NODE:
      deviceInfo = {
        is_sensor: true,
        generic_name: 'Camera',
        property_name: 's1:kvs_base:webrtc_enable',
        property_names: ['s1:kvs_base:webrtc_enable'], // 'dev:camera:power_level',
      }

      break
    case OEM_SMART_LOCK_SENSOR:
      deviceInfo = {
        is_sensor: true,
        generic_name: 'Smart Lock',
      }

      break
    case OEM_MODEL_LINUX_EVB:
      deviceInfo = {
        is_sensor: false,
        generic_name: 'Device',
      }

      break
    default:
      console.info(`Not supported oem model: ${oemModel}`)
  }

  return deviceInfo
}

const pad = number => number.toString().padStart(2, '0')

/**
 * Gets the current time in UTC formatted as YYYYMMDD'T'HHMMSS'Z'.
 * @return {string} The formatted UTC time.
 */
const getCurrentTimeFormattedInUTC = () => {
  const now = new Date()

  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(
    now.getUTCMinutes(),
  )}${pad(now.getUTCSeconds())}Z`
}

const parseFromSnakeCaseToCamelCase = obj => {
  if (Array.isArray(obj)) {
    return obj.map(item => parseFromSnakeCaseToCamelCase(item))
  }

  if (obj && obj.constructor === Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      const newKey = key.replace(/(_\w)/g, m => m[1].toUpperCase())
      const transformedValue = parseFromSnakeCaseToCamelCase(obj[key])
      return { ...newObj, [newKey]: transformedValue }
    }, {})
  }

  return obj
}

const validateGetConnectionHistoryArguments = (deviceId, page, limit, sortBy, sortDirection) => {
  if (!deviceId) throw new ArgumentError('Missing device id parameter')
  if (page < 1 || limit < 1) throw new ArgumentError('Page and limit must be greater than 0')
  if (!['eventTime', 'status'].includes(sortBy)) throw new ArgumentError('Invalid sort by parameter')
  if (!['asc', 'desc'].includes(sortDirection)) throw new ArgumentError('Invalid sort direction parameter')
}

const validateAddConnectionHistoryArguments = (deviceId, status, eventTime) => {
  if (!deviceId) throw new ArgumentError('Missing device id parameter')
  if (!status) throw new ArgumentError('Missing status parameter')
  if (!eventTime) throw new ArgumentError('Missing eventTime parameter')
}

const mapConnectionHistory = connection => ({
  eventTime: connection.connection_history.event_time,
  status: connection.connection_history.status,
})

const isBase64 = value => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(value)

const trimValue = value => {
  return typeof value === 'string' ? value.trim() : value
}

const mergeThermostatDataPoints = (startDate, endDate, setPoints, lastDataPoints) => {
  const concatData = []
  // Combine all data into a single array with a source identifier
  ;[
    ...setPoints.cooling.map(d => ({ ...d, type: 'cooling' })),
    ...setPoints.heating.map(d => ({ ...d, type: 'heating' })),
    ...setPoints.actual.map(d => ({ ...d, type: 'actual' })),
  ].forEach(item => {
    concatData.push(item)
  })

  // add start date and end date
  const hasStartData = concatData.some(point => point.createdAt === startDate)
  const hasEndData = concatData.some(point => point.createdAt === endDate)
  if (!hasStartData) {
    concatData.push({
      createdAt: startDate,
      value: lastDataPoints.cooling,
      type: 'cooling',
    })
  }
  if (!hasEndData) {
    const coolingData = setPoints.cooling
    const value = coolingData.length > 0 ? coolingData[coolingData.length - 1].value : lastDataPoints.cooling
    concatData.push({
      createdAt: endDate,
      value,
      type: 'cooling',
    })
  }

  const data = [...concatData]
  // Sort by createdAt
  data.sort((a, b) => moment(a.createdAt).diff(moment(b.createdAt)))

  const output = []
  let lastHeating = lastDataPoints.heating
  let lastCooling = lastDataPoints.cooling
  let lastActual = lastDataPoints.actual
  let lastEntry = null

  // Iterate through data to create the output array
  data.forEach(item => {
    // If lastEntry exists and has the same createdAt, update it
    if (lastEntry && lastEntry.createdAt === item.createdAt) {
      if (item.type === 'cooling') {
        lastCooling = item.value
        lastEntry.cooling = lastCooling
      } else if (item.type === 'heating') {
        lastHeating = item.value
        lastEntry.heating = lastHeating
      } else if (item.type === 'actual') {
        lastActual = item.value
        lastEntry.actual = lastActual
      }
    } else {
      // Otherwise, create a new entry
      const entry = {
        createdAt: item.createdAt,
        heating: lastHeating,
        cooling: lastCooling,
        actual: lastActual,
      }

      if (item.type === 'cooling') {
        lastCooling = item.value
        entry.cooling = lastCooling
      } else if (item.type === 'heating') {
        lastHeating = item.value
        entry.heating = lastHeating
      } else if (item.type === 'actual') {
        lastActual = item.value
        entry.actual = lastActual
      }

      output.push(entry)
      lastEntry = entry
    }
  })

  return output
}

const buildDeviceExtendedData = (device, properties) => {
  const deviceProperties = properties.reduce((prev, current) => {
    const name = current?.property?.name || current?.name
    const value = current?.property?.value || current?.value
    return { ...prev, [name]: trimValue(value) }
  }, {})

  return parseFromSnakeCaseToCamelCase({
    ...device,
    ...deviceProperties,
  })
}

module.exports = {
  checkResponseStatus,
  handleApiError,
  getDeviceInfoByOemModel,
  getCurrentTimeFormattedInUTC,
  parseFromSnakeCaseToCamelCase,
  validateGetConnectionHistoryArguments,
  mapConnectionHistory,
  validateAddConnectionHistoryArguments,
  mergeThermostatDataPoints,
  isBase64,
  buildDeviceExtendedData,
  trimValue,
}
