import IDate from '../../contracts/date'
import { format } from 'date-fns'

class DateFormat implements IDate {
  format(value:Date|null, formatValue:string):string {
    return format(!value?new Date():value, formatValue)
  }
}

export default new DateFormat