
import { management , insert , update , report_payment_and_receipts,delete_payment, get_data_print} from "../api/ControllerPayment/index.js";


function createControllerPayment(app) {
    management(app)
    insert(app)
    update(app)
    report_payment_and_receipts(app)
    delete_payment(app)
    get_data_print(app)

}
export default createControllerPayment