const AYLA_DEVICE_ENDPOINT = '/apiv1/devices.json'
const AYLA_DATAPOINTS_ENDPOINT = '/apiv1/batch_datapoints.json'

const getDeviceByIdEndPoint = id => {
  return `/apiv1/devices/${id}.json`
}

const getDeviceByDsnEndPoint = dsn => {
  return `/apiv1/dsns/${dsn}.json`
}

const getCreateDataPointForDevicePropertyEndPoint = (deviceId, propertyName) => {
  return `apiv1/devices/${deviceId}/properties/${propertyName}/datapoints.json`
}

const getSearchDevicesByOemModelAndTemplateEndPoint = (oemModel, templateId, page = 1, pageSize = 10) => {
  return `apiv1/devices.json?page=${page}&paginated=true&per_page=${pageSize}&oem_model=${oemModel}&template_id=${templateId}`
}

const getPropertiesByDeviceDsnEndPoint = dsn => {
  return `apiv1/dsns/${dsn}/properties.json`
}

const getDeviceAddressByIdEndPoint = deviceId => {
  return `/apiv1/devices/${deviceId}/addr.json`
}

const getRenameDeviceByIdEndPoint = deviceId => {
  return `/apiv1/devices/${deviceId}.json`
}

const getRenameDeviceByDsnEndPoint = dsn => {
  return `/apiv1/dsns/${dsn}.json`
}

const getApplyTemplateToDeviceEndPoint = (templateId, deviceId) => {
  return `apiv1/devices/${deviceId}/template/${templateId}.json`
}

const getDevicePropertyByPropertyNameEndpoint = (dsn, propertyName) => {
  return `/apiv1/dsns/${dsn}/properties/${propertyName}.json`
}

const getDeviceMetadata = dsn => {
  return `/apiv1/dsns/${dsn}/data.json`
}

const getAllNodesEndpoint = deviceId => {
  return `/apiv1/devices/${deviceId}/nodes.json?all_nodes=true`
}

const getRegisterDeviceEndpoint = dsn => {
  return `/apiv1/devices/${dsn}/register.json?env=docker`
}

const getUnregisterDeviceEndpoint = deviceId => {
  return `/apiv1/devices/${deviceId}/unregister.json?env=docke`
}

const getDataPointForDevicePropertyEndPointWithLimit = (dsn, propertyName, limit) => {
  return `apiv1/dsns/${dsn}/properties/${propertyName}/datapoints.json?limit=${limit}`
}

const getDataPointForDevicePropertyEndPoint = (dsn, propertyName, limit) => {
  return `apiv1/dsns/${dsn}/properties/${propertyName}/datapoints.json?limit=${limit}`
}

const getDataPointForDevicePropertyEndPointWithPagination = (
  dsn,
  propertyName,
  { limit = 20, isPaginated = true, orderAttribute = 'datapoint.created_at', direction = 'desc', next, startDate, endDate },
) => {
  let baseQuery = `apiv1/dsns/${dsn}/properties/${propertyName}/datapoints.json?per_page=${limit}&is_forward_page=true`

  if (isPaginated != null) {
    baseQuery = `${baseQuery}&paginated=${isPaginated}`
  }

  if (orderAttribute != null) {
    baseQuery = `${baseQuery}&order_by=${orderAttribute}`
  }

  if (direction != null) {
    baseQuery = `${baseQuery}&order=${direction}`
  }

  if (next != null) {
    baseQuery = `${baseQuery}&next=${next}`
  }

  if (startDate != null) {
    baseQuery = `${baseQuery}&filter[created_at_since_date]=${startDate}`
  }

  if (endDate != null) {
    baseQuery = `${baseQuery}&filter[created_at_end_date]=${endDate}`
  }

  return baseQuery
}

const getAlertHistoryForDeviceEndpoint = (dsns, startDate, endDate, page = 1, pageSize = 10) => {
  let baseQuery = `/apiv1/dsns/${dsns}/devices/alert_history.json?page=${page}&paginated=true&per_page=${pageSize}`

  if (startDate != null) {
    baseQuery = `${baseQuery}&[sent_at_gte]=${startDate}`
  }

  if (endDate != null) {
    baseQuery = `${baseQuery}&[sent_at_lte]=${endDate}`
  }

  baseQuery = `${baseQuery}&[filter][sort_by]=sent_at&[filter][direction]=desc&[filter][order]=desc&[filter][order_by]=sent_at`

  return baseQuery
}

const getDSNByMacAndSerialNumberEndPoint = (macAddress = '', serialNumber = '') => {
  return `${process.env.AYLA_DEVICEFACTORY_API_URL}/devicefactory/v1/devices.json?%5Bfilter%5D%5Bmac_like%5D=${macAddress}&%5Bfilter%5D%5Bmanuf_sn_like%5D=${serialNumber}&order=desc&order_by=dsn`
}

const getCreateRemoteVirtualDeviceEndPoint = () => {
  return 'apiv1/remote_virtual_devices.json'
}

const getConectionHistoryByDeviceEndPoint = (deviceId, pageNumber, pageSize, sortBy, sortDirection) => {
  return `/apiv1/devices/${deviceId}/connection_history/page/${pageNumber}/limit/${pageSize}/field/${sortBy}/order/${sortDirection}.json`
}

const getAddConectionHistoryForDeviceEndPoint = deviceId => {
  return `/apiv1/devices/${deviceId}/connection_history`
}

const getCreateMessageDatapointByPropertynNameAndDSNEndPoint = (propertyName, dsn) => {
  return `/apiv1/dsns/${dsn}/properties/${propertyName}/message_datapoints.json`
}

const getDevicePropertyByNameAndDSNEndPoint = (propertyName, dsn) => {
  return `/apiv1/dsns/${dsn}/properties/${propertyName}.json`
}

const getDataPointByPropertyNameAndDSNAndIdEndPoint = (dsn, propertyName, dataPointId) => {
  return `/apiv1/dsns/${dsn}/properties/${propertyName}/datapoints/${dataPointId}.json`
}

const getDataPointsCreateFileForDeviceEndpoint = (dsn, propertyName) => {
  return `/apiv1/dsns/${dsn}/properties/${propertyName}/datapoints.json`
}

const getDataPointByDataPointIdEndpoint = (deviceId, propertyName, dataPointId) => {
  return `/apiv1/devices/${deviceId}/properties/${propertyName}/datapoints/${dataPointId}.json`
}

module.exports = {
  AYLA_DEVICE_ENDPOINT,
  AYLA_DATAPOINTS_ENDPOINT,
  getDeviceByDsnEndPoint,
  getDeviceByIdEndPoint,
  getCreateDataPointForDevicePropertyEndPoint,
  getSearchDevicesByOemModelAndTemplateEndPoint,
  getPropertiesByDeviceDsnEndPoint,
  getDeviceAddressByIdEndPoint,
  getRenameDeviceByIdEndPoint,
  getRenameDeviceByDsnEndPoint,
  getApplyTemplateToDeviceEndPoint,
  getDevicePropertyByPropertyNameEndpoint,
  getDeviceMetadata,
  getAllNodesEndpoint,
  getRegisterDeviceEndpoint,
  getUnregisterDeviceEndpoint,
  getDataPointForDevicePropertyEndPointWithLimit,
  getDataPointForDevicePropertyEndPoint,
  getAlertHistoryForDeviceEndpoint,
  getDSNByMacAndSerialNumberEndPoint,
  getCreateRemoteVirtualDeviceEndPoint,
  getConectionHistoryByDeviceEndPoint,
  getAddConectionHistoryForDeviceEndPoint,
  getCreateMessageDatapointByPropertynNameAndDSNEndPoint,
  getDevicePropertyByNameAndDSNEndPoint,
  getDataPointByPropertyNameAndDSNAndIdEndPoint,
  getDataPointsCreateFileForDeviceEndpoint,
  getDataPointByDataPointIdEndpoint,
  getDataPointForDevicePropertyEndPointWithPagination,
}
