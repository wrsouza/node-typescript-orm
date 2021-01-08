const fs = require('fs')
const path = require('path')
import api from '../../services/api'
import DateFormat from '../../utils/DateFormat';
import Installment from '../models/installment';

class InstallmentController {
  async index() {
    try {
      const listInstallments = await Installment.all()
      const companies = await Installment.select('company_installment.installment_id, persons.cpf_cnpj')
        .join('company_installment', 'company_installment.installment_id')
        .join('persons', 'persons.id', 'company_installment.company_id')
        .whereIn('company_installment.installment_id', listInstallments.map(item => item.id))
        .get()
      const customers = await Installment.select('customer_installment.installment_id, persons.cpf_cnpj')
        .join('customer_installment', 'customer_installment.installment_id')
        .join('persons', 'persons.id', 'customer_installment.customer_id')
        .whereIn('customer_installment.installment_id', listInstallments.map(item => item.id))
        .get()
      const installments = listInstallments.map(installment => ({
        ...installment,
        companies: companies.filter(company => company.installment_id === installment.id).map(company => company.cpf_cnpj),
        customers: customers.filter(customer => customer.installment_id === installment.id).map(customer => customer.cpf_cnpj),
      }))
      
      const response = await api.post('installments', { installments })
      const { result: { errors } } = response.data
                                 
      if (errors.length) {
        let folder = path.resolve(__dirname, '..', '..', '..', 'errors', `${DateFormat.format(new Date(), 'yyyy')}`, `${DateFormat.format(new Date(), 'MM')}`, `${DateFormat.format(new Date(), 'dd')}`);
        fs.mkdirSync(folder, { recursive: true })
        fs.writeFileSync(path.resolve(folder, `installments__${DateFormat.format(new Date(), 'yyyy_MM_dd_HH_ii_ss')}.json`), JSON.stringify(errors))
      }
      
    } catch(err) {
      console.error(err.response.data)
    }
  }
}

export default new InstallmentController