const getGatewaysEndPoint = () => {
  return `/gateways`
}

const getGatewayByIdEndPoint = (gatewayId) => {
  return `gateways/${gatewayId}`
}

const getCreateGatewayByOrganizationIdEndPoint = (organizationId) => {
  return `/organizations/${organizationId}/gateways`
}

const getDeleteGatewayByGatewayIdEndPoint = (gatewayId) => {
  return `gateways/${gatewayId}`
}

module.exports = {
  getGatewaysEndPoint,
  getGatewayByIdEndPoint,
  getCreateGatewayByOrganizationIdEndPoint,
  getDeleteGatewayByGatewayIdEndPoint
}