const { aylaClient } = require('../client/ayla.axios')
const { getCreateRemoteVirtualDeviceEndPoint } = require('../common/aylaEndPoints')

const { checkResponseStatus, handleApiError } = require('../common/utils')

const { ArgumentError } = require('../errors/ArgumentError')

const createVirtualDevice = async ({ uniqueHardwareId, oem, oemModel, productName, macAddress, model }) => {
  if (!uniqueHardwareId || !oem || !oemModel || !productName || !macAddress || !model) {
    throw new ArgumentError('Missing required parameters')
  }

  const payload = {
    unique_hardware_id: uniqueHardwareId,
    oem,
    oem_model: oemModel,
    product_name: productName,
    mac: macAddress,
    model,
  }
  let response
  try {
    response = await aylaClient.post(getCreateRemoteVirtualDeviceEndPoint(), payload)
  } catch (error) {
    handleApiError(error, `Error creating remote virtual device`)
  }

  checkResponseStatus(response, `Error creating remote virtual device`)

  return { id: response.data.id, dsn: response.data.dsn }
}

module.exports = {
  createVirtualDevice,
}
