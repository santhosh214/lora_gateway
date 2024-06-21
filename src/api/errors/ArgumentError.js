const { VantivaError } = require('./VantivaError')

class ArgumentError extends VantivaError {
  constructor(message, argument) {
    super(message)
    this.argument = argument
  }
}

module.exports = {
  ArgumentError,
}
