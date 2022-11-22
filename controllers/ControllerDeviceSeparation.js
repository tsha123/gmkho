
import {check_permission, insert, management } from "../api/ControllerDeviceSeparation/index.js";


function createControllerDeviceSeparation(app) {
    check_permission(app)
    insert(app)
    management(app)
}
export default createControllerDeviceSeparation