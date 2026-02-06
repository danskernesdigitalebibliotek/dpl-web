class MissingConfigurationError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "MissingConfigurationError"
  }
}

export default MissingConfigurationError
