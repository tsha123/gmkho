import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaEmployeeGroup = new mongoose.Schema({
	employee_group_name: {...validator.schemaString}, // tên chức danh
	id_super_group: {
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    }, // tên chức danh
    employee_level:{...validator.schemaNumber}, // xếp hạng quền , số càng nhỏ , quyền càng cao , quyền cao nhất = 0 (quản trị cấp cao)
},{timestamps: true });


validator.schePre(SchemaEmployeeGroup);
export const  ModelEmployeeGroup = mongoose.model("EmployeeGroup",SchemaEmployeeGroup);