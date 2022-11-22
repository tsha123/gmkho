
import { management , insert , update, deleteCart} from "../api/ControllerCart/index.js";


function createControllerCart(app) {
    management(app)
    insert(app)
    update(app)
    deleteCart(app)

}
export default createControllerCart