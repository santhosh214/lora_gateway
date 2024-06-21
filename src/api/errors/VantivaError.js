class VantivaError extends Error {
  constructor(message, argument) {
    super(message)
    this.argument = argument
  }
}

module.exports = {
  VantivaError,
}
