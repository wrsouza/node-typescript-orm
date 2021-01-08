import { Options } from "./@types"

import FirebirdAdapter from "./adapters/Firebird";
import OracleAdapter from "./adapters/Oracle";

const database = async (config: Options) => {
  if (config.driver === 'oracle') {
      return new OracleAdapter(config)
  }
  return new FirebirdAdapter(config)
}

export default database