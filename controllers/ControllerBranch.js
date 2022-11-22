
import { management , update , insert , getByClient, update_active} from "../api/ControllerBranch/index.js";

function createControllerBranch(app) {
    management(app)
    update(app)
    insert(app)
    getByClient(app)
    update_active(app)
}
export default createControllerBranch