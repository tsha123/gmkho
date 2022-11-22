
import * as add from "./../../../api/ControllerImport/import-supplier/add.js";
import {management , update , download, print, update_change_supplier} from "./../../../api/ControllerImport/import-supplier/index.js";

function createControllerImportSupplier(app) {
    add.checkPermission(app)
    add.checkPermissionMore(app)
    add.insert(app)
    add.insertMore(app)
    management(app)
    update(app)
    download(app)
    print(app)
    update_change_supplier(app)
}
export default createControllerImportSupplier