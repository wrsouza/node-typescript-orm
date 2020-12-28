import { Options } from "./@types"

import FirebirdAdapter from "./adapters/Firebird";
import MssqlAdapter from "./adapters/Mssql";
import MysqlAdapter from "./adapters/Mysql"
import OracleAdapter from "./adapters/Oracle";
import PostgresAdapter from "./adapters/Postgres";

const database = async (config: Options) => {
  switch(config.driver) {
    case "postgres":
      return new PostgresAdapter(config)
    case "oracle":
      return new OracleAdapter(config)
    case "firebird":
      return new FirebirdAdapter(config)
    case "sqlsrv":
      return new MssqlAdapter(config)
    default:
      return new MysqlAdapter(config)
  }
}

export default database