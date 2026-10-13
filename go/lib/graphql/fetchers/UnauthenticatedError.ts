export default class UnauthenticatedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UnauthenticatedError"
    Object.setPrototypeOf(this, UnauthenticatedError.prototype)
  }
}
