const express = require('express')

const {
  getDeviceByDsn,
  getDevicePropertiesByDsn,
  getDeviceAddressByDsn,
  getDevicePropertyByDsnAndPropertyName,
  getDevicesByDsns,
  getDeviceMetadata,
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
  getDevicePropertyDataItemValues,
  getThermostatSystemMode,
  getDeviceExtendedData,
} = require('../../controllers/dsn.controller')
const auth = require('../../middlewares/auth')
const uploadFile = require('../../middlewares/uploadFile')

const router = express.Router()

router.get('/', auth(), getDevicesByDsns)
router.get('/:dsn', auth(), getDeviceByDsn)
router.get('/:dsn/address', auth(), getDeviceAddressByDsn)
router.put('/:dsn/address', auth(), updateDeviceAddressByDsn)
router.get('/:dsn/properties', auth(), getDevicePropertiesByDsn)
router.get('/:dsn/properties/:propertyName', auth(), getDevicePropertyByDsnAndPropertyName)
router.get('/:dsn/metadata', auth(), getDeviceMetadata)
router.get('/:dsn/gateway-details', auth(), getGatewayDetails)
router.put('/:dsn/register', auth(), registerDeviceByDsn)
router.get('/:dsn/properties/:propertyName/datapoints', auth(), getDeviceDatapointsByDsnAndPropertyName)
router.get('/:dsn/device-details', auth(), getDeviceDetailsByDsn)
router.get('/:dsn/alert-history', auth(), getHistoryAlertsByDeviceDsn)
router.get('/:dsn/datapoints/all', auth(), getAllDeviceDatapoints)
router.get('/:dsn/datapoints/thermostat', auth(), getThermostatSystemMode)
router.get('/:dsn/properties/:propertyName/data-items', auth(), getAllDevicePropertyDataItems)
router.get('/:dsn/properties/:propertyName/data-items/:dataItemId', auth(), getDevicePropertyDataItemById)
router.post('/:dsn/properties/:propertyName/data-items', auth(), createDevicePropertyDataItem)
router.put('/:dsn/properties/:propertyName/data-items/:dataItemId', auth(), updateDevicePropertyDataItem)
router.delete('/:dsn/properties/:propertyName/data-items/:dataItemId', auth(), deleteDevicePropertyDataItem)
router.post('/:dsn/properties/:propertyName/message-datapoints', auth(), createDeviceMessageDatapoint)
router.get('/:dsn/properties/:propertyName/message-datapoints/latest', auth(), getLatestDeviceMessageDatapoint)
router.post('/:dsn/properties/:propertyName/datapoints/file-upload', [auth(), uploadFile()], uploadFileDatapoint)
router.get('/:dsn/properties/:propertyName/datapoints/:datapointId/file-download', auth(), downloadFileDatapoint)
router.get('/:dsn/properties/:propertyName/data-items-values', auth(), getDevicePropertyDataItemValues)
router.get('/:dsn/extended-data', auth(), getDeviceExtendedData)

module.exports = router
