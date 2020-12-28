export type WhereType = {
  field: string
  type: string
  value: any
  method: string
}

export type QAttributes = {
  command:string, 
  table:string, 
  select:Array<string>|null,
  fields:Array<object>|null, 
  primaryKey:string|null, 
  primaryKeyValue:string|null,
  where:Array<WhereType> | null,
  orWhere:Array<object>|null,
  whereIn:Array<object>|null,
  orderBy:Array<object>|null
  limit:number|null
  offset:number|null
  joins: Array<object>|null,
}

export type Options = {
  driver: string,
  host: string,
  port: number,
  database: string,
  user: string,
  password: string
}