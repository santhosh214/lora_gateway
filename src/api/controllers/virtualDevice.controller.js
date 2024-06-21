const { parseApiError } = require('../common/parseApiError')
const virtualDeviceService = require('../services/virtualDevice.service')
const { ArgumentError } = require('../errors/ArgumentError')

const createVirtualDevice = async (req, res) => {
  const {
    body: { uniqueHardwareId, oem, oemModel, productName, macAddress, model },
  } = req

  try {
    const response = await virtualDeviceService.createVirtualDevice({
      uniqueHardwareId,
      oem,
      oemModel,
      productName,
      macAddress,
      model,
    })

    res.send(response)
  } catch (error) {
    console.error(`An error occurred while creating a virtual device`, error.message)

    if (error instanceof ArgumentError) {
      return res.status(400).json({ errorMessage: error.message })
    }

    const { errorMessage, status } = parseApiError(error)
    const errorStatus = status || 500

    return res.status(errorStatus).json({ errorMessage })
  }
}

module.exports = {
  createVirtualDevice,
}
