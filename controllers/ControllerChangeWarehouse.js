
import {management , insert , checkPermission }  from "../api/ControllerChangeWarehouse/index.js";


function createControllerChangeWarehouse(app) {
    management(app)
    insert(app)
    checkPermission(app)


}
export default createControllerChangeWarehouse