import Database from './database'

interface Model {
  setDb(db: Database): void
  all():Promise<any>
  find(key:number):Promise<object|Error>
  create(data:object):Promise<object|Error>
  update(data:object):Promise<object|Error>
  delete(key:string):Promise<string|Error>
}

export default Model