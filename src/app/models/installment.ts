import Model from '../../infra/database/base/model';

class Installment extends Model {
  constructor() {
    super()
    this.table = "installments"
    this.fillable = [
      "group_id",
      "code", 
      "name",
      "qtd",
      "default",
      "incash"
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new Installment; 