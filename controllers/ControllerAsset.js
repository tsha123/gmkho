
import { insert, management, update  } from "../api/ControllerAsset/index.js";

function createControllerAsset(app) {
  management(app)
  insert(app)
  update(app)
  
}
export default createControllerAsset