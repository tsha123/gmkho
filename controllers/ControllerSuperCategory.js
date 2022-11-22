import { insert,getDataClient} from "../api/ControllerSuperCategory/index.js";

function createControllerSuperCategory(app) {
    insert(app)
    getDataClient(app)
}
export default createControllerSuperCategory