
import {checkPermission, management , insert , update} from "../api/ControllerBorrow/index.js";


function createControllerBorrow(app) {
    checkPermission(app)
    management(app)
    insert(app)
    update(app)

}
export default createControllerBorrow