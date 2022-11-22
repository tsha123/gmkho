
import { management , insert , update, get_data_print, delete_receive} from "../api/ControllerReceive/index.js";


function createControllerReceive(app) {
    management(app)
    insert(app)
    update(app)
    get_data_print(app)
    delete_receive(app)
}
export default createControllerReceive