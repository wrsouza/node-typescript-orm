import Model from '../../infra/database/base/model';

class Exchange extends Model {
  constructor() {
    super()
    this.table = "exchanges"
    this.fillable = [
      "group_id",
      "code", 
      "description"
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new Exchange; 