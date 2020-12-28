import databaseOrm from '../../infra/database'
import databaseConfig from '../../config/database'
import Db from "../../infra/database/contracts/database"

import User from './user'
import Person from './person'
import PersonAddress from './personAddress'
import PersonContact from './personContact'
import Category from './category'
import Product from './product'
import CommercialRoute from './commercialRoute'
import CommercialRouteCustomer from './commercialRouteCustomer'
import Price from './price'
import Payment from './payment'
import Installment from './installment'
import Justification from './justification'
import Exchange from './exchange'
import Financial from './financial'

const models = [ 
  User, 
  Person, 
  PersonAddress, 
  PersonContact, 
  Category, 
  Product, 
  CommercialRoute,
  CommercialRouteCustomer,
  Price,
  Payment,
  Installment,
  Justification,
  Exchange,
  Financial,
]

class Database {
  protected orm:Db

  async setup() {
    this.orm = await databaseOrm(databaseConfig)
    await this.orm.connect()

    models.map(model => {
      model.setDb(this.orm)
    })
  }
}

export default new Database