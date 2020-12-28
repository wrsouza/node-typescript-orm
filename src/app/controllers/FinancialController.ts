const fs = require('fs')
const path = require('path')
import api from '../../services/api'
import DateFormat from '../../utils/DateFormat';
import Financial from '../models/financial';

class FinancialController {
  async index() {
    try {      
      const total = await Financial.join('persons company', 'company.id', 'financials.company_id')
        .join('persons customer', 'customer.id', 'financials.customer_id')
        .join('payments', 'payments.id', 'financials.payment_id').where('created_at', '>=', new Date('1993-01-01 10:45:32'))
        .orWhere('updated_at', '>=', new Date('1993-01-01 10:45:32'))
        .count()

      const limit = 100
      const total_request = ((total%limit)==0) ? total/limit : Math.floor(total/limit) + 1;
      let from = 0;
      let to = (from + limit) > total ? (total - from) : limit

      for (let i=0; i<total_request; i++) { 

        const financials = await Financial.select([
            'company.group_id', 
            'financials.code', 
            'financials.description', 
            'company.cpf_cnpj company_cpf_cnpj',
            'customer.cpf_cnpj customer_cpf_cnpj',
            'payments.code payment_code',
            'financials.installment',
            'financials.total',
            'financials.pending',
            'financials.status',
            'financials.generated_at',
            'financials.expired_at'
          ])
          .join('persons company', 'company.id', 'financials.company_id')
          .join('persons customer', 'customer.id', 'financials.customer_id')
          .join('payments', 'payments.id', 'financials.payment_id')
          .where('financials.created_at', '>=', new Date('1993-01-01 10:45:32'))
          .orWhere('financials.updated_at', '>=', new Date('1993-01-01 10:45:32'))
          .offset(from)
          .limit(to)
          .get()
                                  
        from += limit + 1
        to = (from + limit) > total ? (total - from) : limit

        const response = await api.post('financials', { financials })
        const { result: { errors } } = response.data
                                  
        if (errors.length) {
          let folder = path.resolve(__dirname, '..', '..', '..', 'errors', `${DateFormat.format(new Date(), 'yyyy')}`, `${DateFormat.format(new Date(), 'MM')}`, `${DateFormat.format(new Date(), 'dd')}`);
          fs.mkdirSync(folder, { recursive: true })
          fs.writeFileSync(path.resolve(folder, `financials__${DateFormat.format(new Date(), 'yyyy_MM_dd_HH_ii_ss')}.json`), JSON.stringify(errors))
        }
      }
    } catch(err) {
      console.error(err.response.data)
    }
  }
}

export default new FinancialController