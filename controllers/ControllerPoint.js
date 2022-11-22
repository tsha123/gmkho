import { management , update , update_point_user,checkValuePoint} from "../api/ControllerPoint/index.js";

function createControllerPoint(app) {
    management(app)
    update(app)
    update_point_user(app)
    checkValuePoint(app)

}
export default createControllerPoint