const { assert } = require('chai')
const sinon = require('sinon')

const deviceService = require('../../../src/api/services/device.service')
const { aylaClient } = require('../../../src/api/client/ayla.axios')

const deviceDetails = {
  device: {
    id: 6047779,
    product_name: 'OWM0131_Controller',
    model: 'AY001MRT1',
    dsn: 'AC000W028037481',
    oem: 'c3073378',
    nodes: [
      {
        id: 6489891,
        product_name: 'Temp T2',
        model: 'GenericNode',
        dsn: 'VR00ZN000778197',
      },
    ],
    activated_at: '2023-04-06T11:43:07Z',
    created_at: '2023-02-01T10:46:15Z',
  },
}

const propertyResponse = [
  {
    property: {
      type: 'Property',
      name: 'controller_status',
      base_type: 'boolean',
      read_only: true,
      direction: 'output',
      scope: 'user',
      value: 1,
    },
  },
  {
    property: {
      type: 'Property',
      name: 'cpu_usage',
      base_type: 'string',
      read_only: true,
      direction: 'output',
      scope: 'user',
      value: '0%',
    },
  },
]

const concatDeviceRes = {
  activatedAt: '2023-04-06T11:43:07Z',
  createdAt: '2023-02-01T10:46:15Z',
  dsn: 'AC000W028037481',
  id: 6047779,
  model: 'AY001MRT1',
  nodes: [
    {
      dsn: 'VR00ZN000778197',
      id: 6489891,
      model: 'GenericNode',
      productName: 'Temp T2',
    },
  ],
  oem: 'c3073378',
  productName: 'OWM0131_Controller',
  controllerStatus: 1,
  cpuUsage: '0%',
}

describe('#getDeviceExtendedData', async () => {
  const dsn = 'AC000W028TEST'
  describe('should getDeviceExtendedData success', () => {
    beforeEach(async () => {
      sinon
        .stub(aylaClient, 'get')
        .withArgs(`/apiv1/dsns/${dsn}.json`)
        .resolves({ status: 200, data: deviceDetails })
        .withArgs(`apiv1/dsns/${dsn}/properties.json`)
        .resolves({ status: 200, data: propertyResponse })
    })

    afterEach(async () => {
      aylaClient.get.restore()
    })

    it('should return all project', async () => {
      const result = await deviceService.getDeviceExtendedData(dsn)
      assert.deepEqual(result, concatDeviceRes)
    })
  })

  describe('should getDeviceExtendedData fails', () => {
    before(async () => {
      sinon.stub(aylaClient, 'get').callsFake(() => {
        return Promise.reject(new Error('Unknown error'))
      })
    })

    after(async () => {
      aylaClient.get.restore()
    })

    it('should return an error', async () => {
      let error

      try {
        await deviceService.getDeviceExtendedData(dsn)
      } catch (e) {
        error = e
      }
      assert.include(error.message, 'Failed to get device by DSN')
    })
  })
})
