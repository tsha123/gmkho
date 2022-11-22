import * as main from "../api/ControllerSubCategory/index.js";
import { getDataToUpWebsite , edit_content , edit_stt_status} from "../api/ControllerSubCategory/up_to_website.js";

function createControllerSubCategory(app) {
    main.management(app)
    main.insert(app)
    main.addExcel(app)
    main.update(app)
    main.findOther(app)
    main.getDataClient(app)
    getDataToUpWebsite(app)
    edit_content(app)
    edit_stt_status(app)
    main.detail_subcategory(app)
    main.flash_sale_mobile(app)

}
export default createControllerSubCategory