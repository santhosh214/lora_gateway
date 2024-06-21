const { VantivaError } = require('./VantivaError')

class NotFoundError extends VantivaError {
  constructor(message, argument) {
    super(message)
    this.argument = argument
  }
}

module.exports = {
  NotFoundError,
}
