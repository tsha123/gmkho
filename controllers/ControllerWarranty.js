
import { 
    management , 
    insert ,  
    checkPermission ,
    find_product , 
    send_supplier, 
    receive_supplier, 
    return_customer, 
    change_supplier_new,
    change_supplier_other,
    change_customer_other
} from "../api/ControllerWarranty/index.js";



function createControllerWarranty(app) {
    management(app)
    insert(app)
    checkPermission(app)
    find_product(app)
    send_supplier(app)
    receive_supplier(app)
    return_customer(app)
    change_supplier_new(app)
    change_supplier_other(app)
    change_customer_other(app)
}
export default createControllerWarranty