const ACCESS_TOKEN = getCookie("token")
const MAX_SIZE_IMAGE = 400000
    const URL_MAIN = "http://localhost:8500/"
    const URL_API = "http://localhost:8500/api"

// const URL_MAIN = "https://haiphongcomputer.com/"
// const URL_API = "https://haiphongcomputer.com/api"
const URL_IMAGE_BRANCH = URL_MAIN + "images/images_branch/"
const URL_IMAGE_EMPLOYEE = URL_MAIN + "images/images_employee/"
const URL_IMAGE_CATEGORY = URL_MAIN + "images/images_category/"
const URL_IMAGE_PRODUCT = URL_MAIN + "images/images_product/"
const URL_IMAGE_PROMOTION = URL_MAIN + "images/images_promotion/"
const URL_IMAGE_NEWS = URL_MAIN + "images/images_news/"
const URL_IMAGE_MENU = URL_MAIN + "images/images_menu/"
const URL_IMAGE_WEBSITE_COMPONENT = URL_MAIN + "images/images_website_component/"
const URL_IMAGE_SLIDE_BANNER = URL_MAIN + "images/images_slide_banner"
const IMAGE_NULL = "https://i.pinimg.com/originals/aa/be/6d/aabe6d6db5e5f569e69e56e851eba8f0.gif" // ảnh nào bị null tự động bị gán bằng ảnh này

const API_CATEGORY = `/api/category` // api danh mục
const API_SUBCATEGORY = `/api/subcategory` // api sản phẩm
const API_WAREHOUSE = `/api/warehouse` // api danh khách kho
const API_BRANCH = `/api/branch` // api chi nhánh
const API_EMPLOYEE = `/api/employee` // api nhân viên
const API_PERMISSION = `/api/permission` // api Check quyền
const API_ASSETS = `/api/asset` // api tài sản cố định
const API_CALENDAR = `/api/calendar` // api lịch trực
const API_TIMEKEEPING_SCHEDULE = `/api/timekeeping/schedule` // api chấm công trực
const API_TIMEKEEPING = `/api/timekeeping` // api chấm công đi làm
const API_FUNDBOOK = `/api/fundbook` // api sổ quỹ
const API_ACCOUNTING_ENTRY = `/api/accounting-entry` // api bút toán thu chi
const API_IMPORT = `/api/import` // api NHẬP hàng từ nhà cung cấp
    // const API_IMPORT_PERIOD = `/api/import-period`
    // const API_IMPORT_RETURN = `/api/import/return`
const API_USER = `/api/user` // api user ( khách hàng)
const API_POINT = `/api/point` // api tích điểm ( khách hàng)
const API_VOUCHER = `/api/voucher` // api mã giảm giá
const API_PRODUCT = `/api/product` // api sản phẩm
const API_EXPORT = `/api/export`
const API_INTERNAL_ORDER = `/api/internal-order`
const API_RECEIVE = `/api/receive`
const API_PAYMENT = `/api/payment`
const API_BORROW = `/api/borrow`
const API_ORDER = `/api/order/admin`
const API_WARRANTY = `/api/warranty`
const API_EXPORT_WARRANTY = `/api/export-warranty`
const API_DEBT = `/api/debt`
const API_INVENTORY = `/api/inventory`
const API_PROMOTION = `/api/gm-feed/promotion`
const API_NEWS = `/api/gm-feed/news`
    //
const API_MENU = `/api/menu`
const API_WEBSITE_COMPONENT = `/api/website-component`
const API_SLIDE_BANNER = `/api/slide-banner-admin`
const API_POLICY = `/api/policy-admin`
const API_DEVICE_SEPARATION = `/api/device-separation`
const API_YOUTUBE = `/api/youtube`
    //CRM
const API_EMAIL_ANNOUNCEMENT_PROMOTION = `/api/email-announcement-promotion`
const API_EXTERNAL_REPAIR_SERVICE = '/api/external-repair-service'
const API_CHANGE_WAREHOUSE = `/api/change-warehouse`
const API_COMBO_PRODUCT_TO_SALE = '/api/combo-product-to-sale'
const API_TRANFER_FUNDBOOK = '/api/tranfer-fundbook'
    //
var stt = 1
const isDebug = true

function throwValue(val) {
    if (isDebug && val) {
        console.log(val)
    }
}

function throwError(e) {
    if (isDebug && e) {
        console.error(e)
    }
}

function logout() {
    setCookie("token", null)
    window.location = "/login"
}

function getTime() {
    const date = new Date()
    return {
        startMonth: date.getFullYear() + "-" + addZero(date.getMonth() + 1) + "-01",
        current: date.getFullYear() + "-" + addZero(date.getMonth() + 1) + "-" + addZero(date.getDate()),
    }
}

function formatDate(time = new Date()) {
    time = new Date(time)
    return {
        fulldate: time.getFullYear() + "-" + addZero(time.getMonth() + 1) + "-" + addZero(time.getDate()),
        fulldatetime: time.getFullYear() + "-" + addZero(time.getMonth() + 1) + "-" + addZero(time.getDate()) + " " + addZero(time.getHours()) + ":" + addZero(time.getMinutes()) + ":" + addZero(time.getSeconds()),
    }
}

function setCookie(name, value, days = 30) {
    if (days) {
        var date = new Date()
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
        var expires = "; expires=" + date.toGMTString()
    } else var expires = ""
    document.cookie = name + "=" + value + expires + "; path=/"
}

function escapehtml(s) {
    return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, "\\$1")
}

function getCookie(name) {
    var match = document.cookie.match(RegExp("(?:^|;\\s*)" + escapehtml(name) + "=([^;]*)"))
    return match ? match[1] : null
}

function isLoading(status = true) {
    if (status) $("#loading_screen").show()
    else {
        $("#loading_screen").hide()
    }
}

const create_barcode = (text, tag, format = "code128", lineColor = "#24292e") => {
    JsBarcode(tag, text, {
        format: format,
        lineColor: lineColor,
        width: 1,
        height: 45,
        displayValue: true,
        fontSize: 12,
    })
}

$(function() {
    $("select, .select2").each(function() {
        $(this).select2({
            theme: "bootstrap4",
            width: $(this).data("width") ? $(this).data("width") : $(this).hasClass("w-100") ? "100%" : "style",
            placeholder: $(this).data("placeholder"),
            allowClear: Boolean($(this).data("allow-clear")),
            closeOnSelect: !$(this).attr("multiple"),
        })
    })
})

const tryParseInt = function(str) {
    try {
        if (!isDefine(str)) return 0
        str = str.toString().split("")
        for (let i = 0; i < str.length; i++) {
            str[i] = str[i].replace(",", "").replace(/[a-z]/g, "")
        }
        var data = ""
        for (let i = 0; i < str.length; i++) {
            data += str[i].trim()
        }
        data = data.trim()
        return isNaN(parseInt(data)) ? 0 : parseInt(data)
    } catch (e) {
        console.log(e)
        return 0
    }
}

const tryParseFloat = function(str) {
    try {
        return isNaN(parseFloat(str)) ? 0 : parseFloat(str)
    } catch (e) {
        console.log(e)
        return 0
    }
}
const tryParseBoolean = (str) => {
    if (isDefine(str)) {
        switch (str.toString().toLowerCase().trim()) {
            case "true":
            case "yes":
            case "1":
                return true
            case "false":
            case "no":
            case "0":
                return false
            default:
                return Boolean(str)
        }
    } else {
        return false
    }
}
const isDefine = function(val) {
    try {
        if (!val) return false
        if (val == undefined) return false
        if (val == "") return false
        if (typeof val == "undefined") return false
        if (val == "undefined") return false
        return true
    } catch (err) {
        return false
    }
}

function stringToSlug(str) {
    // remove accents
    var from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
        to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy"
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(RegExp(from[i], "gi"), to[i])
    }

    str = str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\-]/g, "-")
        .replace(/-+/g, "-")

    return str
}

function money(nStr) {
    if (typeof nStr == "undefined" || nStr == null) return 0
    nStr.toString()
    nStr += ""
    x = nStr.split(".")
    x1 = x[0]
    x2 = x.length > 1 ? "." + x[1] : ""
    var rgx = /(\d+)(\d{3})/
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, "$1" + "," + "$2")
    }
    return x1 + x2
}

function pagination(count, legth, isShow = 4) {
    count = Math.ceil(tryParseInt(count) / tryParseInt(limit))
    $("#divPagination").empty()
    if (legth == 0) {
        $("#divPagination").html("Không có dữ liệu")
        return
    }
    let html = '<ul class="pagination">'
    let isable = "disabled"
    for (let i = 1; i <= count; i++) {
        isable = "disabled"
        if (i == 1) {
            //hiện nút trước có 2 trường hợp xảy ra. page = 1 , page != 1 ; nếu =1 -> disabled Previous còn lại abled
            if (page != 1) isable = ""
            html += `
                <li class="page-item ${isable}">
                    <a class="page-link" onclick="changePage(${tryParseInt(page) - 1},${legth})" href="javascript:void(0)" tabindex="-1">Trước</a>
                </li>`
        }

        if (i <= 3) {
            // luôn hiển thị 3 trang đầu
            if (i == page) {
                //active
                html += ` 
                <li class="page-item active">
                    <a class="page-link"  href="javascript:void(0)">${i} <span class="sr-only">(current)</span></a> 
                </li>`
            } else {
                html += `<li class="page-item"><a class="page-link" onclick="changePage(${i},${legth})" href="javascript:void(0)">${i}</a></li>`
            }
        } // trường hợp nhiều hơn 3 và i lúc này lớn hơn 3
        else {
            if ((page - i >= 0 && page - i <= isShow) || (i - page >= 0 && i - page <= isShow)) {
                if (i == page) {
                    //active
                    html += ` 
                    <li class="page-item active">
                        <a class="page-link" onclick="changePage(${i},${legth})"  href="javascript:void(0)">${i} <span class="sr-only">(current)</span></a> 
                    </li>`
                } else {
                    html += `<li class="page-item"><a class="page-link" onclick="changePage(${i},${legth})" href="javascript:void(0)">${i}</a></li>`
                }
            } else if (i != count) {
                // kiểm tra đẻ chỉ hiện thị dấu ...
                if (page - i == isShow + 1 || i - page == isShow + 1) {
                    //page -i == isShow+1 hiện thị dấu ... trước , còn lại là dấu ... đằng sau
                    html += `<li class="page-item"><a onclick="changePage(${i},${legth})" class="page-link" href="javascript:void(0)">...</a></li>`
                }
            } // hiện thị nút cuối cùng
            else {
                html += `<li class="page-item"><a class="page-link" onclick="changePage(${i},${legth})" href="javascript:void(0)">${i}</a></li>`
            }
        }
        if (i == count && i >= 2) {
            //Hiện nút sau có 2 trang trở lên mới hiện nút next, có 2 trường hợp xảy ra. page = count , page < count ; nếu = count -> disabled Previous còn lại abled
            if (page < count) isable = ""
            html += `
                <li class="page-item ${isable}">
                    <a class="page-link" onclick="changePage(${tryParseInt(page) + 1}, ${legth})" href="javascript:void(0)" tabindex="1">Sau</a>
                </li>`
            break
        }
    }
    html += "</ul>"
    $("#divPagination").html(html)
}

function changePage(index, length) {
    stt = (index - 1) * length + 1
    page = index
    getData()
}
//#region phân trang 2
// Phân trang
const CLASS_PAGE_ITEM = `page-item`
const CLASS_PAGE_ITEM_ACTIVE = `page-item active`
const CLASS_PAGE_LINK = `page-link`

function pagination2(total_count, curent_page, div_pagination = `divPagination`, isShow = 3) {
    const from_STT = (curent_page - 1) * limit + 1
    const to_STT = (curent_page - 1) * limit + total_count
    let pagePatigation = ""
    pagePatigation += `<div class="row dataTables_wrapper">`
    pagePatigation += `<div class="col-sm-12 col-md-7"><div class="dataTables_info" id="dataTable_info" role="status" aria-live="polite">Đang hiển thị ${from_STT} -> ${to_STT} của ${total_count}</div></div>`
    pagePatigation += '<div class="col-sm-12 col-md-5">'
    pagePatigation += '<ul class="pagination" style="justify-content: flex-end;">'
    if (tryParseInt(limit) == 0) {
        limit = FIXED_LIMIT_TAB_SEARCH_CATEGORY
    }
    page = tryParseInt(curent_page)
    const total_page = Math.ceil(tryParseInt(total_count) / tryParseInt(limit))
        // console.log(`total_page:`, total_page)
    if (total_page > 1) {
        if (page > 1) {
            //first page
            pagePatigation += `<li onclick="changeOffset_1(0)" class="${CLASS_PAGE_ITEM}" ><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}"><i style="transform:rotate(180deg)" class="fas fa-angle-double-right"></i></a></li>`
                //previouse page
            pagePatigation += `<li onclick="previousPage()" class="${CLASS_PAGE_ITEM} previous"  ><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}"><i class="fas fa-chevron-left"></i></a></li>`
        } else {
            if (page == 1) {
                //first page
                pagePatigation += `<li class="${CLASS_PAGE_ITEM} disabled"><a href="javascript:void(0);"  class="${CLASS_PAGE_LINK}"><i style="transform:rotate(180deg)" class="fas fa-angle-double-right"></i></a></li>`
            } else {
                //first page
                pagePatigation += `<li class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);"  class="${CLASS_PAGE_LINK}"><i style="transform:rotate(180deg)" class="fas fa-angle-double-right"></i></a></li>`
            }
        }
        //pages
        if (total_page <= 1 + isShow * 2) {
            for (let i = 0; i < total_page - 1; i++) {
                if (i == page - 1) {
                    pagePatigation += `<li onclick="changeOffset_1(${i})" class="${CLASS_PAGE_ITEM_ACTIVE}"><a href="javascript:void(0);"  class="${CLASS_PAGE_LINK}">${i + 1}</a></li>`
                } else {
                    pagePatigation += `<li onclick="changeOffset_1(${i})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}">${i + 1}</a></li>`
                }
            }
        } else {
            //enough pages to hide some
            //close to beginning; only hide later pages
            if (page <= isShow) {
                for (let i = 0; i < isShow + 1; i++) {
                    if (i == page - 1) {
                        pagePatigation += `<li  onclick="changeOffset_1(${i})" class="${CLASS_PAGE_ITEM_ACTIVE}"><a href="javascript:void(0);"  class="${CLASS_PAGE_LINK}">${i + 1}</a></li>`
                    } else {
                        pagePatigation += `<li onclick="changeOffset_1(${i})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}">${i + 1}</a></li>`
                    }
                }
                pagePatigation += `<li onclick="changeOffset_1(${Math.round((page + total_page) / 2)})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}">...</a></li>`
            } else if (total_page - isShow > page && page > isShow) {
                //in middle; hide some front and some back
                //page 1
                pagePatigation += `<li onclick="changeOffset_1(${0})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);"  class="${CLASS_PAGE_LINK}">${1}</a></li>`
                    //...
                pagePatigation += `<li onclick="changeOffset_1(${Math.round(page / 2)})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}">...</a></li>`
                for (let i = page - 2; i < page + 1; i++) {
                    if (i == page - 1) {
                        pagePatigation += `<li onclick="changeOffset_1(${i})" class="${CLASS_PAGE_ITEM_ACTIVE}"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}">${i + 1}</a></li>`
                    } else {
                        pagePatigation += `<li onclick="changeOffset_1(${i})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);"  class="${CLASS_PAGE_LINK}">${i + 1}</a></li>`
                    }
                }
                //...
                pagePatigation += `<li onclick="changeOffset_1(${Math.round((page + total_page) / 2)})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}">...</a></li>`
            } else {
                //close to end; only hide early pages
                //page 1
                pagePatigation += `<li onclick="changeOffset_1(${0})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}">${1}</a></li>`
                    //...
                pagePatigation += `<li onclick="changeOffset_1(${Math.round(page / 2)})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}">...</a></li>`
                for (let i = total_page - isShow - 1; i < total_page - 1; i++) {
                    if (i == page - 1) {
                        pagePatigation += `<li onclick="changeOffset_1(${i})" class="${CLASS_PAGE_ITEM_ACTIVE}"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}">${i + 1}</a></li>`
                    } else {
                        pagePatigation += `<li onclick="changeOffset_1(${i})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}">${i + 1}</a></li>`
                    }
                }
            }
        }
        //next button
        if (page < total_page) {
            pagePatigation += `<li onclick="changeOffset_1(${total_page - 1})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);"  class="${CLASS_PAGE_LINK}">${total_page}</a></li>`
            pagePatigation += `<li onclick="nextPage()" class="${CLASS_PAGE_ITEM} next"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}"><i class="fas fa-chevron-right"></i></a></li>`
                //last page
            pagePatigation += `<li onclick="changeOffset_1(${total_page - 1})" class="${CLASS_PAGE_ITEM}"><a href="javascript:void(0);"  tabindex="10" class="${CLASS_PAGE_LINK}"><i class="fas fa-angle-double-right"></i></a></li>`
        } else {
            pagePatigation += `<li onclick="changeOffset_1(${total_page - 1})" class="${CLASS_PAGE_ITEM_ACTIVE}"><a href="javascript:void(0);"  class="${CLASS_PAGE_LINK}">${total_page}</a></li>`
            pagePatigation += `<li class="${CLASS_PAGE_ITEM} disabled"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}"><i class="fas fa-angle-double-right"></i></a></li>`
        }
    } else {
        pagePatigation += `<li onclick="changeOffset_1(${0})" class="${CLASS_PAGE_ITEM_ACTIVE}"><a href="javascript:void(0);" class="${CLASS_PAGE_LINK}">${1}</a></li>`
    }
    pagePatigation += "</ul>"
    pagePatigation += "</div>"
    pagePatigation += "</div>"
        // $("#pagePatigation").addClass("mb-3");
    $(`#${div_pagination}`).html(pagePatigation)
}

function nextPage() {
    const page_change = page + 1
    let theURL
    theURL = new URL(`${window.location.href}`)
    theURL.searchParams.set("page", page_change)
        // console.log(theURL.toString());
    const new_URL = theURL.toString()
    changeURL(new_URL)
    getData(page_change)
}

function previousPage() {
    const page_change = page - 1
    let theURL
    theURL = new URL(`${window.location.href}`)
    theURL.searchParams.set("page", page_change)
        // console.log(theURL.toString());
    const new_URL = theURL.toString()
    changeURL(new_URL)
    getData(page_change)
}

function changeOffset_1(index) {
    const page_change = index + 1
    let theURL
    theURL = new URL(`${window.location.href}`)
    theURL.searchParams.set("page", page_change)
        // console.log(theURL.toString());
    const new_URL = theURL.toString()
    changeURL(new_URL)
    getData(page_change)

}
//#endregion
function addZero(number, length = 2) {
    var my_string = "" + number
    while (my_string.length < length) {
        my_string = "0" + my_string
    }
    return my_string
}

function showPopup(popup, isEmpty = false, popupHide) {
    if (isEmpty) {
        $(`#${popup} input[type=text]`).val(null)
        $(`#${popup} input[type=text]`).attr("autocomplete", "off")
        $(`#${popup} input[type=file]`).val(null)
        $(`#${popup} .empty`).empty()

        $(`#${popup} .number`).val(0)
        $(`#${popup} img`).attr("src", IMAGE_NULL)
    }
    $(`#${popup}`).modal("show")
    if (typeof popupHide != "undefined") {
        hidePopup(popupHide)
    }
}

function hidePopup(popup, popupShow) {
    $(`#${popup}`).modal("hide")
    if (typeof popupShow != "undefined") {
        showPopup(popupHide)
    }
}

function success(text_tb) {
    Swal.fire("Thông Báo", text_tb, "success")
}

function warning(text_tb) {
    Swal.fire("Thông Báo", text_tb, "warning")
}

function error(text_tb) {
    Swal.fire("Thông Báo", text_tb, "error")
}

function info(text_tb) {
    Swal.fire("Thông Báo", text_tb, "info")
}

function inputNumber(input = event.target, typeNumber = "int") {
    if (typeof input == "undefined") input = $(event.path[0])
    if ($(input).val().length == 0) $(input).val(0)
    if (typeNumber == "int") $(input).val(tryParseInt($(input).val()))
    if (typeNumber == "float") {
        $(input).val(parseFloat($(input).val()))
    }
}

function isChecked(time) {
    if (time.hours == 0 && time.minutes == 0 && time.seconds == 0) return false
    return true
}

function achievement(in_morning, out_morning, in_afternoon, out_afternoon) {
    let number = 0
    if (isChecked(in_morning) && isChecked(out_morning)) {

        const totalMinutes = ((out_morning.hours * 60 + out_morning.minutes) - (in_morning.hours * 60 + in_morning.minutes)) / 60

        if (totalMinutes / 8 >= 0.5) number = 0.5
        else number = totalMinutes / 8
    }
    if (isChecked(in_afternoon) && isChecked(out_afternoon)) {
        const totalMinutes = (out_afternoon.hours * 60 + out_afternoon.minutes - (in_afternoon.hours * 60 + in_afternoon.minutes)) / 60
        if (totalMinutes / 8 >= 0.5) number += 0.5
        else number += totalMinutes / 8
    }

    return round2(number)
}

function dataTable(id, isButton = true) {
    if (typeof id == "undefined" || id == null) {
        id = "dataTable"
    }
    var buttons = ["copy", "csv", "excel", "pdf", "print"]
    if (!isButton) {
        buttons = []
    }
    $(`#${id} thead tr`)
        .clone(true)
        .addClass('filters')
        .appendTo(`#${id} thead`);
    $(`#${id}`).DataTable({
        dom: "Bfrtip",
        lengthChange: true,
        paging: true,
        orderable: true,
        lengthMenu: [
            [10, 30, 40, 50, -1],
            [10, 30, 40, 50, "Tất cả"],
        ],
        buttons: buttons,
        orderCellsTop: true,
        fixedHeader: true,
        initComplete: function() {
            var api = this.api();

            // For each column
            api
                .columns()
                .eq(0)
                .each(function(colIdx) {
                    // Set the header cell to contain the input element
                    var cell = $('.filters th').eq(
                        $(api.column(colIdx).header()).index()
                    );
                    var title = $(cell).text();
                    $(cell).html('<input type="text" placeholder="' + title + '" />');

                    // On every keypress in this input
                    $(
                            'input',
                            $('.filters th').eq($(api.column(colIdx).header()).index())
                        )
                        .off('keyup change')
                        .on('change', function(e) {
                            // Get the search value
                            $(this).attr('title', $(this).val());
                            var regexr = '({search})'; //$(this).parents('th').find('select').val();

                            // var cursorPosition = this.selectionStart;
                            // Search the column for that value
                            api
                                .column(colIdx)
                                .search(
                                    this.value != '' ?
                                    regexr.replace('{search}', '(((' + this.value + ')))') :
                                    '',
                                    this.value != '',
                                    this.value == ''
                                )
                                .draw();
                        })
                        // .on('keyup', function(e) {
                        //     e.stopPropagation();

                    //     $(this).trigger('change');
                    //     $(this)
                    //         .focus()[0]
                    //         .setSelectionRange(cursorPosition, cursorPosition);
                    // });
                });
        },

    })
}

function dataTable2(table, isButton = true, islength = true, isPaging = true) {
    if (typeof table == "undefined" || table == null) {
        table = $("#dataTable")
    }
    var buttons = ["copy", "csv", "excel", "pdf", "print"]
    if (!isButton) {
        buttons = []
    }
    // $(`${table} thead tr`)
    //     .clone(true)
    //     .addClass('filters')
    //     .appendTo(`${table} thead`);

    const tr_thead = $(table).find('thead tr')
    for (let i = 0; i < tr_thead.length; i++) {
        $(tr_thead[i]).clone(true).addClass('filters').appendTo(`thead`);
    }

    table.DataTable({
        dom: "Bfrtip",
        lengthChange: islength,
        paging: isPaging,
        orderable: true,
        lengthMenu: [
            [10, 30, 40, 50, -1],
            [10, 30, 40, 50, "Tất cả"],
        ],
        buttons: buttons,
        orderCellsTop: true,
        fixedHeader: true,
        initComplete: function() {
            var api = this.api();

            // For each column
            api
                .columns()
                .eq(0)
                .each(function(colIdx) {
                    // Set the header cell to contain the input element
                    var cell = $('.filters th').eq(
                        $(api.column(colIdx).header()).index()
                    );
                    var title = $(cell).text();
                    $(cell).html('<input type="text" placeholder="' + title + '" />');

                    // On every keypress in this input
                    $(
                            'input',
                            $('.filters th').eq($(api.column(colIdx).header()).index())
                        )
                        .off('keyup change')
                        .on('change', function(e) {
                            // Get the search value
                            $(this).attr('title', $(this).val());
                            var regexr = '({search})'; //$(this).parents('th').find('select').val();

                            // var cursorPosition = this.selectionStart;
                            // Search the column for that value
                            api
                                .column(colIdx)
                                .search(
                                    this.value != '' ?
                                    regexr.replace('{search}', '(((' + this.value + ')))') :
                                    '',
                                    this.value != '',
                                    this.value == ''
                                )
                                .draw();
                        })
                        // .on('keyup', function(e) {
                        //     e.stopPropagation();

                    //     $(this).trigger('change');
                    //     $(this)
                    //         .focus()[0]
                    //         .setSelectionRange(cursorPosition, cursorPosition);
                    // });
                });
        },

    })
}

function decimalAdjust(type, value, exp) {
    try {
        if (!isDefine(value)) return 0
            // If the exp is undefined or zero...
        if (typeof exp === "undefined" || +exp === 0) {
            return Math[type](value)
        }
        value = +value
        exp = +exp
            // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
            return NaN
        }
        // Shift
        value = value.toString().split("e")
        value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)))
            // Shift back
        value = value.toString().split("e")
        return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp))
    } catch (err) {
        throwError(err)
        return 0
    }
}

const round2 = (value) => decimalAdjust("round", value, -2)
const round = (value) => decimalAdjust("round", value, 0)
    // Decimal floor
const floor2 = (value) => decimalAdjust("floor", value, -2)
    // Decimal ceil
const ceil2 = (value) => decimalAdjust("ceil", value, -2)
const ceil = (value) => decimalAdjust("ceil", value, 0)

function dayOfWeek(val) {
    var currentDate = new Date(val)
    if (currentDate.getDay() == 0) {
        currentDate.setDate(currentDate.getDate() - 1)
    }
    const monday = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)).toUTCString()
    const tuesday = nextDay(monday)
    const wednesday = nextDay(tuesday)
    const thursday = nextDay(wednesday)
    const friday = nextDay(thursday)
    const saturday = nextDay(friday)
    const sunday = nextDay(saturday)

    return {
        monday: monday,
        tuesday: tuesday,
        wednesday: wednesday,
        thursday: thursday,
        friday: friday,
        saturday: saturday,
        sunday: sunday,
    }
}

function nextweek() {
    var today = new Date()
    var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
    return nextweek
}

function nextDay(val) {
    var currentDate = new Date(val)
    return new Date(currentDate.setDate(currentDate.getDate() + 1)).toUTCString()
}

function sameDay(val1, val2) {
    val1 = new Date(val1)
    val2 = new Date(val2)

    if (val1.getDate() == val2.getDate() && val1.getMonth() == val2.getMonth() && val1.getFullYear() == val2.getFullYear()) {
        return true
    }
    return false
}

$(window).on("popstate", function(event) {
    window.location = window.location.search
    window.history.pushState({ id: 1 }, null, "")
})

function changeURL(urlPath) {
    window.history.pushState({ id: 1 }, null, urlPath)
}

$("#keyFind").on("keypress", (event) => {
    if (event.which == "13") {
        getData(false)
    }
})

function downloadExcelLocal(data, fileName = "download") {
    var opts = [
        { sheetid: "One", header: true },
        { sheetid: "Two", header: false },
    ]
    alasql(`SELECT INTO XLSX("${fileName}.xlsx",?) FROM ?`, [opts, [data]])
}

function errAjax(data) {
    isLoading(false)
    if (data.status == 503 || data.status == 502) info("Server bị ngắt kết nối , hãy kiểm tra lại mạng của bạn")
    if (data != null && data.status != 503 && data.status != 502) info(data.responseText)
}

function callAPI(method = "GET", url, data, successAjax, errorAjax = errAjax, isFile = false, isLoad = true) {
    var ObjectAjax = {
        type: method,
        url: url,
        headers: {
            token: ACCESS_TOKEN,
        },
        data: data,
        cache: false,
        success: function(data) {
            isLoading(false)
            successAjax(data)
        },
        error: function(data) {
            errorAjax(data)
        },
    }
    if (isFile) {
        ObjectAjax = {
            ...ObjectAjax,
            contentType: false,
            processData: false,
        }
    }

    isLoading(isLoad)
    $.ajax(ObjectAjax)
}

function totalMoney(price = 0, vat = 0, ck = 0, discount = 0, number = 1) {
    return (tryParseInt(price) + (tryParseInt(price) / 100) * tryParseInt(vat) - (tryParseInt(price) / 100) * tryParseInt(ck) - tryParseInt(discount)) * tryParseInt(number)
}

function newPage(link) {
    const a = document.createElement("a")
    a.setAttribute("href", link)
    a.setAttribute("target", `_blank`)
    a.click()
}
var mangso = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]

function dochangchuc(so, daydu) {
    var chuoi = ""
    chuc = Math.floor(so / 10)
    donvi = so % 10
    if (chuc > 1) {
        chuoi = " " + mangso[chuc] + " mươi"
        if (donvi == 1) {
            chuoi += " mốt"
        }
    } else if (chuc == 1) {
        chuoi = " mười"
        if (donvi == 1) {
            chuoi += " một"
        }
    } else if (daydu && donvi > 0) {
        chuoi = " lẻ"
    }
    if (donvi == 5 && chuc > 1) {
        chuoi += " lăm"
    } else if (donvi > 1 || (donvi == 1 && chuc == 0)) {
        chuoi += " " + mangso[donvi]
    }
    return chuoi
}

function docblock(so, daydu) {
    var chuoi = ""
    tram = Math.floor(so / 100)
    so = so % 100
    if (daydu || tram > 0) {
        chuoi = " " + mangso[tram] + " trăm"
        chuoi += dochangchuc(so, true)
    } else {
        chuoi = dochangchuc(so, false)
    }
    return chuoi
}

function dochangtrieu(so, daydu) {
    var chuoi = ""
    trieu = Math.floor(so / 1000000)
    so = so % 1000000
    if (trieu > 0) {
        chuoi = docblock(trieu, daydu) + " triệu"
        daydu = true
    }
    nghin = Math.floor(so / 1000)
    so = so % 1000
    if (nghin > 0) {
        chuoi += docblock(nghin, daydu) + " nghìn"
        daydu = true
    }
    if (so > 0) {
        chuoi += docblock(so, daydu)
    }
    return chuoi
}

function tranfer_number_to_text(so) {
    if (so == 0) return mangso[0]
    var chuoi = "",
        hauto = ""
    do {
        ty = so % 1000000000
        so = Math.floor(so / 1000000000)
        if (so > 0) {
            chuoi = dochangtrieu(ty, true) + hauto + chuoi
        } else {
            chuoi = dochangtrieu(ty, false) + hauto + chuoi
        }
        hauto = " tỷ"
    } while (so > 0)
    chuoi = chuoi.trim()
    return chuoi.charAt(0).toUpperCase() + chuoi.slice(1)
}

function calculateMoneyExport(data) {
    let total = 0
    if (Array.isArray(data)) {
        data.map((product) => {
            total += totalMoney(product.product_export_price, product.product_vat, product.product_ck, product.product_discount, product.product_quantity)
        })
    } else {
        total += totalMoney(data.product_export_price, data.product_vat, data.product_ck, data.product_discount, data.product_quantity)
    }

    return total
}

function calculateMoneyImport(data) {
    let total = 0
    if (Array.isArray(data)) {
        data.map((product) => {
            total += totalMoney(product.product_import_price, product.product_vat, product.product_ck, product.product_discount, product.product_quantity)
        })
    } else {
        total += totalMoney(data.product_import_price, data.product_vat, data.product_ck, data.product_discount, data.product_quantity)
    }
    return total
}

function calculateDebt(data) {
    let total = 0
    if (Array.isArray(data)) {
        data.map((debt) => {
            total += tryParseInt(debt.debt_money_export) - tryParseInt(debt.debt_money_receive) - (tryParseInt(debt.debt_money_import) - tryParseInt(debt.debt_money_payment))
        })
    } else {
        total += tryParseInt(data.debt_money_export) - tryParseInt(data.debt_money_receive) - (tryParseInt(data.debt_money_import) - tryParseInt(data.debt_money_payment))
    }
    return total
}

function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
}

function findSupplier() {
    id_user = null
    const type = event.type
    const div = $("#div_find_supplier")

    const input = $(div).find("input")[0]
    const divLoading = $(div).find(".spinner-border")[0]
    const div_show = $(div).find("div")[1]
    if (type == "input") pageSupplier = 1
    if (type == "scroll") pageSupplier++
        $(input).attr("name", null)

    const key = $(input).val().trim()
    if (key.length == 0) {
        $(divLoading).hide()
        $(div_show).empty()
        return
    }

    if ($(input).val().trim().length > 0) {
        $(divLoading).show()
        callAPI(
            "GET",
            `${API_USER}/findOther?`, {
                key: key,
                limit: 10,
                page: pageSupplier,
            },
            (users) => {
                $(divLoading).hide()
                if (type == "input") {
                    $(div_show).empty()
                    arrSupplier = []
                }

                users.map((user) => {
                    $(div_show).append(`
                    <li><a href="javascript:void(0)" onclick="selectSupplier(${arrSupplier.length})" >Tên: ${user.user_fullname} - SĐT: ${user.user_phone}</a></li>
                `)
                    arrSupplier.push(user)
                })
            },
            undefined,
            undefined,
            false
        )
    } else {
        $(div_show).empty()
    }
}

function loadmoreSupplier() {
    const div = $(event.target)
    if ($(div).scrollTop() + $(div).innerHeight() >= $(div)[0].scrollHeight) {
        findSupplier()
    }
}

function excelToJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const data = e.target.result
            const wb = XLSX.read(data, { type: "binary" })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const dataJSON = XLSX.utils.sheet_to_json(ws)
            resolve(dataJSON)
        }
        reader.onerror = (e) => {
            reject(e)
        }
        reader.readAsBinaryString(file.files[0])
    })
}

function findSubCategory(isMore = false, success = success_get_subcategory) {
    const parent = $(event.target).parent()
    const input = $(parent).find("input")
    const loading = $(parent).find(".spinner-border")
    $(loading).show()
    if (!isMore) {
        offsetSubcategory = 0
    }
    $(input).attr("name", null)


    const key = $(input).val().trim()
    if (key.length == 0) {
        $(loading).hide()
        $(parent).find("div:last-child").empty()
        return
    }

    callAPI(
        "GET",
        `${API_SUBCATEGORY}/client?`, {
            key: key,
            limit: 10,
            page: offsetSubcategory,
        },
        (data) => {
            $(loading).hide()
            if (!isMore) {
                arrSubCategory = []
                $(parent).find("div:last-child").empty()
            }
            success(data, parent)
        },
        (err) => {
            $(loading).hide()
            errAjax(err)
        },
        false,
        false
    )
}

function loadmoreSubCategory(success = success_get_subcategory) {
    const div = $(event.target)
    if ($(div).scrollTop() + $(div).innerHeight() >= $(div)[0].scrollHeight) {
        offsetSubcategory += 10
        findSubCategory(true, success)
    }
}

function find_id_product_callback(call_back, error_data = errAjax) {
    if (event.which == 13) {
        const element = $(event.target)
        const parent = $(element).parent()
        const input = $(parent).find("input")
        const div_loading = $(parent).find(".spinner-border")
        $(div_loading).show()
        $(div_loading).show()
        callAPI(
            "GET",
            API_PRODUCT, {
                key: $(input).val(),
            },
            (data) => {
                $(div_loading).hide()
                call_back(data, element)
            },
            (err) => {
                $(div_loading).hide()
                error_data(err)
            }
        )
    }
}

function find_customer_callback(success = success_get_customer, isMore = false) {
    const parent = $(event.target).parent()
    const input = $(parent).find("input")
    const loading = $(parent).find(".spinner-border")
    $(loading).show()
    if (!isMore) {
        pageSupplier = 0
    }
    $(input).attr("name", null)
    callAPI(
        "GET",
        `${API_USER}/findOther?`, {
            key: $(input).val(),
            limit: 10,
            page: pageSupplier,
        },
        (data) => {
            $(loading).hide()
            if (!isMore) {
                arrSupplier = []
                $(parent).find("div:last-child").empty()
            }
            success(data, parent)
        },
        (err) => {
            $(loading).hide()
            errAjax(err)
        },
        false,
        false
    )
}

function loadmore_customer(success = success_get_customer) {
    const div = $(event.target)
    if ($(div).scrollTop() + $(div).innerHeight() >= $(div)[0].scrollHeight) {
        pageSupplier += 10
        find_customer_callback(success, true)
    }
}
