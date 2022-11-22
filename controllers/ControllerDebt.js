
import {management , insert ,getDetailReport}  from "../api/ControllerDebt/index.js";


function createControllerDebt(app) {
    management(app)
    insert(app)
    getDetailReport(app)

}
export default createControllerDebt