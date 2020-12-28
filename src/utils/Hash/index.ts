import IHash from '../../contracts/hash'
import { hashSync } from 'bcryptjs'

class Hash implements IHash {
  make(value:string):string {
    return hashSync(value, 8)
  }
}

export default new Hash