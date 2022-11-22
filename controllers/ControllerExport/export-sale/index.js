
import * as add from "./../../../api/ControllerExport/export-sale/add.js";
import {
    management,
    update , 
    revenue_product_checkpermission, 
    revenue_product, print, 
    cancel_product ,
    revenue_product_by_employee, 
    update_employee ,
    change_customer
} from "./../../../api/ControllerExport/export-sale/index.js";

function createControllerExportSale(app) {
    add.checkPermission(app)
    add.checkPermissionMore(app)
    add.insert(app)
    add.insertMore(app)
    add.insert_by_mobile(app)
    management(app)
    update(app)
    revenue_product_checkpermission(app)
    revenue_product(app)
    print(app)
    cancel_product(app)
    revenue_product_by_employee(app)
    update_employee(app)
    change_customer(app)
}
export default createControllerExportSale