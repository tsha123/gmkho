import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";

const schemaPro = {
    id_product:{
      ...validator.schemaObjectId,
          ...validator.schemaRequired,
          ...validator.schemaAutoIndex,
    },
    date_export: {
      ...validator.schemaString,
    },
    warranty:{...validator.schemaNumber},
    id_export_form : {...validator.schemaObjectId},
    product_quantity:{...validator.schemaNumber},
    id_proudct2: {...validator.schemaString},
    id_subcategory:{...validator.schemaString},
    id_supplier:{
        ...validator.schemaObjectId,
        ...validator.schemaRequired,
        ...validator.schemaIndex,
    },
    subcategory_name:{
      ...validator.schemaString,
      ...validator.schemaTextIndex
    },
    note:{...validator.schemaString},
    status_send_supplier:{...validator.schemaBooleanFalse}, // đã gửi bảo hành cho ncc hay chưa
    status_receive_supplier:{...validator.schemaBooleanFalse}, // đã nhận lại bảo hành tử ncc hay chưa
    status_change_supplier:{...validator.schemaObjectId}, //đã nhận lại sp bảo hành từ ncc nhưng là sp mới hay chưa , chỗ này có 2 trường hợp
    status_return_customer:{...validator.schemaBooleanFalse}, // đã trả khách hàng hay chưa
    status_change_customer:{...validator.schemaObjectId}, // đã đổi trả khách hàng hay chưa,
    status_failed:{...validator.schemaBooleanFalse},
    status_success:{...validator.schemaBooleanFalse},
    date_send_supplier:{
      ...validator.schemaDatetime,
      default:null
    },
    date_receive_supplier:{
      ...validator.schemaDatetime,
      default:null
    },
    date_return_customer:{
      ...validator.schemaDatetime,
      default:null
    }              
  }
  
  

const SchemaWarranty = new mongoose.Schema({
    id_employee: {
  ...validator.schemaObjectId,
      ...validator.schemaRequired,
  },
  id_warehouse: {
  ...validator.schemaObjectId,
      ...validator.schemaRequired,
      ...validator.schemaAutoIndex,
  },
  id_import_form: {
    ...validator.schemaObjectId,
    ...validator.schemaRequired,
    ...validator.schemaAutoIndex,
  },
  id_user:{
    ...validator.schemaObjectId,
    ...validator.schemaRequired,
    ...validator.schemaAutoIndex,
  },
  warranty_product:{
    type:[schemaPro]
  }
},{timestamps: true });



validator.schePre(SchemaWarranty)

export const ModelWarranty = mongoose.model("Warranty", SchemaWarranty);



