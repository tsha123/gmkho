import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaReportInventory = new mongoose.Schema(
    {
        id_warehouse: { 
            ...validator.schemaObjectId,
            ...validator.schemaIndex,
            ...validator.schemaRequired
        },// tên nhân viên
        id_subcategory: {   // số didenj thoại, và là duy nhất
            ...validator.schemaObjectId,
            ...validator.schemaIndex,
            ...validator.schemaRequired
        },
        import_quantity: {   // số didenj thoại, và là duy nhất
            ...validator.schemaNumber,
        },
        export_quantity: {   // số didenj thoại, và là duy nhất
            ...validator.schemaNumber,
        },
        import_money: {   // số didenj thoại, và là duy nhất
            ...validator.schemaNumber,
        },
        export_money: {   // số didenj thoại, và là duy nhất
            ...validator.schemaNumber,
        },
        import_of_export_money: {   //  số tiền nhập của sp xuất
            ...validator.schemaNumber,
        },
        
    },
    { timestamps: true }
);


validator.schePre(SchemaReportInventory)
export const ModelReportInventory = mongoose.model("ReportInventory", SchemaReportInventory);
