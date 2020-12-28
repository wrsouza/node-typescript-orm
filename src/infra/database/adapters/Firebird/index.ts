import * as Firebird from "node-firebird"
import DatabaseInterface from "../../contracts/database"
import { Options, QAttributes } from '../../@types'
import DateFormat from "../../../../utils/DateFormat"

type Db = {
  query: Function,
  detach: Function
}

class FirebirdAdapter implements DatabaseInterface
{
  protected options: Options
  protected connection: Db
  protected attributes:QAttributes

  constructor(options: Options) {
    this.options = options
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      Firebird.attach({...this.options, lowercase_keys: true}, (err, db) => {
        if (err) {
          reject(err)
        }
        this.connection = db
        resolve('')
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
      console.log(query)

      this.connection.query(query, (err, res) => {
        if (err) {
          reject(err)
        }
        
        if (this.attributes.command === 'count') {
          return resolve(res[0].aggregate)
        }
        
        if (this.attributes.command === 'insert') {
          return resolve(res[this.attributes.primaryKey])
        }

        if (this.attributes.command === 'update') {
          return resolve(this.attributes.primaryKeyValue)
        }

        if (this.attributes.command === 'delete') {
          return resolve(res)
        }

        let result = []
        res.forEach((row) => {
          let data = {}
          for (let key in row) {
            //if (row[key]) {
              //console.log(row[key])
              data[key] =
                typeof row[key] === "object" ? this.ab2str(row[key]) : row[key]
            //}
          }
          result.push(data)
        })
        
        resolve(result)
      })
    })
  }

  close() {
    this.connection.detach()
  }

  getSelect(): string {
    let query = `SELECT ${this.getSelected()} FROM "${this.attributes.table}" ${this.attributes.table}`
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
      query += ` INNER JOIN ${this.checkTable(join.table)} ON ${this.checkField(join.foreignKey)} = ${(!join.primaryKey) ? `${this.attributes.table}."${this.attributes.primaryKey}"` : this.checkField(join.primaryKey)} `
    })
    return query
  }

  checkTable(value:string): string {
    if (!value.includes(' ')) {
      return `"${value}" ${value}`
    }
    
    let [table, name] = value.split(' ')
    return `"${table}" ${name}`
  }

  checkField(value:string): string {
    if (!value.includes('.')) {
      return `${this.attributes.table}."${value}"`
    }

    let [table, param] = value.split('.')
    if (!param.includes(' ')) {
      return `${table}."${param}"`
    }
    
    let [field, name] = param.split(' ')
    return `${table}."${field}" ${name}`
  }

  getInsert(): string {
    let query = `INSERT INTO "${this.attributes.table}" ( "${this.attributes.primaryKey}", ${this.getFieldString()} )`
    query += ` VALUES (${this.getNextPrimaryKey()}, ${this.getValueString()}) RETURNING "${this.attributes.primaryKey}"`
    return query
  }

  getUpdate(): string {
    let query = `UPDATE "${this.attributes.table}" SET ${this.getFieldValueString()}`
    query += this.getWhere()
    return query
  }

  getDelete(): string {
    let query = `DELETE FROM "${this.attributes.table}"`
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
        result += (this.attributes.command === 'count') ? `${item.trim()}` : `${this.checkField(item.trim())}`
      } else {
        result += `, ${this.checkField(item.trim())}`
      }
    })
    
    return result
  }

  getNextPrimaryKey(): string {
    return `(SELECT COALESCE(MAX(t."${this.attributes.primaryKey}"),0)+1 FROM "${this.attributes.table}" t)`
  }

  getFieldString(): string {
    let result = ''

    Object.keys(this.attributes.fields).forEach((key, idx) => {
      if (!idx) {
        result += `"${key}"`
      } else {
        result += `, "${key}"`
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
        result += `'${DateFormat.format(Object.values(this.attributes.fields)[idx] as Date, 'yyyy-MM-dd HH:ii:ss')}'`;
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
          result += `"${key}" = '${DateFormat.format(Object.values(this.attributes.fields)[idx] as Date, 'yyyy-MM-dd HH:ii:ss')}'`;
        } else if (Object.values(this.attributes.fields)[idx] instanceof Number) {
          result += `"${key}" = ${Object.values(this.attributes.fields)[idx]}`
        } else {
          result += `"${key}" = '${Object.values(this.attributes.fields)[idx]}'`     
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
          result += `${this.attributes.table}."${item.field}" ${item.type} ${this.getValue(item.value[0])} AND ${this.getValue(item.value[1])}`
          break;
        case 'IN':
          result += `${this.attributes.table}."${item.field}" ${item.type} (${item.value.join(',')})`
          break;
        case 'NOT_IN':
          result += `${this.attributes.table}."${item.field}" ${item.type} (${item.value.join(',')})`
          break;
        case 'NULL':
          result += `${this.attributes.table}."${item.field}" ${item.type}`
          break;
        case 'NOT_NULL':
          result += `${this.attributes.table}."${item.field}" ${item.type}`
          break;
        default:
          result += `${this.attributes.table}."${item.field}" ${item.type} ${this.getValue(item.value)}`
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
     return `'${DateFormat.format(val as Date, 'yyyy-MM-dd HH:ii:ss')}'`
    } else if (val instanceof Number) {
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
      result += `${this.attributes.table}."${key}" ${Object.values(this.attributes.fields)[idx]}`
    })
  }

  getPaginate(query: string):string {
    if (!this.attributes.limit && !this.attributes.offset) {
      return query
    }
    return `SELECT FIRST ${this.attributes.limit} 
                   SKIP ${this.attributes.offset} * 
                   FROM (${query})`
  }

  ab2str(buf) {
    if (buf instanceof Buffer) {
      return buf.toString('utf8')
      // return String.fromCharCode.apply(null, new Uint16Array(buf))
    }
    return buf
  }
}

export default FirebirdAdapter