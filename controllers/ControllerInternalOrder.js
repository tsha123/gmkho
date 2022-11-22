
import { checkPermission, insert, management, update_product ,remove ,checkPermissionExport, confirmExport ,confirmImport} from "../api/ControllerInternalOrder/index.js";
import * as helper from '../helper/helper.js'
import * as validator from '../helper/validator.js'

function createControllerInternalOrder(app) {
    checkPermission(app)  
    checkPermissionExport(app)
    insert(app)
    management(app)
    update_product(app)
    remove(app)
    confirmExport(app)
    confirmImport(app)
}
export default createControllerInternalOrder