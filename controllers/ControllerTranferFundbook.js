import { check_permission, getData, add_form, delete_form } from '../api/ControllerTranferFundbook/index.js'


function createControllerTranferFundbook(app) {
    check_permission(app)
    getData(app)
    add_form(app)
    delete_form(app)

}

export default createControllerTranferFundbook;