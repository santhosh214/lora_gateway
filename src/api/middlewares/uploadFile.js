const processUploadFile = req => {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', data => {
      chunks.push(data)
    })
    req.on('end', () => {
      const payload = Buffer.concat(chunks).toString('base64')
      resolve(payload)
    })
    req.on('error', reject)
  })
}

const uploadFile = () => async (req, res, next) => {
  try {
    const fileData = await processUploadFile(req)

    req.file = fileData

    next()
  } catch (e) {
    next(e)
  }
}

module.exports = uploadFile
