
import * as add from "./../../../api/ControllerExport/export-sale/add.js";
import {management } from "./../../../api/ControllerExport/export-sale/index.js";

function createControllerExportReturn(app) {

    add.insert(app)
    management(app)

}
export default createControllerExportReturn