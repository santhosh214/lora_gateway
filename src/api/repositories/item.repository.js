/**
 * Get items from repository.
 */
const getItems = () => {
  // TODO: Implement logic to get items from repository (such as a Database).

  const data = []

  data.push({ id: '1', name: 'test-1' })
  data.push({ id: '2', name: 'test-2' })

  return data
}

module.exports = {
  getItems,
}
