const fs = require('fs')
const path = require('path')
import api from '../../services/api'
import DateFormat from '../../utils/DateFormat';
import CommercialRouteCustomer from '../models/commercialRouteCustomer';

class CommercialRouteCustomerController {
  async index() {
    try {
      const total = await CommercialRouteCustomer.where('created_at', '>=', new Date('1993-01-01 10:45:32'))
        .orWhere('updated_at', '>=', new Date('1993-01-01 10:45:32'))
        .count();
      const limit = 100
      const total_request = ((total%limit)==0) ? total/limit : Math.floor(total/limit) + 1;
      let from = 0;
      let to = (from + limit) > total ? (total - from) : limit

      for (let i=0; i<total_request; i++) {

        const commercialRouteCustomers = await CommercialRouteCustomer.select('commercial_route_customers.code, commercial_route_customers.active, commercials.group_id, commercials.code commercial_route_code, customers.cpf_cnpj customer_cpf_cnpj, addresses.code address_code')
                                                                      .join('commercial_routes commercials', 'commercial_route_customers.commercial_route_id', 'commercials.id')
                                                                      .join('persons customers', 'commercial_route_customers.customer_id', 'customers.id')
                                                                      .join('person_addresses addresses', 'commercial_route_customers.address_id', 'addresses.id')
                                                                      .where('commercial_route_customers.created_at', '>=', new Date('1993-01-01 10:45:32'))
                                                                      .orWhere('commercial_route_customers.updated_at', '>=', new Date('1993-01-01 10:45:32'))
                                                                      .offset(from)
                                                                      .limit(to)
                                                                      .get()

        from += limit + 1
        to = (from + limit) > total ? (total - from) : limit
      
        const response = await api.post('commercial-route-customers', { commercialRouteCustomers })
        const { result: { errors } } = response.data     
                                  
        if (errors.length) {
          let folder = path.resolve(__dirname, '..', '..', '..', 'errors', `${DateFormat.format(new Date(), 'yyyy')}`, `${DateFormat.format(new Date(), 'MM')}`, `${DateFormat.format(new Date(), 'dd')}`);
          fs.mkdirSync(folder, { recursive: true })
          fs.writeFileSync(path.resolve(folder, `commercialRouteCustomers__${DateFormat.format(new Date(), 'yyyy_MM_dd_HH_ii_ss')}.json`), JSON.stringify(errors))
        }

      }
      
    } catch(err) {
      console.error(err.response.data)
    }
  }
}

export default new CommercialRouteCustomerController