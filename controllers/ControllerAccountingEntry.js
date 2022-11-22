
import { insert, management, update } from "../api/ControllerAccountingEntry/index.js";

function createControllerAccountingEntry(app) {
  management(app)
  insert(app)
  update(app)
}
export default createControllerAccountingEntry