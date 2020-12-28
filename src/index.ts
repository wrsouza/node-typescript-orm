import models from './app/models'
import controllers from './app/controllers'

class App {
  async init() {
    await models.setup()
    console.log('conectado.')
    await controllers.start()
  }
}

(new App()).init()  