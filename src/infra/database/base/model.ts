import DateFormat from '../../../utils/DateFormat'
import IModel from '../contracts/model'
import Database from '../contracts/database'
import { QAttributes } from '../@types'

export default abstract class Model implements IModel {
  protected db:Database
  protected connection:object|null
  protected fillable:Array<string>
  protected hidden:Array<string>
  protected attributes:QAttributes

  constructor() {
    this.attributes = {
      command: '', 
      table: '', 
      select: null,
      fields: null, 
      primaryKey: 'id',
      primaryKeyValue: null,
      where: null,
      orWhere:null,
      whereIn: null,
      orderBy: null,
      limit: null,
      offset: null,
      joins: null,
    }
  }

  set table(value:string) {
    this.attributes.table = value
  }

  get table(): string {
    return this.attributes.table
  }

  set primaryKey(value:string) {
    this.attributes['primaryKey'] = value
  }

  get primaryKey(): string {
    return this.attributes['primaryKey']
  }

  setDb(db:Database):void {
    this.db = db
  }

  async all():Promise<any> {
    try {
      this.attributes.command = 'select'
      this.resetAttributes(['primaryKeyValue', 'select', 'fields', 'joins', 'where', 'orWhere', 'whereIn', 'limit', 'offset', 'orderBy'])
      return await this.db.query(this.attributes)
    } catch(err) {
      throw new Error("Erro na Consulta da Lista dos Usuários")
    } finally {
      this.resetAttributes(['select', 'fields', 'joins', 'where', 'orWhere', 'whereIn', 'limit', 'offset', 'orderBy', 'primaryKeyValue'])
    }
  }

  async find(key: number): Promise<object|Error> {
    try {
      this.resetAttributes(['primaryKeyValue', 'select', 'fields', 'joins', 'where', 'orWhere', 'whereIn', 'limit', 'offset', 'orderBy'])
      this.attributes.command = 'select'
      this.where(this.primaryKey, key)
      const result = await this.db.query(this.attributes)
      return result[0]
    } catch(err) {
      throw new Error(`Erro na Consulta: ${key}`)
    } finally {
      this.resetAttributes(['select', 'fields', 'joins', 'where', 'orWhere', 'whereIn', 'limit', 'offset', 'orderBy', 'primaryKeyValue'])
    }
  }

  async create(data:object) {
    try {
      this.resetAttributes(['primaryKeyValue', 'select', 'fields', 'joins', 'where', 'orWhere', 'whereIn', 'limit', 'offset', 'orderBy'])
      this.attributes.command = 'insert' 
      this.setFields(data)
      this.attributes.fields['created_at'] = new Date() // DateFormat.format(null, 'yyyy-MM-dd HH:ii:ss')
      this.attributes.fields['updated_at'] = new Date() // DateFormat.format(null, 'yyyy-MM-dd HH:ii:ss')
      const id = await this.db.query(this.attributes)
      return await this.find(id)
    } catch (err) {
      return new Error(err.message)
    } finally {
      this.resetAttributes(['select', 'fields', 'joins', 'where', 'orWhere', 'whereIn', 'limit', 'offset', 'orderBy', 'primaryKeyValue'])
    }
  }

  async update(data:object) {
    try {
      this.resetAttributes(['primaryKeyValue', 'select', 'fields', 'joins', 'where', 'orWhere', 'whereIn', 'limit', 'offset', 'orderBy'])
      this.attributes.command = 'update'      
      this.attributes.primaryKeyValue = data[this.attributes.primaryKey]
      this.setFields(data)
      this.attributes.fields['updated_at'] = new Date() //DateFormat.format(null, 'yyyy-MM-dd HH:ii:ss')
      this.where(this.primaryKey, data[this.primaryKey])
      const id = await this.db.query(this.attributes)
      return await this.find(id)
    } catch (err) {
      return new Error(err.message)
    } finally {
      this.resetAttributes(['select', 'fields', 'joins', 'where', 'orWhere', 'whereIn', 'limit', 'offset', 'orderBy', 'primaryKeyValue'])
    }
  }

  async delete(key:string) {
    try {
      this.resetAttributes(['select', 'fields', 'where', 'orWhere', 'limit', 'offset', 'orderBy'])
      this.attributes.command = 'delete'
      this.attributes.primaryKeyValue = key
      this.where(this.primaryKey, key)
      const result = await this.db.query(this.attributes)
      return 'ok'
    } catch (err) {
      return new Error(err.message)
    } finally {
      this.resetAttributes(['select', 'fields', 'joins', 'where', 'orWhere', 'limit', 'offset', 'orderBy', 'primaryKeyValue'])
    }
  }

  async get() {
    try {
      this.attributes.command = 'select'
      this.resetAttributes(['primaryKeyValue', 'fields'])
      return await this.db.query(this.attributes)
    } catch (err) {
      return new Error(err.message)
    } finally {
      this.resetAttributes(['select', 'fields', 'joins', 'where', 'orWhere', 'whereIn', 'limit', 'offset', 'orderBy', 'primaryKeyValue'])
    }
  }

  async count() {
    try {
      this.attributes.command = 'count'
      this.resetAttributes(['select', 'fields', 'limit', 'offset', 'orderBy', 'primaryKeyValue'])
      this.attributes['select'] = ['count(*)  as aggregate']
      return await this.db.query(this.attributes)
    } catch(err) {
      throw new Error("Erro na Consulta")
    } finally {
      this.resetAttributes(['select', 'fields', 'joins', 'where', 'orWhere', 'whereIn', 'limit', 'offset', 'orderBy', 'primaryKeyValue'])
    }
  }

  resetAttributes(list:Array<string>):void {
    list.forEach(item => {
      this.attributes[item] = null
    })
  }

  setFields(data:object) {
    this.attributes.fields = []
    Object.keys(data).forEach((key, idx) => {
      if (this.fillable.includes(key)) {
        this.attributes.fields[key] = data[key]
      }
    })
  }

  join(table:string, foreignKey:string, primaryKey:string|null = null): Model {
    if (!this.attributes.joins) {
      this.attributes.joins = []
    }

    this.attributes['joins'].push({ table, foreignKey,  primaryKey })

    return this
  }

  select(data:string|Array<string>): Model {
    let fields:Array<string> = (typeof data === 'string') ? data.split(',') : data
    this.attributes['select'] = fields

    return this
  }

  where(val1:any, val2:any, val3: any | undefined = undefined, method: string = ''): Model {
    
    if (!this.attributes.where) {
      this.attributes.where = []
    }

    let field:string
    let type:string
    let value:any

    if (Array.isArray(val1)) {
      val1.forEach(item => {
        field = item[0]
        type = (item.length > 2) ? item[1] : '='
        value = (item.length > 2) ? item[2] : item[1]
        this.attributes.where.push({ field, type, value, method })
      })
      return this
    }

    field = val1
    type = (val3 === undefined) ? '=' : val2
    value = (val3 === undefined) ? val2 : val3
    this.attributes.where.push({ field, type, value, method })
    return this
  }

  orWhere(val1:any, val2:any, val3: any | undefined = undefined): Model {
    this.where(val1, val2, val3, 'OR')
    return this
  }

  whereIn(field:string, values: Array<any> = []): Model {
    this.where(field, 'IN', values, 'IN')
    return this
  }

  whereNotIn(field:string, values: Array<any> = []): Model {
    this.where(field, 'NOT IN', values, 'NOT_IN')
    return this
  }

  whereBetween(field: string, values: Array<any> = []): Model {
    this.where(field, 'BETWEEN', values, 'BETWEEN')
    return this
  }

  whereNull(field: string): Model {
    this.where(field, 'IS NULL', null, 'NULL')
    return this
  }

  whereNotNull(field: string): Model {
    this.where(field, 'IS NOT NULL', null, 'NOT_NULL')
    return this
  }

  whereGroupIn(): Model {
    this.where('', '', '', 'GROUP_IN')
    return this
  }

  whereGroupOut(): Model {
    this.where('', '', '', 'GROUP_OUT')
    return this
  }

  orderBy(data:string|Array<string>): Model {
    let field: string
    let type: string

    if (typeof data === 'string') {
      field = data
      type = 'ASC'
    } else {
      [field, type] = data
    }

    this.attributes['order'] = [
      ...this.attributes['order'],
      [field, type]
    ]

    return this
  }

  limit(value:number): Model {
    this.attributes['limit'] = value

    return this
  }

  offset(value:number): Model {
    this.attributes['offset'] = value

    return this
  }
}