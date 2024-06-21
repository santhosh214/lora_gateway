const express = require('express')

const { createVirtualDevice } = require('../../controllers/virtualDevice.controller')
const auth = require('../../middlewares/auth')

const router = express.Router()

router.post('/', auth(), createVirtualDevice)

module.exports = router
