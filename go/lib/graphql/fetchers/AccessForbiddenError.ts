export default class AccessForbiddenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AccessForbiddenError"
    Object.setPrototypeOf(this, AccessForbiddenError.prototype)
  }
}
