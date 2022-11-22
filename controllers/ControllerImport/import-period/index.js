
import * as add from "./../../../api/ControllerImport/import-period/add.js";
import {management,update} from "./../../../api/ControllerImport/import-period/index.js";

function createControllerImportPeriod(app) {
   
    add.insert(app)
    add.insertMore(app)
    management(app)
    update(app)
}
export default createControllerImportPeriod