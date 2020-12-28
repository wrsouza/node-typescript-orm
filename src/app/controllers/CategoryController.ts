const fs = require('fs')
const path = require('path')
import api from '../../services/api'
import DateFormat from '../../utils/DateFormat';
import Category from "../models/category"

class CategoryController {
  async index() {
    try {
      const list = await Category.whereNull('category_id').get()
      const subs = await Category.whereIn('category_id', list.map(item => item.id)).get()
      
      const categories = list.map(category => ({
        ...category,
        categories: subs.filter(sub => sub.category_id === category.id)
      }))
      
      const response = await api.post('categories', { categories })
      const { result: { errors } } = response.data     
                                 
      if (errors.length) {
        let folder = path.resolve(__dirname, '..', '..', '..', 'errors', `${DateFormat.format(new Date(), 'yyyy')}`, `${DateFormat.format(new Date(), 'MM')}`, `${DateFormat.format(new Date(), 'dd')}`);
        fs.mkdirSync(folder, { recursive: true })
        fs.writeFileSync(path.resolve(folder, `categories__${DateFormat.format(new Date(), 'yyyy_MM_dd_HH_ii_ss')}.json`), JSON.stringify(errors))
      }
    } catch(err) {
      console.error(err.response.data)
    }
  }
}

export default new CategoryController