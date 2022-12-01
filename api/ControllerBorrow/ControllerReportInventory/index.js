import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import { ModelSubCategory } from '../../models/SubCategory.js'
import { ModelReportInventory } from '../../models/ReportInventory.js'

export const createAndUpdateReport = async (id_warehouse, id_subcategory, import_quantity = 0, import_money= 0, export_quantity= 0, export_money= 0,  time = new Date()) => {
    try {

        const dataReport = await ModelReportInventory.findOne({ id_warehouse: id_warehouse, id_subcategory:id_subcategory,  $and: [{ createdAt: { $gte: validator.dateTimeZone(undefined, new Date(time)).startOfDay } },{ createdAt: { $lte:validator.dateTimeZone(undefined, new Date(time)).endOfDay  } }] })
        
        if (dataReport) {
            await ModelReportInventory.findByIdAndUpdate(dataReport._id, {
                $inc: {
                    import_quantity: validator.tryParseInt(import_quantity), // số lượng nhập
                    export_quantity: validator.tryParseInt(export_quantity), // số lượng xuất
                    import_money: validator.tryParseInt(import_money),  // giá trị nhập
                    export_money: validator.tryParseInt(export_money), // giá trị xuất
                }
            })
        }
        else {
            await new ModelReportInventory({
                id_warehouse: id_warehouse,// tên nhân viên
                id_subcategory: id_subcategory,
                import_quantity: import_quantity,
                export_quantity: export_quantity,
                import_money: import_money,
                export_money: export_money,
            }).save()
        }
    }
    catch (e)
    {
        console.log(e)
    }
}