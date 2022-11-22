


import { find_data_build_pc , info_build_pc , info_build_pc_app} from "../api/ControllerBuildPc/index.js";

function createControllerBuildPc(app) {
    find_data_build_pc(app)
    info_build_pc(app)
    info_build_pc_app(app)
}
export default createControllerBuildPc