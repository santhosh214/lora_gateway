const express = require('express')
const { getAllGateways, getGatewayById, createGateway, deleteGateway } = require("../../controllers/lora.controller")

const router = express.Router()

router.route("/gateways").get(getAllGateways)
router.route("/gateways/organizations/:organizationId/gateways").post(createGateway)
router.route("/gateways/:gatewayId").delete(deleteGateway).get(getGatewayById)


module.exports = router