const fs = require('fs')
const path = require('path')
import api from '../../services/api'
import DateFormat from '../../utils/DateFormat';
import Justification from '../models/justification';

class JustificationController {
  async index() {
    try {
      const justifications = await Justification.all()
      
      const response = await api.post('justifications', { justifications })
      const { result: { errors } } = response.data
                                 
      if (errors.length) {
        let folder = path.resolve(__dirname, '..', '..', '..', 'errors', `${DateFormat.format(new Date(), 'yyyy')}`, `${DateFormat.format(new Date(), 'MM')}`, `${DateFormat.format(new Date(), 'dd')}`);
        fs.mkdirSync(folder, { recursive: true })
        fs.writeFileSync(path.resolve(folder, `justifications__${DateFormat.format(new Date(), 'yyyy_MM_dd_HH_ii_ss')}.json`), JSON.stringify(errors))
      }
      
    } catch(err) {
      console.error(err.response.data)
    }
  }
}

export default new JustificationController