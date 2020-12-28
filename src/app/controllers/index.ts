import CategoryController from "./CategoryController"
import CommercialRouteController from "./CommercialRouteController"
import CommercialRouteCustomerController from "./CommercialRouteCustomerController"
import ExchangeController from "./ExchangeController"
import FinancialController from "./FinancialController"
import InstallmentController from "./InstallmentController"
import JustificationController from "./JustificationController"
import PaymentController from "./PaymentController"
import PersonController from "./PersonController"
import PriceController from "./PriceController"
import ProductController from "./ProductController"

class Action {
  
  async start() {
    try {
      await PersonController.index()
      console.log('====================================================(complete persons)=============================')
      await CategoryController.index()
      console.log('====================================================(complete categories)==========================')
      await ProductController.index()
      console.log('====================================================(complete products)============================')
      await CommercialRouteController.index()
      console.log('====================================================(complete commercialRoutes)====================')
      await CommercialRouteCustomerController.index()
      console.log('====================================================(complete commercialRouteCustomers)============')
      await PriceController.index()
      console.log('====================================================(complete prices)==============================')
      await PaymentController.index()
      console.log('====================================================(complete payment)==============================')
      await InstallmentController.index()
      console.log('====================================================(complete installment)==============================')
      await JustificationController.index()
      console.log('====================================================(complete justification)==============================')
      await ExchangeController.index()
      console.log('====================================================(complete exchange)==============================')
      await FinancialController.index()
      console.log('====================================================(complete financial)==============================')
      console.log('complete all controllers')
    } catch (err) {
      console.log(err)
    }
  }
}

export default new Action