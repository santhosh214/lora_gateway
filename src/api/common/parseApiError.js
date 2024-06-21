const parseApiError = e => {
  if (e.message === 'Request failed with status code 401') {
    e.status = 401
  }

  const status = e.status || 500
  const errorMessage = e.message || 'Unknown error.'

  return { status, errorMessage }
}

module.exports = {
  parseApiError,
}
