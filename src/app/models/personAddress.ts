import Model from '../../infra/database/base/model';

class PersonAddress extends Model {
  constructor() {
    super()
    this.table = "person_addresses"
    this.fillable = [
      "person_id",
      "address_type_id",
      "code", 
      "postcode",
      "address",
      "number",
      "complement",
      "district",
      "city",
      "state",
      "country",
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new PersonAddress; 