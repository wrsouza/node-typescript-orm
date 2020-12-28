import { QAttributes } from "../@types";

interface Database {
  connect: Function
  query(attributes:QAttributes):Promise<any>
  close: Function
}

export default Database