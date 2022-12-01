const prefixApi = '/api/login/';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelBranch} from '../../models/Branch.js'
import {ModelEmployee} from '../../models/Employee.js'
import {ModelEmployeeGroup} from '../../models/EmployeeGroup.js'

export const login = async (app)=>
{
    app.post(prefixApi+"admin",async (req,res)=>
    {
        try
        {
            const username = sanitize(req.body.username);
            const password = sanitize(req.body.password);
            const id_branch = sanitize(req.body.id_branch);

            if(username.length ==0 || password.length == 0) return res.status(400).send("Thất bại! Sai tài khoản hoặc mật khẩu");
            const dataEmployee = await ModelEmployee.findOne({employee_phone:username});
            if(!dataEmployee)  return res.status(400).send("Thất bại! Sai tài khoản hoặc mật khẩu");
            if(dataEmployee.password != password) return res.status(400).send("Thất bại! Sai tài khoản hoặc mật khẩu");
            if(!dataEmployee.employee_status) return res.status(400).send("Thất bại! Tài khoản nhân viên này đã dừng hoạt động.");
     
            const dataBranch = await ModelBranch.findById(id_branch);
            if(!dataBranch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh");

            const dataGroup = await ModelEmployeeGroup.findById(dataEmployee.id_employee_group);
            if(!dataGroup) return res.status(400).send("Thất bại! Không tìm thấy phân quyền truy cập");
  
            if(! await helper.checkPermission("61e1572ef8bf2521b16be1fd", dataGroup._id)) return res.status(400).send("Thất bại! Bạn không có quyền đăng nhập!")

            if(dataGroup.employee_level != 0)
            {
                if(dataBranch._id != dataEmployee.id_branch.toString()) return res.status(400).send("Thất bại! Bạn không có quyền truy cập chi nhánh này");
            }
            const token = helper.signupjwt({...dataEmployee, id_branch_login:dataBranch._id});
            helper.signToken(token);
     
            return res.json({employee_fullname:dataEmployee.employee_fullname, name_branch:dataBranch.branch_name, token:token,name_group:dataGroup.employee_group_name})


        }
        catch(e)
        {
            return res.status(500).send("Thất bại! Có lỗi gì xảy ra rồi á :))");
        }
    })
   
}