const express = require('express')

const { updateProperties } = require('../../controllers/property.controller')
const auth = require('../../middlewares/auth')

const router = express.Router()

router.put('/', auth(), updateProperties)

module.exports = router
