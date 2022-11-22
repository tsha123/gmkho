
import {
    management,
     insert,
     update,
     getUser,
     signup,
     signin,
     insertMany,
     update_client,
     change_password,
     get_history,
     check_is_register,
    check_exist_phone_register,
    forgot_password
} from "../api/ControllerUser/index.js";


function createControllerUser(app) {
    management(app)
    insert(app)
    update(app)
    getUser(app)
    signup(app)
    signin(app)
    insertMany(app)
    update_client(app)
    change_password(app)
    get_history(app)
    check_is_register(app)
    check_exist_phone_register(app)
    forgot_password(app)
}
export default createControllerUser