
import * as client from "../api/ControllerOrder/client.js";
import * as admin from "../api/ControllerOrder/admin.js";


function createControllerWarehouse(app) {
    client.tracking(app)
    client.insert(app)
    client.cancel(app)
    admin.management(app)
    admin.checkPermissionExport(app)
    admin.confirmExport(app)
    admin.updateStatus(app)
    admin.insert(app)
    admin.tranfer_employee(app)
    admin.get_order_by_type_employee(app)
    admin.insert_from_mobile(app)
    admin.count_employee(app)
    admin.update_action(app)

}
export default createControllerWarehouse