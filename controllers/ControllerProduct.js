
import { getInfo, history, filter,checkPermission_filter, report_sold_by_date, check_warranty, find_all_imported} from "../api/ControllerProduct/index.js";

function createControllerProduct(app) {
    getInfo(app)
    history(app)
    filter(app)
    find_all_imported(app)
    checkPermission_filter(app)
    report_sold_by_date(app)
    check_warranty(app)

}
export default createControllerProduct