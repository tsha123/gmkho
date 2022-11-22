
import {checkPermission, management , insert , update, insert_import} from "../api/ControllerExternalRepairService/index.js";


function createControllerExternalRepairService(app) {
    checkPermission(app)
    management(app)
    insert(app)
    update(app)
    insert_import(app)

}
export default createControllerExternalRepairService