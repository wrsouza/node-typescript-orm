import * as Oracle from 'oracledb'
import DatabaseInterface from "../../contracts/database"
import { Options, QAttributes } from '../../@types'
import DateFormat from '../../../../utils/DateFormat'

Oracle.outFormat = Oracle.OUT_FORMAT_OBJECT
Oracle.autoCommit = true

type Db = {
  execute: Function,
  close: Function
}

class OracleAdapter implements DatabaseInterface
{
  protected options: Options
  protected connection: Db
  protected attributes:QAttributes

  constructor(options: Options) {
    this.options = options
  }

  connect() {
    return new Promise((resolve, reject) => {
      Oracle.getConnection({
        user: this.options.user,
        password: this.options.password,
        connectString: `${this.options.host}/${this.options.database}`,
      }).then(res => {
        this.connection = res
        resolve('')
      }).catch(err => {
        reject(err)
      })  
    })    
  }

  query(attributes:QAttributes):Promise<any> {
    this.attributes = attributes
    return new Promise((resolve, reject) => {
      let query;
      switch(this.attributes.command) {
        case "count":
          query = this.getSelect()
          break;
        case "select":
          query = this.getSelect()
          break;
        case "insert":
          query = this.getInsert()
          break;
        case "update":
          query = this.getUpdate()
          break;
        case "delete":
          query = this.getDelete()
          break;
      }
      console.log('query', query)
      
      this.connection.execute(query, this.getParams(this.attributes.command))
        .then(result => {
          if (result.rows && result.rows.length && this.attributes.command === 'count') {
            return resolve(this.keysToLowerCase(result)[0].aggregate)
          }

          if (result.rows && this.attributes.command === 'select') {
            return resolve(this.keysToLowerCase(result))
          }

          if (result.rowsAffected && this.attributes.command === 'insert') {
            return resolve(result.outBinds.id)
          }

          if (result.rowsAffected && this.attributes.command === 'update') {
            return resolve(this.attributes.primaryKeyValue)
          }
          
          return resolve(result)
        }).catch(err => {
          reject(err)
        })
    })
  }

  close() {
    this.connection.close();
  }

  getParams(cmd) {
    if (cmd === 'insert') {
      return {id: { dir: Oracle.BIND_OUT, type: Oracle.NUMBER } }
    }
    return {}
  }

  getSelect(): string {
    let query = `SELECT ${this.getSelected()} FROM ${this.attributes.table}`
    query += this.getJoins()
    query += this.getWhere()
    query += this.getOrderBy()
    return this.getPaginate(query)
  }

  getJoins(): string {
    if (!this.attributes.joins) {
      return ''
    }
    let query = '';
    this.attributes.joins.forEach((join: any, idx) => {
      query += ` INNER JOIN ${join.table} ON ${this.checkField(join.foreignKey)} = ${(!join.primaryKey) ? `${this.attributes.table}.${this.attributes.primaryKey}` : this.checkField(join.primaryKey)} `
    })
    return query
  }

  checkField(value:string): string {
    if (!value.includes('.')) {
      return `${this.attributes.table}.${value}`
    }

    let [table, param] = value.split('.')
    if (!param.includes(' ')) {
      return `${table}.${param}`
    }
    
    let [field, name] = param.split(' ')
    return `${table}.${field} ${name}`
  }

  getInsert(): string {
    let query = `INSERT INTO ${this.attributes.table} ( ${this.attributes.primaryKey}, ${this.getFieldString()} )`
    query += ` VALUES (${this.getNextPrimaryKey()}, ${this.getValueString()}) RETURNING ${this.attributes.primaryKey} INTO :${this.attributes.primaryKey}`
    return query
  }

  getUpdate(): string {
    let query = `UPDATE ${this.attributes.table} SET ${this.getFieldValueString()}`
    query += this.getWhere()
    return query
  }

  getDelete(): string {
    let query = `DELETE FROM ${this.attributes.table}`
    query += this.getWhere()
    return query
  }

  getSelected(): string {
    if (!this.attributes.select) {
      return '*'
    }

    let result: string = ''
    this.attributes.select.forEach((item,idx) => {
      if (!idx) {
        result += `${item}`
      } else {
        result += `, ${item}`
      }
    })
    
    return result
  }

  getNextPrimaryKey(): string {
    return `(select coalesce(max(t.${this.attributes.primaryKey}),0)+1 from ${this.attributes.table} t)`
  }

  getFieldString(): string {
    let result = ''

    Object.keys(this.attributes.fields).forEach((key, idx) => {
      if (!idx) {
        result += `${key}`
      } else {
        result += `, ${key}`
      }
    })

    return result
  }

  getValueString(): string {
    let result = ''
    Object.keys(this.attributes.fields).forEach((key, idx) => {
      if (idx) {
        result += `, `
      }
      if (Object.values(this.attributes.fields)[idx] instanceof Date) {
        result += `TO_DATE('${DateFormat.format(Object.values(this.attributes.fields)[idx] as Date, 'yyyy-MM-dd HH:ii:ss')}','RRRR-MM-DD HH24:MI:SS')`;
      } else if (Object.values(this.attributes.fields)[idx] instanceof Number) {
        result += Object.values(this.attributes.fields)[idx]
      } else {
        result += `'${Object.values(this.attributes.fields)[idx]}'`     
      }      
    })
    
    return result
  }

  getFieldValueString(): string {
    let result = ''

    Object.keys(this.attributes.fields).forEach((key, idx) => {
      if (key !== this.attributes.primaryKey) {
        if (idx) {
          result += `, `
        }
        if (Object.values(this.attributes.fields)[idx] instanceof Date) {
          result += `${key} = TO_DATE('${DateFormat.format(Object.values(this.attributes.fields)[idx] as Date, 'yyyy-MM-dd HH:mm:ss')}','RRRR-MM-DD HH24:MI:SS')`;
        } else if (Object.values(this.attributes.fields)[idx] instanceof Number) {
          result += `${key} = ${Object.values(this.attributes.fields)[idx]}`
        } else {
          result += `${key} = '${Object.values(this.attributes.fields)[idx]}'`     
        }
      }
    })

    return result
  }

  getWhere(): string {
    if (!this.attributes.where) {
      return ''
    }
    let result: string = ' WHERE '
    this.attributes.where.forEach((item: any, idx) => {
      result += this.checkAnd(idx)
      switch (item.method) {
        case 'GROUP_IN':
          break;
        case 'GROUP_OUT':
          break;
        case 'BETWEEN':
          result += `${this.checkField(item.field)} ${item.type} ${this.getValue(item.value[0])} AND ${this.getValue(item.value[1])}`
          break;
        case 'IN':
          result += `${this.checkField(item.field)} ${item.type} (${item.value.join(',')})`
          break;
        case 'NOT_IN':
          result += `${this.checkField(item.field)} ${item.type} (${item.value.join(',')})`
          break;
        case 'NULL':
          result += `${this.checkField(item.field)} ${item.type}`
          break;
        case 'NOT_NULL':
          result += `${this.checkField(item.field)} ${item.type}`
          break;
        default:
          result += `${this.checkField(item.field)} ${item.type} ${this.getValue(item.value)}`
      }
    })

    return result
  }

  checkAnd(idx: number): string {
    const { method } = this.attributes.where[idx]
    if (!idx && method !== 'GROUP_IN') return ''
    if (method === 'OR') return ' OR '
    if (method === 'GROUP_IN') return (!idx) ? ' ( ' : ' AND ( '
    if (method === 'GROUP_OUT') return ' )'
    if (this.attributes.where[idx-1].method === 'GROUP_IN') return ''
    return ' AND '
  }
  
  getValue(val): any {
    if (val instanceof Date) { 
     return `TO_DATE('${DateFormat.format(val as Date, 'yyyy-MM-dd HH:mm:ss')}','RRRR-MM-DD HH24:MI:SS')`
    } else if (val === null) {
      return 'NULL'
    }else if (val instanceof Number) {
      return val
    }
    return `'${val}'`
  }
  
  getOrderBy():string {
    if (!this.attributes.orderBy) {
      return ''
    }

    let result = ' ORDER BY '
    Object.keys(this.attributes.fields).forEach((key, idx) => {
      if (idx) {
        result += `, `
      }
      result += `t.${key} ${Object.values(this.attributes.fields)[idx]}`
    })
  }

  getPaginate(query: string):string {
    if (!this.attributes.limit && !this.attributes.offset) {
      return query
    }
    let from = (!this.attributes.offset) ? 0 : this.attributes.offset
    let to = (!this.attributes.limit) ? 500 : this.attributes.offset + this.attributes.limit
    return `SELECT * FROM (
        SELECT rownum rn, c.* FROM (${query}) c
      ) WHERE rn BETWEEN ${from} AND ${to}`
  }

  keysToLowerCase ({ rows }) {
    return rows.map(row => {
      const item = {}
      Object.keys(row).forEach((key, idx) => {
        item[key.toLowerCase()] = Object.values(row)[idx]
      })
      return item
    })
  }
}

export default OracleAdapter