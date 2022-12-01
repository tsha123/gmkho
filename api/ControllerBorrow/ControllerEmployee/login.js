
const prefixApi = '/api/employee';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelEmployee} from '../../models/Employee.js'
import {ModelEmployeeGroup} from '../../models/EmployeeGroup.js'
import {ModelBranch} from '../../models/Branch.js'


export const login = (app)=>{
    try
    {
        app.post(prefixApi+"/login", async (req, res) => {
            const username = sanitize(req.body.username);
            const password = sanitize(req.body.password)

            const dataEmployee = await ModelEmployee.findOne({employee_phone:username});
  
            if(!dataEmployee) return res.status(400).send("Đăng nhập thất bại! Sai tên đăng nhập hoặc mật khẩu.");
            const dataBranch = await ModelBranch.findById(dataEmployee.id_branch);
            if(!dataBranch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh của bạn")

            if(dataEmployee.password != password) return res.status(400).send("Đăng nhập thất bại! Sai tên đăng nhập hoặc mật khẩu.");
            if(!dataEmployee.employee_status) return res.status(400).send("Thất bại! Nhận viên này đã không còn hoạt động.");
            const token = await helper.signupjwt({...dataEmployee,id_branch_login:dataEmployee.id_branch});
            await helper.signToken(token);
            const dataGroup = await ModelEmployeeGroup.findById(dataEmployee.id_employee_group)
            if(!dataGroup) return res.status(400).send("Thất bại! Không tìm thấy chức danh của bạn")
            dataEmployee.employee_group_name = dataGroup.employee_group_name
            delete dataEmployee.password
            dataBranch.branch_ipwifi = ''
            return res.json({token:token, dataEmployee:dataEmployee, dataBranch:dataBranch});
        })
    }
    catch(e)
    {
        validator.throwError(e);
        res.status(500).send("Thất bại! Có lỗi xảy ra");
    }
}
