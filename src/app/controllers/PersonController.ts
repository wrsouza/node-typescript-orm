const fs = require('fs')
const path = require('path')
import api from '../../services/api'
import DateFormat from '../../utils/DateFormat';
import Person from "../models/person"
import personAddress from '../models/personAddress';
import personContact from '../models/personContact';

class PersonController {
  async index() {
    try {
      const total = await Person.count();
      const limit = 100
      const total_request = ((total%limit)==0) ? total/limit : Math.floor(total/limit) + 1;
      let from = 0;
      let to = (from + limit) > total ? (total - from) : limit

      for (let i=0; i<total_request; i++) {

        const list = await Person.where('created_at', '>=', new Date('1993-01-01 10:45:32'))
          .orWhere('updated_at', '>=', new Date('1993-01-01 10:45:32'))
          .offset(from)
          .limit(to)
          .get()

        const types = await Person.select(['id', 'person_type.person_type_id'])
          .join('person_type', 'person_type.person_id', 'persons.id')
          .whereIn('id', list.map(item => item.id))
          .get()

        const addresses = await personAddress.whereIn('person_id', list.map(item => item.id)).get()

        const contacts = await personContact.whereIn('person_id', list.map(item => item.id)).get()

        from += limit + 1
        to = (from + limit) > total ? (total - from) : limit                                 

        const persons = list.map(person => ({
          ...person,
          types: types.filter(type => type.id === person.id)
                      .map(type => type.person_type_id),
          addresses: addresses.filter(address => address.person_id === person.id),
          contacts: contacts.filter(contact => contact.person_id === person.id)
        }))
        
        const response = await api.post('persons', { persons })
        const { result: { errors } } = response.data
                                  
        if (errors.length) {
          let folder = path.resolve(__dirname, '..', '..', '..', 'errors', `${DateFormat.format(new Date(), 'yyyy')}`, `${DateFormat.format(new Date(), 'MM')}`, `${DateFormat.format(new Date(), 'dd')}`);
          fs.mkdirSync(folder, { recursive: true })
          fs.writeFileSync(path.resolve(folder, `persons__${DateFormat.format(new Date(), 'yyyy_MM_dd_HH_ii_ss')}.json`), JSON.stringify(errors))
        }
      }
    } catch(err) {
      console.error(err.response.data)
    }
  }
}

export default new PersonController