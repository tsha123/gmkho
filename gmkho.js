import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from 'morgan';
import * as connectDB from './connectDB.js';
import routerAdmin from './routers/RoutersAdmin.js';
import moment from 'moment-timezone';
import { spawn } from 'child_process';

import cron from 'node-cron';
import * as validator from './helper/validator.js';
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: '50mb',
        parameterLimit: 10000,
    })
);
app.use(cors());
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(logger('dev'));

app.listen(process.env.PORT || 8005, () => {
    console.log(`Server is running with port ${process.env.PORT || 8005} `);
});

// các link api client
import controller_api_client from './controllers/Controller_api_client.js';
controller_api_client(app);
//
import createControllerAdmin from './controllers/ControllerAdmin.js';
createControllerAdmin(app);
import createControllerPermission from './controllers/ControllerPermission.js';
createControllerPermission(app);

import createControllerEmployee from './controllers/ControllerEmployee.js';
createControllerEmployee(app);

import createControllerBranch from './controllers/ControllerBranch.js';
createControllerBranch(app);

import createControllerWarehouse from './controllers/ControllerWarehouse.js';
createControllerWarehouse(app);

import createControllerCategory from './controllers/ControllerCategory.js';
createControllerCategory(app);

import createControllerSuperCategory from './controllers/ControllerSuperCategory.js';
createControllerSuperCategory(app);

import createControllerAsset from './controllers/ControllerAsset.js';
createControllerAsset(app);

import createControllerSubCategory from './controllers/ControllerSubCategory.js';
createControllerSubCategory(app);

import createControllerCombo from './controllers/ControllerCombo.js';
createControllerCombo(app);
import createControllerTimekeeping from './controllers/ControllerTimekeeping.js';
createControllerTimekeeping(app);

import createControllerCalendar from './controllers/ControllerCalendar.js';
createControllerCalendar(app);

import createControllerMenu from './controllers/ControllerMenu.js';
createControllerMenu(app);
import controller_policy_admin from './controllers/ControllerPolicy.js';
controller_policy_admin(app);
import controller_slide_banner from './controllers/ControllerSlideBanner.js';
controller_slide_banner(app);
import controller_website_component from './controllers/ControllerWebsiteComponent.js';
controller_website_component(app);

import createControllerFundBook from './controllers/ControllerFundBook.js';
createControllerFundBook(app);

import createControllerAccountingEntry from './controllers/ControllerAccountingEntry.js';
createControllerAccountingEntry(app);

import createControllerImportSupplier from './controllers/ControllerImport/import-supplier/index.js';
createControllerImportSupplier(app);

import createControllerImportPeriod from './controllers/ControllerImport/import-period/index.js';
createControllerImportPeriod(app);

import createControllerImportReturn from './controllers/ControllerImport/import-return/index.js';
createControllerImportReturn(app);

import createControllerExportSale from './controllers/ControllerExport/export-sale/index.js';
createControllerExportSale(app);

import createControllerExportReturn from './controllers/ControllerExport/export-return/index.js';
createControllerExportReturn(app);

import createControllerUser from './controllers/ControllerUser.js';
createControllerUser(app);

import createControllerPoint from './controllers/ControllerPoint.js';
createControllerPoint(app);

import createControllerVoucher from './controllers/ControllerVoucher.js';
createControllerVoucher(app);

import createControllerProduct from './controllers/ControllerProduct.js';
createControllerProduct(app);

import createControllerInternalOrder from './controllers/ControllerInternalOrder.js';
createControllerInternalOrder(app);

import createControllerReceive from './controllers/ControllerReceive.js';
createControllerReceive(app);

import createControllerPayment from './controllers/ControllerPayment.js';
createControllerPayment(app);

import createControllerBorrow from './controllers/ControllerBorrow.js';
createControllerBorrow(app);

import createControllerCart from './controllers/ControllerCart.js';
createControllerCart(app);

import createControllerOrder from './controllers/ControllerOrder.js';
createControllerOrder(app);

import createControllerWarranty from './controllers/ControllerWarranty.js';
createControllerWarranty(app);

import createControllerDebt from './controllers/ControllerDebt.js';
createControllerDebt(app);

import createControllerInventory from './controllers/ControllerInventory.js';
createControllerInventory(app);

import createController_Promotion from './controllers/ControllerGM-Feed/promotion.js';
createController_Promotion(app);

import createController_News from './controllers/ControllerGM-Feed/news.js';
createController_News(app);

import createControllerNotificationUser from './controllers/ControllerNotificationUser.js';
createControllerNotificationUser(app);

import createControllerDeviceSeparation from './controllers/ControllerDeviceSeparation.js';
createControllerDeviceSeparation(app);

import createControllerComment from './controllers/ControllerComment.js';
createControllerComment(app);

import createControllerBuildPc from './controllers/ControllerBuildPc.js';
createControllerBuildPc(app);

import createControllerYoutube from './controllers/ControllerYoutube.js';
createControllerYoutube(app);

import controller_email_announcement_promotion from './controllers/ControllerEmail_Announcement_Promotion.js';
controller_email_announcement_promotion(app);

import createControllerExternalRepairService from './controllers/ControllerExternalRepairService.js';
createControllerExternalRepairService(app);

import createControllerChangeWarehouse from './controllers/ControllerChangeWarehouse.js';
createControllerChangeWarehouse(app);

import createControllerComboProduct from './controllers/ControllerComboProduct.js';
createControllerComboProduct(app);

import createControllerTranferFundbook from './controllers/ControllerTranferFundbook.js';
createControllerTranferFundbook(app);

app.use(routerAdmin);

import { ModelBranch } from './models/Branch.js';
app.get('/addbranch/:name/:phone', async (req, res) => {
    const data = await new ModelBranch({
        branch_name: req.params.name,
        branch_phone: req.params.phone,
    }).save();
    return res.json(data);
});

import { ModelEmployeeGroup } from './models/EmployeeGroup.js';
app.get('/addGroup/:name/:level/:idgroupsup', async (req, res) => {
    const data = await new ModelEmployeeGroup({
        employee_group_name: req.params.name,
        employee_level: req.params.level,
        id_super_group: req.params.idgroupsup,
    }).save();
    return res.json(data);
});

import { ModelFunction } from './models/Function.js';
app.get('/addFunction/:name', async (req, res) => {
    const data = await new ModelFunction({
        function_name: req.params.name,
    }).save();
    return res.json(data);
});

import { ModelEmployeeSuperGroup } from './models/EmployeeSuperGroup.js';
app.get('/addSupperGroup/:name/:level', async (req, res) => {
    const data = await new ModelEmployeeSuperGroup({
        employee_super_group_name: req.params.name,
        employee_super_group_level: req.params.level,
    }).save();
    return res.json(data);
});

import { ModelSuperCategory } from './models/SuperCategory.js';
import { ModelCategory } from './models/Category.js';
import { ModelWarehouse } from './models/Warehouse.js';
import { ModelSubCategory } from './models/SubCategory.js';
import { ModelEmployee } from './models/Employee.js';
import { ModelAsset } from './models/Asset.js';
import { ModelWarrantyCombo } from './models/WarrantyCombo.js';
import { ModelMenu } from './models/Menu.js';
import { Model_Website_Component } from './models/WebsiteComponent.js';
import { Model_App_Component } from './models/AppComponent.js';
import { ModelCalendar } from './models/Calendar.js';
import { ModelFundBook } from './models/FundBook.js';
import { ModelAccountingEntry } from './models/AccountingEntry.js';
import { ModelUser } from './models/User.js';
import { ModelProduct } from './models/Product.js';
import { ModelImportForm } from './models/ImportForm.js';
import { ModelPayment } from './models/Payment.js';
import { ModelDebt } from './models/Debt.js';
import { ModelPoint } from './models/Point.js';
import { ModelVoucher } from './models/Voucher.js';
import { ModelExportForm } from './models/ExportForm.js';
import { ModelReceive } from './models/Receive.js';
import { ModelPart } from './models/Part.js';
import { ModelInternalOrder } from './models/InternalOrder.js';
import { ModelBorrow } from './models/Borrow.js';
import { ModelCart } from './models/Cart.js';
import { ModelOrder } from './models/Order.js';
import { ModelWarranty } from './models/Warranty.js';
import { ModelExportWarranty } from './models/ExportWarranty.js';
import { ModelReportInventory } from './models/ReportInventory.js';
import { ModelNotificationUser } from './models/Notification_User.js';
import { Model_Slide_Banner } from './models/Slide-banner.js';
import { Model_Policy } from './models/Policy.js';
import { ModelNews } from './models/News.js';
import { Model_Email_Announcement_Promotion } from './models/Email_Announcement_Promotion.js';

app.get('/lay:name', async (req, res) => {
    let query = {};
    Object.keys(req.query).map((key) => {
        if (key != 'limit' && key != 'page') {
            query = {
                ...query,
                [key]: req.query[key],
            };
        }
    });
    var db = get_Model(req);
    const data = await db
        .find(query)
        .skip(validator.getOffset(req))
        .limit(validator.getLimit(req));
    return res.json(data);
});

app.get('/empty/:name', async (req, res) => {
    var db = get_Model(req);
    const data = await db.deleteMany({});
    return res.json(data);
});
import { ModelPermission } from './models/Permission.js';

app.get('/addPermission/:group/:function', async (req, res) => {
    const data = await new ModelPermission({
        id_employee_group: req.params.group,
        id_function: req.params.function,
    }).save();
    return res.json(data);
});

app.get('/xoa', async (req, res) => {
    await ModelImportForm.deleteMany({});
    await ModelProduct.deleteMany({});
    await ModelExportForm.deleteMany({});
    await ModelDebt.deleteMany({});
    await ModelReceive.deleteMany({});
    await ModelPayment.deleteMany({});
    await ModelOrder.deleteMany({});
    await ModelWarranty.deleteMany({});
    await ModelBorrow.deleteMany({});
    await ModelReportInventory.deleteMany({});
    return res.json('ok');
});

app.get('/USUB', async (req, res) => {
    //  await Model_Website_Component.findByIdAndUpdate("62733731a23200000c005a23")'
    const data = await Model_Website_Component.findById(
        '62733731a23200000c005a23'
    );
    if (data) {
        await Model_Website_Component.findByIdAndUpdate(data._id, {
            Content: {
                ...data.Content,
                list_subcategory_build_pc: {
                    Active: true,
                    Description: 'Danh sách sản phẩm trong trang build pc',
                    array_subcategory: [
                        '6244647aaf23eb577a11575d',
                        '623d8c869162705f634e8038',
                        '623d4490da38fdc60f3a1b2a',
                        '623d41ccda38fdc60f3a1af4',
                    ],
                },
            },
        });
        return res.json('ok');
    }
});

import { ModelNotification } from './models/Notification.js';
app.get('/Notification', async (req, res) => {
    const data = await ModelNotification.find().lean();
    return res.json(data);
});

cron.schedule('* * * * *', async () => {
    const dataNotifi = await ModelNotification.find().lean();
    const time = validator.dateTimeZone();
    for (let i = 0; i < dataNotifi.length; i++) {
        const timeNotifi = new Date(dataNotifi[i].notification_time);
        if (
            time.fullyear == timeNotifi.getFullYear() &&
            time.month == timeNotifi.getMonth() + 1 &&
            time.date == timeNotifi.getDate()
        ) {
            validator.notifyTopic(
                dataNotifi[i].notification_topic,
                dataNotifi[i].notification_title,
                dataNotifi[i].notification_content
            );
            await ModelNotification.findByIdAndRemove(dataNotifi[i]._id);
        }
    }
}).start();

function get_Model(req) {
    const name_model = req.params.name;
    let db = ModelBranch;
    switch (name_model) {
        case `Function`: {
            db = ModelFunction;
            break;
        }
        case `AppComponent`: {
            db = Model_App_Component;
            break;
        }
        case `Permission`: {
            db = ModelPermission;
            break;
        }
        case `EmployeeGroup`: {
            db = ModelEmployeeGroup;
            break;
        }
        case `Employee`: {
            db = ModelEmployee;
            break;
        }
        case `EmployeeSuperGroup`: {
            db = ModelEmployeeSuperGroup;
            break;
        }
        case `SuperCategory`: {
            db = ModelSuperCategory;
            break;
        }
        case `Category`: {
            db = ModelCategory;
            break;
        }
        case `Warehouse`: {
            db = ModelWarehouse;
            break;
        }
        case `SubCategory`: {
            db = ModelSubCategory;
            break;
        }
        case `Asset`: {
            db = ModelAsset;
            break;
        }
        case `WarrantyCombo`: {
            db = ModelWarrantyCombo;
            break;
        }
        case `Menu`: {
            db = ModelMenu;
            break;
        }
        case `Calendar`: {
            db = ModelCalendar;
            break;
        }
        case `FundBook`: {
            db = ModelFundBook;
            break;
        }
        case `AccountingEntry`: {
            db = ModelAccountingEntry;
            break;
        }
        case `User`: {
            db = ModelUser;
            break;
        }
        case `Product`: {
            db = ModelProduct;
            break;
        }
        case `Import`: {
            db = ModelImportForm;
            break;
        }
        case `Payment`: {
            db = ModelPayment;
            break;
        }
        case `Debt`: {
            db = ModelDebt;
            break;
        }
        case `Point`: {
            db = ModelPoint;
            break;
        }
        case `Voucher`: {
            db = ModelVoucher;
            break;
        }
        case `Export`: {
            db = ModelExportForm;
            break;
        }
        case `Receive`: {
            db = ModelReceive;
            break;
        }
        case `Part`: {
            db = ModelPart;
            break;
        }
        case `Internal`: {
            db = ModelInternalOrder;
            break;
        }
        case `Borrow`: {
            db = ModelBorrow;
            break;
        }
        case `Cart`: {
            db = ModelCart;
            break;
        }
        case `Order`: {
            db = ModelOrder;
            break;
        }
        case `Warranty`: {
            db = ModelWarranty;
            break;
        }
        case `ExportWarranty`: {
            db = ModelExportWarranty;
            break;
        }
        case `Report`: {
            db = ModelReportInventory;
            break;
        }
        case `Notification`: {
            db = ModelNotificationUser;
            break;
        }
        case `WebsiteComponent`: {
            db = Model_Website_Component;
            break;
        }
        case `AppComponent`: {
            db = Model_App_Component;
            break;
        }
        case `SlideBanner`: {
            db = Model_Slide_Banner;
            break;
        }
        case `Policy`: {
            db = Model_Policy;
            break;
        }
        case `Category`: {
            db = ModelCategory;
            break;
        }
        case `News`: {
            db = ModelNews;
            break;
        }
        case `Email_Promotion`: {
            db = Model_Email_Announcement_Promotion;
            break;
        }
        default:
            break;
    }
    return db;
}

function empty_Model(req) {
    const name_model = req.params.name;
    let db = null;
    switch (name_model) {
        case `EmployeeGroup`: {
            db = ModelEmployeeGroup;
            break;
        }
        case `Employee`: {
            db = ModelEmployee;
            break;
        }
        case `EmployeeSuperGroup`: {
            db = ModelEmployeeSuperGroup;
            break;
        }
        case `SuperCategory`: {
            db = ModelSuperCategory;
            break;
        }
        case `Category`: {
            db = ModelCategory;
            break;
        }
        case `Warehouse`: {
            db = ModelWarehouse;
            break;
        }
        case `SubCategory`: {
            db = ModelSubCategory;
            break;
        }
        case `Asset`: {
            db = ModelAsset;
            break;
        }
        case `WarrantyCombo`: {
            db = ModelWarrantyCombo;
            break;
        }
        case `Menu`: {
            db = ModelMenu;
            break;
        }
        case `Calendar`: {
            db = ModelCalendar;
            break;
        }
        case `FundBook`: {
            db = ModelFundBook;
            break;
        }
        case `AccountingEntry`: {
            db = ModelAccountingEntry;
            break;
        }
        case `User`: {
            db = ModelUser;
            break;
        }
        case `Product`: {
            db = ModelProduct;
            break;
        }
        case `Import`: {
            db = ModelImportForm;
            break;
        }
        case `Payment`: {
            db = ModelPayment;
            break;
        }
        case `Debt`: {
            db = ModelDebt;
            break;
        }
        case `Point`: {
            db = ModelPoint;
            break;
        }
        case `Voucher`: {
            db = ModelVoucher;
            break;
        }
        case `Export`: {
            db = ModelExportForm;
            break;
        }
        case `Receive`: {
            db = ModelReceive;
            break;
        }
        case `Part`: {
            db = ModelPart;
            break;
        }
        case `Internal`: {
            db = ModelInternalOrder;
            break;
        }
        case `Borrow`: {
            db = ModelBorrow;
            break;
        }
        case `Cart`: {
            db = ModelCart;
            break;
        }
        case `Order`: {
            db = ModelOrder;
            break;
        }
        case `Warranty`: {
            db = ModelWarranty;
            break;
        }
        case `ExportWarranty`: {
            db = ModelExportWarranty;
            break;
        }
        case `Report`: {
            db = ModelReportInventory;
            break;
        }
        case `Notification`: {
            db = ModelNotificationUser;
            break;
        }
        default:
            break;
    }
    return db;
}

app.get('/cak', async (req, res) => {
    const dataInternal = await ModelInternalOrder.find();
    const arrrData = [];
    for (let i = 0; i < dataInternal.length; i++) {
        if (
            dataInternal[i].id_import_form &&
            validator.ObjectId(dataInternal[i].id_import_form)
        ) {
            const dataImport = await ModelImportForm.findById(
                dataInternal[i].id_import_form
            );
            if (dataImport) {
                const dataDebt = await ModelDebt.findOne({
                    $and: [
                        { debt_type: 'import' },
                        { id_form: dataImport._id },
                    ],
                });
                let money = 0;
                const dataPayment = await ModelPayment.findOne({
                    $and: [
                        { payment_type: 'import' },
                        { id_form: dataImport._id },
                    ],
                });
                if (dataPayment) money = dataPayment.payment_money;

                const total = validator.calculateMoneyImport(
                    dataImport.import_form_product
                );
                if (!dataDebt) {
                    const cc = await new ModelDebt({
                        id_user: dataInternal[i].to_user, // tên nhân viên
                        id_branch: dataInternal[i].from_user,
                        id_employee: dataInternal[i].from_employee,
                        debt_money_payment: money,
                        debt_money_import: total,
                        debt_note: dataImport.import_form_note,
                        debt_type: 'import',
                        id_form: dataImport._id,
                    }).save();
                    arrrData.push(cc);
                } else {
                    if (
                        dataDebt.debt_money_receive > 0 ||
                        dataDebt.debt_money_export > 0
                    ) {
                        const dataUpdate = await ModelDebt.findByIdAndUpdate(
                            dataDebt._id,
                            {
                                debt_money_export: 0,
                                debt_money_receive: 0,
                                debt_money_import: total,
                                debt_money_payment: money,
                            }
                        );

                        arrrData.push({
                            ...dataUpdate,
                            type: 'update',
                        });
                    }
                }
            }
        }
    }

    return res.json(arrrData);
});

const backupRestore = (
    type,
    db = 'gaming_market',
    archive = `./dump/${new Date()}`,
    ...other
) => {
    const cmd = {
        backup: 'mongodump',
        restore: 'mongorestore',
    };
    return new Promise((resolve, reject) => {
        const process = spawn(cmd[type], [
            `--db=${db}`,
            `--archive=${archive}`,
            '--gzip',
        ]);
        process.on('exit', (code, signal) => {
            if (code) {
                console.log(`${type} process exited with code ${code}`);
                return {
                    status: false,
                    message: `${type} process exited with code ${code}`,
                };
            }
            if (signal) {
                console.error(
                    `${type} process was killed with signal ${signal}`
                );
                return {
                    status: false,
                    message: `${type} process was killed with signal ${signal}`,
                }
            }
            console.log(`Successfully ${type} the database`);
            return resolve({ code, signal });
        });
    });
};

app.get('/backup-now', async (req, res) => {
    const data = await backupRestore(
        'backup',
        'gaming_market',
    );
    return res.json(data);
});
app.get('/restore-now', async (req, res) => {
    const data = await backupRestore(
        'restore',
        'gaming_market',
        './dump/Thu Dec 01 2022 07/44/57 GMT+0700 (Indochina Time)'
        '--gzip'
    );
    return res.json(data);
});

const autoBackup = cron.schedule('10 46 * * * *', async () => {
    await backupRestore(
        'backup',
        'gaming_market',
    );
});
autoBackup.start();

app.get('/*', async (req, res) => {
    return res.status(404).render('pages/samples/error-404');
});
