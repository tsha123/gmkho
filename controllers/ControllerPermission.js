
import { management, updateGroup,updatePermission } from "../api/ControllerPermission/index.js";
import * as helper from '../helper/helper.js'
import * as validator from '../helper/validator.js'

function createControllerPermission(app) {
    management(app);
    updateGroup(app)
    updatePermission(app)
}
export default createControllerPermission