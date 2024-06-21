const axios = require("axios");
const loraService = require("../services/lora.service")
const { parseApiError } = require("../common/parseApiError")

const baseURL = 'https://vantiva.eu1.cloud.thethings.industries/api/v3';


const getAllGateways = async (req, res) => {

  try {
    const gateways = await loraService.getAllGateways()

    res.status(200).send(gateways)
  } catch (e) {
    console.error(`An error occurred while getting the gateways from lora`, e.message)

    const { errorMessage, status } = parseApiError(e)

    res.status(status).send({ status, errorMessage })
  }
}

// const getAllGateways = async (req, res) => {
//   const authHeader = req.headers['authorization'];

//   try {
//     const response = await axios.get(`${baseURL}/gateways`, {
//       headers: {
//         'Authorization': authHeader,
//         'Content-Type': 'application/json'
//       }
//     });
//     res.status(200).send(response.data);
//   } catch (err) {
//     console.error('Error:', err.response ? err.response.data : err.message);
//     res.status(err.response ? err.response.status : 500).send(err.response ? err.response.data : { error: 'Internal Server Error' });
//   }
// }

// To create a gateway in LoRa Network
const createGateway = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const data = req.body;
  const organization_id = "vantiva-test"

  try {
    const response = await axios.post(`${baseURL}/organizations/${organization_id}/gateways`, data, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
    res.status(200).send(response.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
    res.status(err.response ? err.response.status : 500).send(err.response ? err.response.data : { error: 'Internal Server Error' });
  }
};

const deleteGateway = async (req, res) => {
  const authHeader = req.headers['authorization']
  const gatewayId = req.params.id;

  try {
    const response = await axios.delete(`${baseURL}/gateways/${gatewayId}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })
    res.status(200).send(response.data)
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
    res.status(err.response ? err.response.status : 500).send(err.response ? err.response.data : { error: 'Internal Server Error' });
  }
}

module.exports = { getAllGateways, createGateway, deleteGateway };
