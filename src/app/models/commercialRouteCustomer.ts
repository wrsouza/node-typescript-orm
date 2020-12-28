import Model from '../../infra/database/base/model';

class CommercialRouteCustomer extends Model {
  constructor() {
    super()
    this.table = 'commercial_route_customers'
    this.fillable = [
      'commercial_route_id',
      'customer_id',
      'address_id',
      'code',
      'sequency',
      'active'
    ]
    this.hidden = [
      "created_at",
      "updated_at"
    ]
  }
}

export default new CommercialRouteCustomer; 