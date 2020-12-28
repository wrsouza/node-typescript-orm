import Model from '../../infra/database/base/model';

class CommercialRoute extends Model {
  constructor() {
    super()
    this.table = 'commercial_routes'
    this.fillable = [
      'group_id',
      'seller_id',
      'company_id',
      'code',
      'name',
      'started_at',
      'ended_at',
      'active'
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new CommercialRoute; 