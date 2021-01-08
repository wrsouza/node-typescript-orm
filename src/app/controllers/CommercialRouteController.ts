const fs = require('fs')
const path = require('path')
import api from '../../services/api'
import DateFormat from '../../utils/DateFormat';
import CommercialRoute from '../models/commercialRoute';

class CommercialRouteController {
  async index() {
    try {
      const commercialRoutes = await CommercialRoute.select('commercial_routes.group_id, commercial_routes.code, commercial_routes.name, commercial_routes.active, sellers.cpf_cnpj seller_cpf_cnpj, companies.cpf_cnpj company_cpf_cnpj')
        .join('persons sellers', 'commercial_routes.seller_id', 'sellers.id')
        .join('persons companies', 'commercial_routes.company_id', 'companies.id')
        .where('commercial_routes.created_at', '>=', new Date('1993-01-01 10:45:32'))
        .orWhere('commercial_routes.updated_at', '>=', new Date('1993-01-01 10:45:32'))
        .get()

      const response = await api.post('commercial-routes', { commercialRoutes })
      const { result: { errors } } = response.data     
                                 
      if (errors.length) {
        let folder = path.resolve(__dirname, '..', '..', '..', 'errors', `${DateFormat.format(new Date(), 'yyyy')}`, `${DateFormat.format(new Date(), 'MM')}`, `${DateFormat.format(new Date(), 'dd')}`);
        fs.mkdirSync(folder, { recursive: true })
        fs.writeFileSync(path.resolve(folder, `commercialRoutes__${DateFormat.format(new Date(), 'yyyy_MM_dd_HH_ii_ss')}.json`), JSON.stringify(errors))
      }
      
    } catch(err) {
      console.error(err.response.data)
    }
  }
}

export default new CommercialRouteController