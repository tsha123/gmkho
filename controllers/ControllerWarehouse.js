
import { management , insert , update} from "../api/ControllerWarehouse/index.js";


function createControllerWarehouse(app) {
    management(app)
    insert(app)
    update(app)

}
export default createControllerWarehouse