/*
 Navicat Premium Data Transfer

 Source Server         : gmKho
 Source Server Type    : MongoDB
 Source Server Version : 60002
 Source Host           : localhost:27017
 Source Schema         : gaming_market

 Target Server Type    : MongoDB
 Target Server Version : 60002
 File Encoding         : 65001

 Date: 23/11/2022 13:42:36
*/


// ----------------------------
// Collection structure for accountingentries
// ----------------------------
db.getCollection("accountingentries").drop();
db.createCollection("accountingentries");
db.getCollection("accountingentries").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("accountingentries").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for appcomponents
// ----------------------------
db.getCollection("appcomponents").drop();
db.createCollection("appcomponents");

// ----------------------------
// Collection structure for assets
// ----------------------------
db.getCollection("assets").drop();
db.createCollection("assets");
db.getCollection("assets").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("assets").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("assets").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("assets").createIndex({
    "asset_time": NumberInt("1")
}, {
    name: "asset_time_1",
    background: true,
    sparse: true
});
db.getCollection("assets").createIndex({
    "id_branch": NumberInt("1")
}, {
    name: "id_branch_1",
    background: true
});

// ----------------------------
// Collection structure for borrows
// ----------------------------
db.getCollection("borrows").drop();
db.createCollection("borrows");
db.getCollection("borrows").createIndex({
    "id_warehouse": NumberInt("1")
}, {
    name: "id_warehouse_1",
    background: true,
    sparse: true
});
db.getCollection("borrows").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true,
    sparse: true
});
db.getCollection("borrows").createIndex({
    "id_export_form": NumberInt("1")
}, {
    name: "id_export_form_1",
    background: true
});
db.getCollection("borrows").createIndex({
    "borrow_time_return": NumberInt("1")
}, {
    name: "borrow_time_return_1",
    background: true,
    sparse: true
});
db.getCollection("borrows").createIndex({
    "borrow_product.id_product": NumberInt("1")
}, {
    name: "borrow_product.id_product_1",
    background: true
});
db.getCollection("borrows").createIndex({
    "borrow_product.id_product2": NumberInt("1")
}, {
    name: "borrow_product.id_product2_1",
    background: true
});
db.getCollection("borrows").createIndex({
    "borrow_product.product_time_return": NumberInt("1")
}, {
    name: "borrow_product.product_time_return_1",
    background: true,
    sparse: true
});
db.getCollection("borrows").createIndex({
    "id_import_form": NumberInt("1")
}, {
    name: "id_import_form_1",
    background: true
});
db.getCollection("borrows").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("borrows").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("borrows").createIndex({
    "id_employee_created": NumberInt("1")
}, {
    name: "id_employee_created_1",
    background: true
});
db.getCollection("borrows").createIndex({
    "borrow_product.id_subcategory": NumberInt("1")
}, {
    name: "borrow_product.id_subcategory_1",
    background: true
});

// ----------------------------
// Collection structure for branches
// ----------------------------
db.getCollection("branches").drop();
db.createCollection("branches");
db.getCollection("branches").createIndex({
    "branch_phone": NumberInt("1")
}, {
    name: "branch_phone_1",
    background: true,
    sparse: true
});
db.getCollection("branches").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("branches").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for calendars
// ----------------------------
db.getCollection("calendars").drop();
db.createCollection("calendars");
db.getCollection("calendars").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true,
    sparse: true
});
db.getCollection("calendars").createIndex({
    "date_calendar": NumberInt("1")
}, {
    name: "date_calendar_1",
    background: true,
    sparse: true
});
db.getCollection("calendars").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("calendars").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for carts
// ----------------------------
db.getCollection("carts").drop();
db.createCollection("carts");
db.getCollection("carts").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});
db.getCollection("carts").createIndex({
    "cart_product.id_subcategory": NumberInt("1")
}, {
    name: "cart_product.id_subcategory_1",
    background: true
});
db.getCollection("carts").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("carts").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for categories
// ----------------------------
db.getCollection("categories").drop();
db.createCollection("categories");
db.getCollection("categories").createIndex({
    "category_sluglink": NumberInt("1")
}, {
    name: "category_sluglink_1",
    background: true,
    unique: true
});
db.getCollection("categories").createIndex({
    "id_super_category": NumberInt("1")
}, {
    name: "id_super_category_1",
    background: true
});
db.getCollection("categories").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("categories").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("categories").createIndex({
    "category_name": NumberInt("1")
}, {
    name: "category_name_1",
    background: true,
    unique: true
});
db.getCollection("categories").createIndex({
    "id_parent_category": NumberInt("1")
}, {
    name: "id_parent_category_1",
    background: true,
    sparse: true
});
db.getCollection("categories").createIndex({
    "id_slide_banner": NumberInt("1")
}, {
    name: "id_slide_banner_1",
    background: true
});

// ----------------------------
// Collection structure for changewarehouses
// ----------------------------
db.getCollection("changewarehouses").drop();
db.createCollection("changewarehouses");
db.getCollection("changewarehouses").createIndex({
    "id_export_form": NumberInt("1")
}, {
    name: "id_export_form_1",
    background: true
});
db.getCollection("changewarehouses").createIndex({
    "id_import_form": NumberInt("1")
}, {
    name: "id_import_form_1",
    background: true
});
db.getCollection("changewarehouses").createIndex({
    "id_fromwarehouse": NumberInt("1")
}, {
    name: "id_fromwarehouse_1",
    background: true
});
db.getCollection("changewarehouses").createIndex({
    "id_towarehouse": NumberInt("1")
}, {
    name: "id_towarehouse_1",
    background: true
});
db.getCollection("changewarehouses").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("changewarehouses").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("changewarehouses").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for comboproducts
// ----------------------------
db.getCollection("comboproducts").drop();
db.createCollection("comboproducts");
db.getCollection("comboproducts").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("comboproducts").createIndex({
    "array_subcategory.id_subcategory": NumberInt("1")
}, {
    name: "array_subcategory.id_subcategory_1",
    background: true
});
db.getCollection("comboproducts").createIndex({
    "combo_name": NumberInt("1")
}, {
    name: "combo_name_1",
    background: true,
    sparse: true
});
db.getCollection("comboproducts").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("comboproducts").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for comments
// ----------------------------
db.getCollection("comments").drop();
db.createCollection("comments");
db.getCollection("comments").createIndex({
    "id_subcategory": NumberInt("1")
}, {
    name: "id_subcategory_1",
    background: true
});
db.getCollection("comments").createIndex({
    "comment_reps.createdAt": NumberInt("1")
}, {
    name: "comment_reps.createdAt_1",
    background: true,
    sparse: true
});
db.getCollection("comments").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("comments").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for debts
// ----------------------------
db.getCollection("debts").drop();
db.createCollection("debts");
db.getCollection("debts").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("debts").createIndex({
    "id_form": NumberInt("1")
}, {
    name: "id_form_1",
    background: true
});
db.getCollection("debts").createIndex({
    "debt_time": NumberInt("1")
}, {
    name: "debt_time_1",
    background: true
});
db.getCollection("debts").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("debts").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("debts").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});
db.getCollection("debts").createIndex({
    "id_branch": NumberInt("1")
}, {
    name: "id_branch_1",
    background: true
});

// ----------------------------
// Collection structure for deviceseparations
// ----------------------------
db.getCollection("deviceseparations").drop();
db.createCollection("deviceseparations");
db.getCollection("deviceseparations").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});
db.getCollection("deviceseparations").createIndex({
    "id_warehouse": NumberInt("1")
}, {
    name: "id_warehouse_1",
    background: true,
    sparse: true
});
db.getCollection("deviceseparations").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("deviceseparations").createIndex({
    "id_export_form": NumberInt("1")
}, {
    name: "id_export_form_1",
    background: true
});
db.getCollection("deviceseparations").createIndex({
    "id_import_form": NumberInt("1")
}, {
    name: "id_import_form_1",
    background: true
});
db.getCollection("deviceseparations").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("deviceseparations").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for email_announcement_promotions
// ----------------------------
db.getCollection("email_announcement_promotions").drop();
db.createCollection("email_announcement_promotions");
db.getCollection("email_announcement_promotions").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("email_announcement_promotions").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for employeegroups
// ----------------------------
db.getCollection("employeegroups").drop();
db.createCollection("employeegroups");
db.getCollection("employeegroups").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("employeegroups").createIndex({
    "id_super_group": NumberInt("1")
}, {
    name: "id_super_group_1",
    background: true
});
db.getCollection("employeegroups").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});

// ----------------------------
// Collection structure for employees
// ----------------------------
db.getCollection("employees").drop();
db.createCollection("employees");
db.getCollection("employees").createIndex({
    "employee_datebirth": NumberInt("1")
}, {
    name: "employee_datebirth_1",
    background: true,
    sparse: true
});
db.getCollection("employees").createIndex({
    "id_branch": NumberInt("1")
}, {
    name: "id_branch_1",
    background: true
});
db.getCollection("employees").createIndex({
    "id_employee_group": NumberInt("1")
}, {
    name: "id_employee_group_1",
    background: true
});
db.getCollection("employees").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("employees").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("employees").createIndex({
    "$**": "text"
}, {
    name: "employee_fullname_text",
    background: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "employee_fullname": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});
db.getCollection("employees").createIndex({
    "employee_phone": NumberInt("1")
}, {
    name: "employee_phone_1",
    background: true,
    unique: true,
    sparse: true
});

// ----------------------------
// Collection structure for employeesupergroups
// ----------------------------
db.getCollection("employeesupergroups").drop();
db.createCollection("employeesupergroups");
db.getCollection("employeesupergroups").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("employeesupergroups").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for exportforms
// ----------------------------
db.getCollection("exportforms").drop();
db.createCollection("exportforms");
db.getCollection("exportforms").createIndex({
    "id_warehouse": NumberInt("1")
}, {
    name: "id_warehouse_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    "export_form_product.id_product": NumberInt("1")
}, {
    name: "export_form_product.id_product_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    "export_form_product.id_subcategory": NumberInt("1")
}, {
    name: "export_form_product.id_subcategory_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    "export_form_product.id_employee": NumberInt("1")
}, {
    name: "export_form_product.id_employee_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    "export_form_product.id_import_return": NumberInt("1")
}, {
    name: "export_form_product.id_import_return_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    "id_employee_setting": NumberInt("1")
}, {
    name: "id_employee_setting_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    "id_employee_tranfer": NumberInt("1")
}, {
    name: "id_employee_tranfer_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    "id_employee_manager": NumberInt("1")
}, {
    name: "id_employee_manager_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    "id_employee_create": NumberInt("1")
}, {
    name: "id_employee_create_1",
    background: true
});
db.getCollection("exportforms").createIndex({
    "order_time_trafer": NumberInt("1")
}, {
    name: "order_time_trafer_1",
    background: true,
    sparse: true
});
db.getCollection("exportforms").createIndex({
    "export_form_product.id_employee_setting": NumberInt("1")
}, {
    name: "export_form_product.id_employee_setting_1",
    background: true
});

// ----------------------------
// Collection structure for exportwarranties
// ----------------------------
db.getCollection("exportwarranties").drop();
db.createCollection("exportwarranties");
db.getCollection("exportwarranties").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});
db.getCollection("exportwarranties").createIndex({
    "id_warehouse": NumberInt("1")
}, {
    name: "id_warehouse_1",
    background: true
});
db.getCollection("exportwarranties").createIndex({
    "warranty_product.id_product": NumberInt("1")
}, {
    name: "warranty_product.id_product_1",
    background: true
});
db.getCollection("exportwarranties").createIndex({
    "warranty_product.id_subcategory": NumberInt("1")
}, {
    name: "warranty_product.id_subcategory_1",
    background: true
});
db.getCollection("exportwarranties").createIndex({
    "warranty_product.id_product_changed": NumberInt("1")
}, {
    name: "warranty_product.id_product_changed_1",
    background: true
});
db.getCollection("exportwarranties").createIndex({
    "id_export_form": NumberInt("1")
}, {
    name: "id_export_form_1",
    background: true
});
db.getCollection("exportwarranties").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("exportwarranties").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("exportwarranties").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("exportwarranties").createIndex({
    "warranty_product.product_time_import": NumberInt("1")
}, {
    name: "warranty_product.product_time_import_1",
    background: true,
    sparse: true
});

// ----------------------------
// Collection structure for externalrepairservices
// ----------------------------
db.getCollection("externalrepairservices").drop();
db.createCollection("externalrepairservices");
db.getCollection("externalrepairservices").createIndex({
    "id_export_form": NumberInt("1")
}, {
    name: "id_export_form_1",
    background: true
});
db.getCollection("externalrepairservices").createIndex({
    "id_warehouse": NumberInt("1")
}, {
    name: "id_warehouse_1",
    background: true
});
db.getCollection("externalrepairservices").createIndex({
    "external_repair_service_product.id_product": NumberInt("1")
}, {
    name: "external_repair_service_product.id_product_1",
    background: true
});
db.getCollection("externalrepairservices").createIndex({
    "external_repair_service_product.id_subcategory": NumberInt("1")
}, {
    name: "external_repair_service_product.id_subcategory_1",
    background: true
});
db.getCollection("externalrepairservices").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("externalrepairservices").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});
db.getCollection("externalrepairservices").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("externalrepairservices").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for functions
// ----------------------------
db.getCollection("functions").drop();
db.createCollection("functions");
db.getCollection("functions").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("functions").createIndex({
    "function_name": NumberInt("1")
}, {
    name: "function_name_1",
    background: true,
    unique: true
});
db.getCollection("functions").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});

// ----------------------------
// Collection structure for fundbooks
// ----------------------------
db.getCollection("fundbooks").drop();
db.createCollection("fundbooks");
db.getCollection("fundbooks").createIndex({
    "id_branch": NumberInt("1")
}, {
    name: "id_branch_1",
    background: true
});
db.getCollection("fundbooks").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("fundbooks").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for gaming_market
// ----------------------------
db.getCollection("gaming_market").drop();
db.createCollection("gaming_market");

// ----------------------------
// Collection structure for importforms
// ----------------------------
db.getCollection("importforms").drop();
db.createCollection("importforms");
db.getCollection("importforms").createIndex({
    "id_warehouse": NumberInt("1")
}, {
    name: "id_warehouse_1",
    background: true
});
db.getCollection("importforms").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("importforms").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});
db.getCollection("importforms").createIndex({
    "import_form_product.id_employee": NumberInt("1")
}, {
    name: "import_form_product.id_employee_1",
    background: true
});
db.getCollection("importforms").createIndex({
    "import_form_product.id_form_export": NumberInt("1")
}, {
    name: "import_form_product.id_form_export_1",
    background: true
});
db.getCollection("importforms").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("importforms").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("importforms").createIndex({
    "import_form_product.id_form_exxport": NumberInt("1")
}, {
    name: "import_form_product.id_form_exxport_1",
    background: true
});
db.getCollection("importforms").createIndex({
    "import_form_product.id_employee_setting": NumberInt("1")
}, {
    name: "import_form_product.id_employee_setting_1",
    background: true
});

// ----------------------------
// Collection structure for internalorders
// ----------------------------
db.getCollection("internalorders").drop();
db.createCollection("internalorders");
db.getCollection("internalorders").createIndex({
    "from_warehouse": NumberInt("1")
}, {
    name: "from_warehouse_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    "to_warehouse": NumberInt("1")
}, {
    name: "to_warehouse_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    "from_user": NumberInt("1")
}, {
    name: "from_user_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    "to_user": NumberInt("1")
}, {
    name: "to_user_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    "interal_order_product.id_subcategory": NumberInt("1")
}, {
    name: "interal_order_product.id_subcategory_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    "interal_order_product.id_product": NumberInt("1")
}, {
    name: "interal_order_product.id_product_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    "from_employee": NumberInt("1")
}, {
    name: "from_employee_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    "to_employee": NumberInt("1")
}, {
    name: "to_employee_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    "id_import_form": NumberInt("1")
}, {
    name: "id_import_form_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    "id_export_form": NumberInt("1")
}, {
    name: "id_export_form_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    "id_form_import": NumberInt("1")
}, {
    name: "id_form_import_1",
    background: true
});
db.getCollection("internalorders").createIndex({
    "id_export_import": NumberInt("1")
}, {
    name: "id_export_import_1",
    background: true
});

// ----------------------------
// Collection structure for inventorywarnings
// ----------------------------
db.getCollection("inventorywarnings").drop();
db.createCollection("inventorywarnings");
db.getCollection("inventorywarnings").createIndex({
    "id_warehouse": NumberInt("1")
}, {
    name: "id_warehouse_1",
    background: true,
    sparse: true
});
db.getCollection("inventorywarnings").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("inventorywarnings").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("inventorywarnings").createIndex({
    "id_subcategory": NumberInt("1")
}, {
    name: "id_subcategory_1",
    background: true,
    sparse: true
});

// ----------------------------
// Collection structure for menus
// ----------------------------
db.getCollection("menus").drop();
db.createCollection("menus");
db.getCollection("menus").createIndex({
    "$**": "text"
}, {
    name: "menu_name_text",
    background: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "menu_name": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});
db.getCollection("menus").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("menus").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("menus").createIndex({
    "id_parent": NumberInt("1")
}, {
    name: "id_parent_1",
    background: true
});
db.getCollection("menus").createIndex({
    "id_represent_category": NumberInt("1")
}, {
    name: "id_represent_category_1",
    background: true
});
db.getCollection("menus").createIndex({
    "id_website_component": NumberInt("1")
}, {
    name: "id_website_component_1",
    background: true
});

// ----------------------------
// Collection structure for news
// ----------------------------
db.getCollection("news").drop();
db.createCollection("news");
db.getCollection("news").createIndex({
    "$**": "text"
}, {
    name: "news_title_text",
    background: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "news_title": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});
db.getCollection("news").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("news").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("news").createIndex({
    "news_slug_link": NumberInt("1")
}, {
    name: "news_slug_link_1",
    background: true,
    unique: true
});
db.getCollection("news").createIndex({
    "id_type": NumberInt("1")
}, {
    name: "id_type_1",
    background: true
});

// ----------------------------
// Collection structure for notifications
// ----------------------------
db.getCollection("notifications").drop();
db.createCollection("notifications");
db.getCollection("notifications").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("notifications").createIndex({
    "notification_time": NumberInt("1")
}, {
    name: "notification_time_1",
    background: true,
    sparse: true
});
db.getCollection("notifications").createIndex({
    "id_from": NumberInt("1")
}, {
    name: "id_from_1",
    background: true,
    sparse: true
});
db.getCollection("notifications").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});

// ----------------------------
// Collection structure for notificationusers
// ----------------------------
db.getCollection("notificationusers").drop();
db.createCollection("notificationusers");
db.getCollection("notificationusers").createIndex({
    "notification_time": NumberInt("1")
}, {
    name: "notification_time_1",
    background: true,
    sparse: true
});
db.getCollection("notificationusers").createIndex({
    "id_from": NumberInt("1")
}, {
    name: "id_from_1",
    background: true,
    sparse: true
});
db.getCollection("notificationusers").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});
db.getCollection("notificationusers").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("notificationusers").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for orders
// ----------------------------
db.getCollection("orders").drop();
db.createCollection("orders");
db.getCollection("orders").createIndex({
    "id_branch": NumberInt("1")
}, {
    name: "id_branch_1",
    background: true,
    sparse: true
});
db.getCollection("orders").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true,
    sparse: true
});
db.getCollection("orders").createIndex({
    "order_product.id_product": NumberInt("1")
}, {
    name: "order_product.id_product_1",
    background: true
});
db.getCollection("orders").createIndex({
    "order_product.id_subcategory": NumberInt("1")
}, {
    name: "order_product.id_subcategory_1",
    background: true
});
db.getCollection("orders").createIndex({
    "order_product.id_employee": NumberInt("1")
}, {
    name: "order_product.id_employee_1",
    background: true
});
db.getCollection("orders").createIndex({
    "id_export_form": NumberInt("1")
}, {
    name: "id_export_form_1",
    background: true
});
db.getCollection("orders").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("orders").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("orders").createIndex({
    "order_time_trafer": NumberInt("1")
}, {
    name: "order_time_trafer_1",
    background: true,
    sparse: true
});

// ----------------------------
// Collection structure for parts
// ----------------------------
db.getCollection("parts").drop();
db.createCollection("parts");
db.getCollection("parts").createIndex({
    "id_branch": NumberInt("1")
}, {
    name: "id_branch_1",
    background: true
});
db.getCollection("parts").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("parts").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for payments
// ----------------------------
db.getCollection("payments").drop();
db.createCollection("payments");
db.getCollection("payments").createIndex({
    "id_fundbook": NumberInt("1")
}, {
    name: "id_fundbook_1",
    background: true
});
db.getCollection("payments").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});
db.getCollection("payments").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("payments").createIndex({
    "payment_content": NumberInt("1")
}, {
    name: "payment_content_1",
    background: true
});
db.getCollection("payments").createIndex({
    "id_form": NumberInt("1")
}, {
    name: "id_form_1",
    background: true
});
db.getCollection("payments").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("payments").createIndex({
    "id_branch": NumberInt("1")
}, {
    name: "id_branch_1",
    background: true
});
db.getCollection("payments").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});

// ----------------------------
// Collection structure for permissions
// ----------------------------
db.getCollection("permissions").drop();
db.createCollection("permissions");
db.getCollection("permissions").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("permissions").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("permissions").createIndex({
    "id_employee_group": NumberInt("1")
}, {
    name: "id_employee_group_1",
    background: true,
    sparse: true
});
db.getCollection("permissions").createIndex({
    "id_function": NumberInt("1")
}, {
    name: "id_function_1",
    background: true,
    sparse: true
});

// ----------------------------
// Collection structure for points
// ----------------------------
db.getCollection("points").drop();
db.createCollection("points");
db.getCollection("points").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("points").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for policies
// ----------------------------
db.getCollection("policies").drop();
db.createCollection("policies");
db.getCollection("policies").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("policies").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for products
// ----------------------------
db.getCollection("products").drop();
db.createCollection("products");
db.getCollection("products").createIndex({
    "id_subcategory": NumberInt("1")
}, {
    name: "id_subcategory_1",
    background: true
});
db.getCollection("products").createIndex({
    "id_warehouse": NumberInt("1")
}, {
    name: "id_warehouse_1",
    background: true
});
db.getCollection("products").createIndex({
    "id_import_form": NumberInt("1")
}, {
    name: "id_import_form_1",
    background: true
});
db.getCollection("products").createIndex({
    "id_export_form": NumberInt("1")
}, {
    name: "id_export_form_1",
    background: true
});
db.getCollection("products").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("products").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("products").createIndex({
    "$**": "text"
}, {
    name: "id_product2_text",
    background: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "id_product2": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});

// ----------------------------
// Collection structure for promotioncombos
// ----------------------------
db.getCollection("promotioncombos").drop();
db.createCollection("promotioncombos");
db.getCollection("promotioncombos").createIndex({
    "$**": "text"
}, {
    name: "promotion_combo_name_text",
    background: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "promotion_combo_name": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});
db.getCollection("promotioncombos").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("promotioncombos").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for promotions
// ----------------------------
db.getCollection("promotions").drop();
db.createCollection("promotions");
db.getCollection("promotions").createIndex({
    "$**": "text"
}, {
    name: "promotion_title_text",
    background: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "promotion_title": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});
db.getCollection("promotions").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("promotions").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for receives
// ----------------------------
db.getCollection("receives").drop();
db.createCollection("receives");
db.getCollection("receives").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("receives").createIndex({
    "id_fundbook": NumberInt("1")
}, {
    name: "id_fundbook_1",
    background: true
});
db.getCollection("receives").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("receives").createIndex({
    "receive_content": NumberInt("1")
}, {
    name: "receive_content_1",
    background: true
});
db.getCollection("receives").createIndex({
    "id_form": NumberInt("1")
}, {
    name: "id_form_1",
    background: true
});
db.getCollection("receives").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("receives").createIndex({
    "id_branch": NumberInt("1")
}, {
    name: "id_branch_1",
    background: true
});
db.getCollection("receives").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});

// ----------------------------
// Collection structure for reportinventories
// ----------------------------
db.getCollection("reportinventories").drop();
db.createCollection("reportinventories");
db.getCollection("reportinventories").createIndex({
    "id_warehouse": NumberInt("1")
}, {
    name: "id_warehouse_1",
    background: true,
    sparse: true
});
db.getCollection("reportinventories").createIndex({
    "id_subcategory": NumberInt("1")
}, {
    name: "id_subcategory_1",
    background: true,
    sparse: true
});
db.getCollection("reportinventories").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("reportinventories").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for slidebanners
// ----------------------------
db.getCollection("slidebanners").drop();
db.createCollection("slidebanners");
db.getCollection("slidebanners").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("slidebanners").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for subcategories
// ----------------------------
db.getCollection("subcategories").drop();
db.createCollection("subcategories");
db.getCollection("subcategories").createIndex({
    "$**": "text"
}, {
    name: "subcategory_text_search_text",
    background: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "subcategory_text_search": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});
db.getCollection("subcategories").createIndex({
    "id_category": NumberInt("1")
}, {
    name: "id_category_1",
    background: true,
    sparse: true
});
db.getCollection("subcategories").createIndex({
    "subcategory_code": NumberInt("1")
}, {
    name: "subcategory_code_1",
    background: true,
    sparse: true
});
db.getCollection("subcategories").createIndex({
    "subcategory_name": NumberInt("1")
}, {
    name: "subcategory_name_1",
    background: true,
    unique: true
});
db.getCollection("subcategories").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("subcategories").createIndex({
    "subcategory_warehouses.id_warehouse": NumberInt("1")
}, {
    name: "subcategory_warehouses.id_warehouse_1",
    background: true
});
db.getCollection("subcategories").createIndex({
    "subcategory_replace_name": NumberInt("1")
}, {
    name: "subcategory_replace_name_1",
    background: true,
    unique: true
});
db.getCollection("subcategories").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for supercategories
// ----------------------------
db.getCollection("supercategories").drop();
db.createCollection("supercategories");
db.getCollection("supercategories").createIndex({
    "super_category_name": NumberInt("1")
}, {
    name: "super_category_name_1",
    background: true,
    unique: true
});
db.getCollection("supercategories").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("supercategories").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for timekeepingschedules
// ----------------------------
db.getCollection("timekeepingschedules").drop();
db.createCollection("timekeepingschedules");
db.getCollection("timekeepingschedules").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("timekeepingschedules").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("timekeepingschedules").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true,
    sparse: true
});

// ----------------------------
// Collection structure for timekeepingworks
// ----------------------------
db.getCollection("timekeepingworks").drop();
db.createCollection("timekeepingworks");
db.getCollection("timekeepingworks").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("timekeepingworks").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("timekeepingworks").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true,
    sparse: true
});

// ----------------------------
// Collection structure for tokens
// ----------------------------
db.getCollection("tokens").drop();
db.createCollection("tokens");
db.getCollection("tokens").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("tokens").createIndex({
    token: NumberInt("1")
}, {
    name: "token_1",
    background: true,
    sparse: true
});
db.getCollection("tokens").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});

// ----------------------------
// Collection structure for tranferfundbooks
// ----------------------------
db.getCollection("tranferfundbooks").drop();
db.createCollection("tranferfundbooks");
db.getCollection("tranferfundbooks").createIndex({
    "id_branch": NumberInt("1")
}, {
    name: "id_branch_1",
    background: true
});
db.getCollection("tranferfundbooks").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("tranferfundbooks").createIndex({
    "id_receipts": NumberInt("1")
}, {
    name: "id_receipts_1",
    background: true
});
db.getCollection("tranferfundbooks").createIndex({
    "id_payment": NumberInt("1")
}, {
    name: "id_payment_1",
    background: true
});
db.getCollection("tranferfundbooks").createIndex({
    "from_fundbook": NumberInt("1")
}, {
    name: "from_fundbook_1",
    background: true
});
db.getCollection("tranferfundbooks").createIndex({
    "to_fundbook": NumberInt("1")
}, {
    name: "to_fundbook_1",
    background: true
});
db.getCollection("tranferfundbooks").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("tranferfundbooks").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for typenews
// ----------------------------
db.getCollection("typenews").drop();
db.createCollection("typenews");
db.getCollection("typenews").createIndex({
    "type_news_name": NumberInt("1")
}, {
    name: "type_news_name_1",
    background: true,
    unique: true
});
db.getCollection("typenews").createIndex({
    "type_news_slug": NumberInt("1")
}, {
    name: "type_news_slug_1",
    background: true,
    unique: true
});
db.getCollection("typenews").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("typenews").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for users
// ----------------------------
db.getCollection("users").drop();
db.createCollection("users");
db.getCollection("users").createIndex({
    "user_phone": NumberInt("1")
}, {
    name: "user_phone_1",
    background: true,
    unique: true
});
db.getCollection("users").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("users").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("users").createIndex({
    "user_birthday": NumberInt("1")
}, {
    name: "user_birthday_1",
    background: true,
    sparse: true
});
db.getCollection("users").createIndex({
    "$**": "text"
}, {
    name: "user_fullname_text",
    background: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "user_fullname": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});

// ----------------------------
// Collection structure for vouchers
// ----------------------------
db.getCollection("vouchers").drop();
db.createCollection("vouchers");
db.getCollection("vouchers").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("vouchers").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("vouchers").createIndex({
    "$**": "text"
}, {
    name: "voucher_code_text",
    background: true,
    unique: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "voucher_code": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});
db.getCollection("vouchers").createIndex({
    "voucher_time_start": NumberInt("1")
}, {
    name: "voucher_time_start_1",
    background: true,
    sparse: true
});
db.getCollection("vouchers").createIndex({
    "voucher_time_end": NumberInt("1")
}, {
    name: "voucher_time_end_1",
    background: true,
    sparse: true
});
db.getCollection("vouchers").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});

// ----------------------------
// Collection structure for warehouses
// ----------------------------
db.getCollection("warehouses").drop();
db.createCollection("warehouses");
db.getCollection("warehouses").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("warehouses").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("warehouses").createIndex({
    "$**": "text"
}, {
    name: "warehouse_name_text",
    background: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "warehouse_name": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});
db.getCollection("warehouses").createIndex({
    "id_branch": NumberInt("1")
}, {
    name: "id_branch_1",
    background: true
});

// ----------------------------
// Collection structure for warranties
// ----------------------------
db.getCollection("warranties").drop();
db.createCollection("warranties");
db.getCollection("warranties").createIndex({
    "id_user": NumberInt("1")
}, {
    name: "id_user_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "id_warehouse": NumberInt("1")
}, {
    name: "id_warehouse_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "warranty_product.id_product": NumberInt("1")
}, {
    name: "warranty_product.id_product_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "warranty_product.product_time_export": NumberInt("1")
}, {
    name: "warranty_product.product_time_export_1",
    background: true,
    sparse: true
});
db.getCollection("warranties").createIndex({
    "warranty_product.id_form_export": NumberInt("1")
}, {
    name: "warranty_product.id_form_export_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "warranty_product.id_product_return": NumberInt("1")
}, {
    name: "warranty_product.id_product_return_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "id_import_form": NumberInt("1")
}, {
    name: "id_import_form_1",
    background: true
});
db.getCollection("warranties").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("warranties").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "id_employee": NumberInt("1")
}, {
    name: "id_employee_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "warranty_product.id_product_changed": NumberInt("1")
}, {
    name: "warranty_product.id_product_changed_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "product.id_product": NumberInt("1")
}, {
    name: "product.id_product_1",
    background: true,
    sparse: true
});
db.getCollection("warranties").createIndex({
    "product.id_form_export": NumberInt("1")
}, {
    name: "product.id_form_export_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "product.id_user": NumberInt("1")
}, {
    name: "product.id_user_1",
    background: true,
    sparse: true
});
db.getCollection("warranties").createIndex({
    "product.status_change_supplier": NumberInt("1")
}, {
    name: "product.status_change_supplier_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "product.status_change_customer": NumberInt("1")
}, {
    name: "product.status_change_customer_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "warranty_product.id_supplier": NumberInt("1")
}, {
    name: "warranty_product.id_supplier_1",
    background: true,
    sparse: true
});
db.getCollection("warranties").createIndex({
    "warranty_product.status_change_supplier": NumberInt("1")
}, {
    name: "warranty_product.status_change_supplier_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "warranty_product.status_change_customer": NumberInt("1")
}, {
    name: "warranty_product.status_change_customer_1",
    background: true
});
db.getCollection("warranties").createIndex({
    "warranty_product.date_send_supplier": NumberInt("1")
}, {
    name: "warranty_product.date_send_supplier_1",
    background: true,
    sparse: true
});
db.getCollection("warranties").createIndex({
    "warranty_product.date_receive_supplier": NumberInt("1")
}, {
    name: "warranty_product.date_receive_supplier_1",
    background: true,
    sparse: true
});
db.getCollection("warranties").createIndex({
    "warranty_product.date_return_customer": NumberInt("1")
}, {
    name: "warranty_product.date_return_customer_1",
    background: true,
    sparse: true
});
db.getCollection("warranties").createIndex({
    "$**": "text"
}, {
    name: "warranty_product.subcategory_name_text",
    background: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "warranty_product.subcategory_name": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});
db.getCollection("warranties").createIndex({
    "warranty_product.id_export_form": NumberInt("1")
}, {
    name: "warranty_product.id_export_form_1",
    background: true
});

// ----------------------------
// Collection structure for warrantycombos
// ----------------------------
db.getCollection("warrantycombos").drop();
db.createCollection("warrantycombos");
db.getCollection("warrantycombos").createIndex({
    "$**": "text"
}, {
    name: "warranty_combo_name_text",
    background: true,
    sparse: true,
    weights: {
        "$**": NumberInt("1"),
        "warranty_combo_name": NumberInt("1")
    },
    "default_language": "english",
    "language_override": "language",
    textIndexVersion: NumberInt("3")
});
db.getCollection("warrantycombos").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("warrantycombos").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for websitecomponents
// ----------------------------
db.getCollection("websitecomponents").drop();
db.createCollection("websitecomponents");
db.getCollection("websitecomponents").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("websitecomponents").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});

// ----------------------------
// Collection structure for youtubes
// ----------------------------
db.getCollection("youtubes").drop();
db.createCollection("youtubes");
db.getCollection("youtubes").createIndex({
    createdAt: NumberInt("1")
}, {
    name: "createdAt_1",
    background: true
});
db.getCollection("youtubes").createIndex({
    updatedAt: NumberInt("1")
}, {
    name: "updatedAt_1",
    background: true
});
