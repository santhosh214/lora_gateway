const VALID_TOKEN = process.env.LORA_API_KEY;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.sendStatus(401);

  if (token === VALID_TOKEN) {
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = authenticateToken