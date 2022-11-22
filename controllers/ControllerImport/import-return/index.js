
import * as add from "./../../../api/ControllerImport/import-return/add.js";
// import {management , update} from "./../../../api/ControllerImport/import-return/index.js";

function createControllerImportReturn(app) {
    add.checkPermission(app)
    add.insert(app)
    // management(app)
    // update(app)
}
export default createControllerImportReturn