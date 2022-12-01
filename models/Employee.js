import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaEmployee = new mongoose.Schema(
    {
        employee_fullname: { 
            ...validator.schemaString,
            ...validator.schemaTextIndex,
            ...validator.schemaRequired
        },// tên nhân viên
        employee_phone: {   // số didenj thoại, và là duy nhất
            ...validator.schemaString,
            ...validator.schemaRequired,
            ...validator.schemaIndex,
            ...validator.schemaUnique,
        },
        employee_datebirth: { ...validator.schemaDatetime },  // ngày sinh nhân viên
        employee_image: { ...validator.schemaString }, // ảnh đại diện
        employee_address: { ...validator.schemaString },  // địa chỉ nhân viên
        id_branch: {  // mã chi nhánh , bắt buộc phải có kể cả ô giám đốc
            ...validator.schemaObjectId,
            ...validator.schemaRequired,
        },
        password: { ...validator.schemaString }, // mật khẩu nhân viên
        employee_salary: { ...validator.schemaNumber }, // lương cơ bản nhân viên
        employee_salary_duty: { ...validator.schemaNumber }, //lương trực
        employee_status: { ...validator.schemaBoolean }, // trạng thái của nhân viên : 0: đang
        employee_bank_number: { ...validator.schemaString }, // tài khoản ngân hàng
        employee_bank_name: { ...validator.schemaString },  // tên ngân hàng
        id_employee_group: {   // loại nhân viên, (là chức danh nhân viên á)
            ...validator.schemaObjectId,
            ...validator.schemaRequired,
        },
        employee_history_work: { ...validator.schemaArray }, // lịch sử công tác
        employee_history_salary: { ...validator.schemaArray },  //lịch sử lương
        employee_lunch_allowance: { ...validator.schemaNumber }, // phục cập ăn trưa
        employee_revenue_percent: { ...validator.schemaNumber },  // % doanh số
        employee_level: { ...validator.schemaString }, // trình độ học vẫn
    },
    { timestamps: true }
);



validator.schePre(SchemaEmployee)
export const ModelEmployee = mongoose.model("Employee", SchemaEmployee);
