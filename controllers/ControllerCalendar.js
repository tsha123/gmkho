import { management, update, insert , getDataCalendar } from '../api/ControllerCalendar/index.js'


function createControllerCalendar(app) {
    management(app)
    update(app)
    insert(app)
    getDataCalendar(app)
}

export default createControllerCalendar;