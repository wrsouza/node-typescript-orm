import Model from '../../infra/database/base/model';

class Justification extends Model {
  constructor() {
    super()
    this.table = "justifications"
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

export default new Justification; 