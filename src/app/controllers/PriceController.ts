const fs = require('fs')
const path = require('path')
import api from '../../services/api'
import DateFormat from '../../utils/DateFormat';
import Price from "../models/price"

class PriceController {
  async index() {
    try {
      const list = await Price.where('created_at', '>=', new Date('1993-01-01 10:45:32'))
        .orWhere('updated_at', '>=', new Date('1993-01-01 10:45:32'))
        .get()

      const products = await Price.select('prices.id price_id, sub.group_id, cat.code cat_code, sub.code sub_code, products.code, product_price.qtd_start, product_price.qtd_end, product_price.price')
        .join('product_price', 'product_price.price_id', 'prices.id')
        .join('products', 'products.id', 'product_price.product_id')
        .join('categories sub', 'sub.id', 'products.category_id')
        .join('categories cat', 'cat.id', 'sub.category_id')
        .get()
      
      const customers = await Price.select('prices.id, persons.code')
        .join('customer_price', 'customer_price.price_id', 'prices.id')
        .join('persons', 'persons.id', 'customer_price.customer_id')
        .get()

      const companies = await Price.select('prices.id, persons.code')
        .join('company_price', 'company_price.price_id', 'prices.id')
        .join('persons', 'persons.id', 'company_price.company_id')
        .get()

      products.reduce((arr, item) => { if (item.id === list[0].id) { arr.push(item.code) } return arr }, [])
                                   
      const prices = list.map(price => ({
        ...price,
        products: products.filter(item => item.price_id === price.id),
        customers: customers.reduce((arr, item) => { if (item.id === price.id) { arr.push(item.code) } return arr }, []),
        companies: companies.reduce((arr, item) => { if (item.id === price.id) { arr.push(item.code) } return arr }, []),
      }))

      
      const response = await api.post('prices', { prices })
      const { result: { errors } } = response.data

      if (errors.length) {
        let folder = path.resolve(__dirname, '..', '..', '..', 'errors', `${DateFormat.format(new Date(), 'yyyy')}`, `${DateFormat.format(new Date(), 'MM')}`, `${DateFormat.format(new Date(), 'dd')}`);
        fs.mkdirSync(folder, { recursive: true })
        fs.writeFileSync(path.resolve(folder, `prices__${DateFormat.format(new Date(), 'yyyy_MM_dd_HH_ii_ss')}.json`), JSON.stringify(errors))
      }
    } catch(err) {
      console.error(err.response.data) 
    }
  }
}

export default new PriceController