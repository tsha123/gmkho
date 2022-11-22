import express from "express"
const routerAdmin = express.Router()
import * as router from "./../controllers/ControllerAdmin.js"

routerAdmin.get("/", router.home)
routerAdmin.get("/login", router.loginAdmin)
routerAdmin.get("/category-management/edit-content", router.category_content)

//========================================================================================================================
//#region unknown
routerAdmin.get("/export/print/:id_export", router.print_export)
routerAdmin.get("/warranty-export-management", router.warranty_export_management)
routerAdmin.get("/receive/print/:id_receive", router.print_receive)
routerAdmin.get("/payment/print/:id_payment", router.print_payment)
routerAdmin.get("/import/print/:id_import", router.print_import)
//#endregion unknown
//========================================================================================================================
//#region Tìm kiếm - FindsManagement
//Tìm kiếm sản phẩm
routerAdmin.get("/find-product-history", router.find_product)
//Lịch sử khách hàng
routerAdmin.get("/history-customer", router.history_customer)
//Lọc sản phẩm
routerAdmin.get("/filter-product", router.filter_product)
routerAdmin.get("/find-all-product-import", router.find_all_product_import)
//#endregion Tìm kiếm - FindsManagement
//========================================================================================================================
//#region Nghiệp vụ - BusinessManagement
//Nhập hàng từ nhà cung cấp
routerAdmin.get("/import-product-from-supplier/find", router.import_supplier)
routerAdmin.get("/import-product-from-supplier/print", router.print_import_supplier)
routerAdmin.get("/import-product-from-supplier/add", router.add_import_supplier)
routerAdmin.get("/import-product-from-supplier/import/import-supplier/add/:id_import", router.more_import_supplier)
//Nhập hàng khách trả lại
routerAdmin.get("/import-product-from-return/find", router.import_return)
routerAdmin.get("/import-product-from-return/add", router.add_import_return)
routerAdmin.get("/import-product-from-return/import/import-return/add/:id_import", router.more_import_return)
//Nhập hàng tồn đầu kỳ
routerAdmin.get("/import-product-from-period/import/import-period/add/:id_import", router.more_import_period)
routerAdmin.get("/import-product-from-period/add", router.add_import_period)
routerAdmin.get("/import-product-from-period/find", router.import_period)
//Xuất hàng để bán
routerAdmin.get("/export-product-to-sale/find", router.export_sale)
routerAdmin.get("/export-product-to-sale/add", router.add_export_sale)
routerAdmin.get("/export-product-to-sale/add/:id_export", router.more_export_sale)
//Xuất hàng trả lại nhà cung cấp
routerAdmin.get("/export-product-to-return/find", router.export_return)
routerAdmin.get("/export-product-to-return/add", router.add_export_return)
routerAdmin.get("/export-product-to-return/add/:id_export", router.more_export_return)
//Đơn hàng nội bộ
routerAdmin.get("/internal-order-management/proposal", router.internal_order_proposal)
routerAdmin.get("/internal-order-management/proposaled", router.internal_order_proposaled)
routerAdmin.get("/internal-order-management/export/:id_internal_order", router.internal_order_export)
//Phiếu thu
routerAdmin.get("/receive-form-management", router.receive_form)
//Phiếu chi
routerAdmin.get("/payment-form-management", router.payment_form)
//Mượn kho
routerAdmin.get("/borrow-management", router.borrow)
//Bảo hành sản phẩm
routerAdmin.get("/warranty-management", router.warranty_management)
//Đơn hàng từ web
routerAdmin.get("/order-management", router.order)
routerAdmin.get("/order-management/export/:id_order", router.order_export)
//Bóc tách và dụng máy
routerAdmin.get("/device-separation", router.device_separation)
//#endregion Nghiệp vụ - BusinessManagement
//========================================================================================================================
//#region Báo cáo thống kê - ReportsManagement
//Chấm công đi làm
routerAdmin.get("/timekeeping-work-management", router.timekeeping_work)
//Chấm công trực
routerAdmin.get("/timekeeping-schedule-management", router.timekeeping_schedule)
//Lịch trực
routerAdmin.get("/calendar-management", router.calendar)
//Hàng bán theo nghày
routerAdmin.get("/product-sold-by-date", router.product_sold_by_date)
//Theo dõi nhập xuất tồn
routerAdmin.get("/inventory-management", router.report_inventory)
//Công nợ khách hàng
routerAdmin.get("/debt-management", router.report_debt)
//Lợi nhuận theo sản phẩm
routerAdmin.get("/revenue-product", router.revenue_product)
routerAdmin.get("/revenue-product-by-employee", router.revenue_product_by_employee)
//Tình hình thu chi
routerAdmin.get("/revenue-and-expenditure-statistics", router.payment_and_receive)
//Sổ quỹ
routerAdmin.get("/fundbook-management", router.fundbook)
routerAdmin.get("/fundbook-management/report", router.report_fundbook)
//#endregion Báo cáo thống kê - ReportsManagement
//========================================================================================================================
//#region Quản lý hệ thống -SystemsManagement
//Quản lý danh mục
routerAdmin.get("/category-management", router.category)
//Quản lý sản phẩm
routerAdmin.get("/product-management", router.subcategory)
//Quản lý kho
routerAdmin.get("/warehouse-management", router.warehouse)
//Quản lý chi nhánh
routerAdmin.get("/branch-management", router.branch)
//Quản lý nhân viên
routerAdmin.get("/employee-management", router.employee_management)
//Bút toán thu chi
routerAdmin.get("/accouting-entry-management", router.accounting_entry)
//Tài sản cố định
routerAdmin.get("/asset-management", router.asset)
//Quản lý tích điểm
routerAdmin.get("/point-management", router.point)
//Tạo mã giảm giá
routerAdmin.get("/voucher-management", router.voucher)
//Danh sách khách hàng
routerAdmin.get("/users-management", router.user)
//Phân quyền
routerAdmin.get("/permission-management", router.permission)
//#endregion Quản lý hệ thống -SystemsManagement
//========================================================================================================================
//#region content management
//Quản lý youtube
routerAdmin.get("/youtube-management", router.youtube_management)
// Tin khuyến mãi
routerAdmin.get("/promotion-news-management", router.promotion)
routerAdmin.get("/promotion-news-management/edit-promotion", router.edit_add_promotion)
//Quản lý tin tức
routerAdmin.get("/news-management", router.news)
routerAdmin.get("/news-management/edit-news", router.edit_add_news)
//Quản lý bài viết sản phẩm
routerAdmin.get("/subcategory-contents-management", router.up_subcategory)
//Quản lý combo khuyến mại
routerAdmin.get("/promotion-combo-management", router.promotion_combo)
//Quản lý combo bảo hành
routerAdmin.get("/warranty-combo-management", router.warranty_combo)
//Quản lý chính sách
routerAdmin.get("/manage-policy", router.manage_policy)
//Quản lý slide banner
routerAdmin.get("/slide-banner-admin", router.slide_banner)
//Quản lý menu
routerAdmin.get("/menu-management", router.menu)
//Quản lý thành phần website
routerAdmin.get("/component-website-management", router.website_component)
//Quản lý thành phần app mobile
routerAdmin.get("/component-app-management", router.app_component)
//#endregion content management
//========================================================================================================================
//#region CRM management
routerAdmin.get("/email-announcement-promotion", router.manage_email_announcement_promotion)
routerAdmin.get("/external-repair-service", router.external_repair_service)
routerAdmin.get("/external-repair-service/export", router.external_repair_service_export)
routerAdmin.get("/external-repair-service/import", router.external_repair_service_import)

routerAdmin.get("/change-warehouse", router.change_warehouse)
routerAdmin.get("/change-warehouse/export", router.change_warehouse_export)

routerAdmin.get("/combo-product-to-sale", router.combo_product_to_sale)
routerAdmin.get("/tranfer-fundbook", router.tranfer_fundbook)
//#endregion CRM management
//========================================================================================================================

export default routerAdmin
