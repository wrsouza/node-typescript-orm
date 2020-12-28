import Model from '../../infra/database/base/model';

class Person extends Model {
  constructor() {
    super()
    this.table = "persons"
    this.fillable = [
      "group_id", 
      "code", 
      "company",
      "name",
      "cpf_cnpj",
      "rg_ie",
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new Person; 