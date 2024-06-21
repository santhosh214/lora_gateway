const express = require('express')

const dsnRoute = require('./dsn.route')
const deviceRoute = require('./device.route')
const propertiesRoute = require('./properties.route')
const virtualDeviceRoute = require('./virtualDevice.route')
const loraRoute = require("./lora.route")

const router = express.Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Device Service' })
})

router.use("/lora", loraRoute)
router.use('/dsns', dsnRoute)
router.use('/devices', deviceRoute)
router.use('/properties', propertiesRoute)
router.use('/virtual-devices', virtualDeviceRoute)

module.exports = router
