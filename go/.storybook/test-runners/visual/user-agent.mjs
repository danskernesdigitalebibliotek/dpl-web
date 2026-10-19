// The capture browser adds this to its user agent, so the preview knows from
// its first render that Argos screenshots it.
export const argosUserAgentToken = "ArgosCI"

export const isArgosCapture = () => navigator.userAgent.includes(argosUserAgentToken)
