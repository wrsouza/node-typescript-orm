const fs = require('fs')
const path = require('path')
import api from '../../services/api'
import DateFormat from '../../utils/DateFormat';
import Payment from '../models/payment';

class PaymentController {
  async index() {
    try {
      const listPayments = await Payment.all()
      const companies = await Payment.select('company_payment.payment_id, persons.cpf_cnpj')
        .join('company_payment', 'company_payment.payment_id')
        .join('persons', 'persons.id', 'company_payment.company_id')
        .whereIn('company_payment.payment_id', listPayments.map(item => item.id))
        .get()

      const payments = listPayments.map(payment => ({
        ...payment,
        companies: companies.filter(company => company.payment_id === payment.id).map(company => company.cpf_cnpj)
      }))
      
      const response = await api.post('payments', { payments })
      const { result: { errors } } = response.data
                                 
      if (errors.length) {
        let folder = path.resolve(__dirname, '..', '..', '..', 'errors', `${DateFormat.format(new Date(), 'yyyy')}`, `${DateFormat.format(new Date(), 'MM')}`, `${DateFormat.format(new Date(), 'dd')}`);
        fs.mkdirSync(folder, { recursive: true })
        fs.writeFileSync(path.resolve(folder, `payments__${DateFormat.format(new Date(), 'yyyy_MM_dd_HH_ii_ss')}.json`), JSON.stringify(errors))
      }
      
    } catch(err) {
      console.error(err.response.data)
    }
  }
}

export default new PaymentController