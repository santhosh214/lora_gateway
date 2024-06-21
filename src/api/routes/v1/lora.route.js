const express = require('express')
const { getAllGateways, createGateway, deleteGateway } = require("../../controllers/lora.controller")

const router = express.Router()

router.route("/gateway").get(getAllGateways).post(createGateway)
router.route("/gateway/:id").delete(deleteGateway)


module.exports = router