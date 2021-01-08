const fs = require('fs')
const path = require('path')
import api from '../../services/api'
import DateFormat from '../../utils/DateFormat';
import Product from "../models/product"

class ProductController {
  async index() {
    try {      
      const total = await Product.where('created_at', '>=', new Date('1993-01-01 10:45:32'))
        .orWhere('updated_at', '>=', new Date('1993-01-01 10:45:32'))
        .count()                      
      const limit = 100
      const total_request = ((total%limit)==0) ? total/limit : Math.floor(total/limit) + 1;
      let from = 0;
      let to = (from + limit) > total ? (total - from) : limit

      for (let i=0; i<total_request; i++) { 

        const products = await Product.select('products.id, products.code, products.name, products.tag, products.status, products.discount_limit, subcategory.group_id, category.code cod_grupo, subcategory.code cod_subgrupo')
          .join('categories subcategory', 'products.category_id', 'subcategory.id')
          .join('categories category', 'category.id', 'subcategory.category_id')
          .where('created_at', '>=', new Date('1993-01-01 10:45:32'))
          .orWhere('updated_at', '>=', new Date('1993-01-01 10:45:32'))
          .offset(from)
          .limit(to)
          .get()
        
        from += limit + 1
        to = (from + limit) > total ? (total - from) : limit                                 

        const response = await api.post('products', { products })
        const { result: { errors } } = response.data
                                  
        if (errors.length) {
          let folder = path.resolve(__dirname, '..', '..', '..', 'errors', `${DateFormat.format(new Date(), 'yyyy')}`, `${DateFormat.format(new Date(), 'MM')}`, `${DateFormat.format(new Date(), 'dd')}`);
          fs.mkdirSync(folder, { recursive: true })
          fs.writeFileSync(path.resolve(folder, `products__${DateFormat.format(new Date(), 'yyyy_MM_dd_HH_ii_ss')}.json`), JSON.stringify(errors))
        }
      }
    } catch(err) {
      console.error(err.response.data)
    }
  }
}

export default new ProductController