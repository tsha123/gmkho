import {timekeeping_work , management_work ,report_work, getDataWork ,addTimekeepingWork_byAdmin, editTimekeepingWork_byAdmin} from '../api/ControllerTimekeeping/work.js'
import {timekeeping_schedule,management_schedule ,report_schedule , getDataSchedule, addTimekeepingSchedule_byAdmin} from '../api/ControllerTimekeeping/schedule.js'


function createControllerTimekeeping(app) {
    timekeeping_work(app)
    management_work(app)
    timekeeping_schedule(app)
    management_schedule(app)
    report_work(app)
    report_schedule(app)
    getDataWork(app)
    getDataSchedule(app)
    addTimekeepingWork_byAdmin(app)
    addTimekeepingSchedule_byAdmin(app)
    editTimekeepingWork_byAdmin(app)
}

export default createControllerTimekeeping;