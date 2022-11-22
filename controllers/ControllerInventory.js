
import {checkPermission , management}  from "../api/ControllerInventory/index.js";


function createControllerInventory(app) {
    management(app)
    checkPermission(app)

}
export default createControllerInventory