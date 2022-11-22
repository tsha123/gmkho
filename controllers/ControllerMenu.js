
import { management, getData , update} from "../api/ControllerMenu/index.js";
import * as helper from '../helper/helper.js'
import * as validator from '../helper/validator.js'

function createControllerMenu(app) {
    management(app)
    getData(app)
    update(app)
  
}
export default createControllerMenu