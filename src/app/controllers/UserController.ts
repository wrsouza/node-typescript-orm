import DateFormat from '../../utils/DateFormat'
import Hash from '../../utils/Hash'
import User from '../models/user'

class UserController {
  async index() {
    try {
      const users = await User.all()
      console.log(users)
    } catch(err) {
      console.error(err)
    }
  }

  async store() {
    try {
      const name:string = 'Fulano da Silva'
      const email:string = 'fulano.silva@domain.com'
      const password:string = Hash.make('123456')
      const email_verified_at:Date = new Date('2020-09-23 10:45:32') // DateFormat.format(null, 'yyyy-MM-dd HH:ii:ss');
      const data = { name, email, email_verified_at, password }
      const user = await User.create(data)
      console.log(user)
    } catch(err) {
      console.error(err)
    } 
  }

  async show() {
    try {
      const user = await User.find("11")
      console.log(user)
    } catch(err) {
      console.error(err)
    }  
  }

  async update() {
    try {
      const id:string = '11'
      const name:string = 'Fulano da Silva2'
      const email:string = 'fulano2.silva@domain.com'
      const password:string = Hash.make('123456')
      const email_verified_at:Date = new Date('2020-09-23 10:45:32')
      const data = { id, name, email, email_verified_at, password }
      const user = await User.update(data)
      console.log(user)
    } catch(err) {
      console.error(err)
    }   
  }

  async destroy() {
    try {
      const user = await User.delete("11")
      console.log(user)
    } catch(err) {
      console.error(err)
    }
  }

  async search() {
    try {
      const users = await User.select('name,email,password')
        .where('name', 'like', '%maria%')
        .orWhere('name', 'like', '%Costa%')
        .get()
      console.log(users)
    } catch(err) {
      console.error(err)
    }
  }

  async handle() {
    try {
      console.log('------------------------------------------------------------')
      await this.index()     
      console.log('------------------------------------------------------------')
      await this.store()                   
      console.log('------------------------------------------------------------')
      await this.show()
      console.log('------------------------------------------------------------')
      await this.update()      
      console.log('------------------------------------------------------------')
      await this.destroy()      
      console.log('------------------------------------------------------------')
      await this.search()
    } catch (err) {
      console.log(err)
    }
  }
}

export default new UserController