import { ConnectionPool } from 'mssql'
import Database from "../../contracts/database"
import { Options, QAttributes } from '../../@types'
import DateFormat from '../../../../utils/DateFormat'

type Db = {
  connect: Function,
  query: Function,
  request: Function
}

class MssqlAdapter implements Database
{
  protected options: Options
  protected connection: Db
  protected attributes:QAttributes

  constructor(options: Options) {
    this.options = options
  }

  connect() {
    let self = this
    return new Promise((resolve, reject) => { 
      const conn = new ConnectionPool({
        user: this.options.user,
        password: this.options.password,
        server: this.options.host,
        port: this.options.port,
        database: this.options.database,
        options: {
          enableArithAbort: true
        }
      })
      conn.connect().then(res => {
        self.connection = res
        resolve(res)
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    })
  }

  
  query(attributes:QAttributes):Promise<any> {
    this.attributes = attributes
    return new Promise((resolve, reject) => {
      let query;
      switch(this.attributes.command) {
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

        if (this.attributes.command === 'insert') {
          return resolve(res.recordset[0][this.attributes.primaryKey])
        }

        if (this.attributes.command === 'update') {
          return resolve(this.attributes.primaryKeyValue)
        }

        return resolve(res.recordset)
      })
    })
  }

  getSelect(): string {
    let query = `SELECT ${this.getSelected()} FROM ${this.attributes.table}`
    query += this.getWhere()
    query += this.getOrWhere()
    query += this.getOrderBy()
    query += this.getLimit()
    query += this.getOffset()
    return query
  }

  getInsert(): string {
    let query = `SET IDENTITY_INSERT ${this.attributes.table} ON`
    query += ` INSERT INTO ${this.attributes.table} ( ${this.attributes.primaryKey}, ${this.getFieldString()} )`
    query += ` OUTPUT Inserted.${this.attributes.primaryKey}`
    query += ` VALUES ( ${this.getNextPrimaryKey()}, ${this.getValueString()} )`
    query += ` SET IDENTITY_INSERT ${this.attributes.table} OFF`
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
          result += `${key} = '${DateFormat.format(Object.values(this.attributes.fields)[idx] as Date, 'yyyy-MM-dd HH:ii:ss')}'`;
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

    let result:string = ' WHERE '
    this.attributes.where.forEach((item,idx) => {
      if (!idx) {
        result += `${item[0]} ${item[1]} '${item[2]}'`
      } else {
        result += ` AND ${item[0]} ${item[1]} '${item[2]}'`
      }  
    })

    return result
  }

  getOrWhere(): string {
    if (!this.attributes.orWhere) {
      return ''
    }

    let result:string = ' OR '
    this.attributes.orWhere.forEach((item,idx) => {
      if (!idx) {
        result += `${item[0]} ${item[1]} '${item[2]}'`
      } else {
        result += ` OR ${item[0]} ${item[1]} '${item[2]}'`
      }
    })

    return result
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
      result += `${key} ${Object.values(this.attributes.fields)[idx]}`
    })
  }

  getLimit():string {
    if (!this.attributes.limit) {
      return ''
    }

    return ` LIMIT ${this.attributes.limit}`
  }

  getOffset():string {
    if (!this.attributes.offset) {
      return ''
    }
    return ` OFFSET ${this.attributes.offset}`
  }

  keysToLowerCase (rows) {
    return rows.map(row => {
      const item = {}
      Object.keys(row).forEach((key, idx) => {
        item[key.toLowerCase()] = Object.values(row)[idx]
      })
      return item
    })
  }

  close() {
    
  }
}

export default MssqlAdapter