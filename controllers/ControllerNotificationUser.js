
import { getData, update_status} from "../api/ControllerNotificationUser/index.js";


function createControllerNotificationUser(app) {
    getData(app)
    update_status(app)
}
export default createControllerNotificationUser