
import { management , insert  ,checkValueCode} from "../api/ControllerVoucher/index.js";


function createControllerVoucher(app) {
    management(app)
    insert(app)
    checkValueCode(app)

}
export default createControllerVoucher