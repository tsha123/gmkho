
import {insert , get_data} from "../api/ControllerComment/index.js";


function createControllerComment(app) {
    insert(app)
    get_data(app)
}
export default createControllerComment