import Model from '../../infra/database/base/model';

class User extends Model {
  constructor() {
    super()
    this.table = "users"
    this.fillable = [
      "name", 
      "email", 
      "email_verified_at",
      "remember_token",
      "password"
    ]
    this.hidden = [
      "password", 
      "remember_token"
    ]
  }
}

export default new User;