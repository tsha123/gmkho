import { login} from '../api/ControllerEmployee/login.js'
import { management,update, insert, getInfo , insert_group} from '../api/ControllerEmployee/index.js'

function createControllerEmployee(app) {
    login(app)
    management(app)
    update(app)
    insert(app)
    getInfo(app)
    insert_group(app)
}

export default createControllerEmployee;