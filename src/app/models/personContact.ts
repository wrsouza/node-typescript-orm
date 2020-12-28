import Model from '../../infra/database/base/model';

class PersonContact extends Model {
  constructor() {
    super()
    this.table = "person_contacts"
    this.fillable = [
      "person_id",
      "contact_type_id",
      "value"
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new PersonContact; 