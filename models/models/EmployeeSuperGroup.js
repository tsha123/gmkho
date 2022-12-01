import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaEmployeeSuperGroup = new mongoose.Schema({
	employee_super_group_name: {
        ...validator.schemaString,
        ...validator.schemaRequired,
    }, // tên chức danh
    employee_super_group_level:{...validator.schemaNumber}, // xếp hạng quền , số càng nhỏ , quyền càng cao , quyền cao nhất = 0 (quản trị cấp cao)
},{timestamps: true });


validator.schePre(SchemaEmployeeSuperGroup);
export const  ModelEmployeeSuperGroup = mongoose.model("EmployeeSuperGroup",SchemaEmployeeSuperGroup);