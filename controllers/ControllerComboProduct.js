
import {management , insert ,update, delete_combo}  from "../api/ControllerComboProduct/index.js";


function createControllerComboProduct(app) {
    management(app)
    insert(app)
    update(app)
    delete_combo(app)

}
export default createControllerComboProduct