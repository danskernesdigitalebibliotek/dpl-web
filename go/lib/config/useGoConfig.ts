import { retrieveValue } from "./goConfig"
import { TClientResolvers, TConfigKey, clientResolvers } from "./resolvers"

// This functionality (useGoConfig) is used to retrieve configuration values from the client side.
// Only non sensitive configuration values should retrieved from the client side.

type TConfigKeyClientOnly = Exclude<TConfigKey, `server-only.${string}`>

const useGoConfig = () => {
  return <TConfigKey extends TConfigKeyClientOnly>(
    key: TConfigKey
  ): TClientResolvers[TConfigKey] extends () => infer R ? R : TClientResolvers[TConfigKey] => {
    return retrieveValue(key, clientResolvers)
  }
}

export default useGoConfig
