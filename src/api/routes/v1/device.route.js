const express = require('express')

const {
  getDevices,
  getAllNodesByDeviceId,
  updateDeviceNameById,
  unregisterDevice,
  getDSNByMacAndSerial,
  getConnectionHistoryByDevice,
  addDeviceConnectionHistory,
} = require('../../controllers/device.controller')
const auth = require('../../middlewares/auth')

const router = express.Router()

router.get('/', auth(), getDevices)
router.get('/:deviceId/nodes', auth(), getAllNodesByDeviceId)
router.get('/search', auth(), getDSNByMacAndSerial)
router.put('/:deviceId/update-name', auth(), updateDeviceNameById)
router.post('/:deviceId/unregister', auth(), unregisterDevice)
router.get('/:deviceId/connection-history', auth(), getConnectionHistoryByDevice)
router.post('/:deviceId/connection-history', auth(), addDeviceConnectionHistory)

module.exports = router
