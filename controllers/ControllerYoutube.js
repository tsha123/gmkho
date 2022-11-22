
import { management, insert, delete_youtube , update} from "../api/ControllerYoutube/index.js";


function createControllerYoutube(app) {
    management(app)
    insert(app)
    delete_youtube(app)
    update(app)
    
}
export default createControllerYoutube