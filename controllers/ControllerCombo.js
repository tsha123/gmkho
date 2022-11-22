
import * as warranty  from "../api/ControllerCombo/warranty.js";
import * as promotion  from "../api/ControllerCombo/promotion.js";

function createControllerCombo(app) {
    warranty.management(app)
    warranty.update(app)
    warranty.insert(app)

    promotion.management(app)
    promotion.update(app)
    promotion.insert(app)
}
export default createControllerCombo