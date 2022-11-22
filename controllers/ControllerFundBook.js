import { management,update, insert , report, import_period , get_fundbook_by_employee} from '../api/ControllerFundBook/index.js'

function createControllerFundBook(app) {

    management(app)
    update(app)
    insert(app)
    report(app)
    import_period(app)
    get_fundbook_by_employee(app)
}

export default createControllerFundBook;