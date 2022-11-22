getData()
function getData() {
    limit = $("#selectLimit option:selected").val()
    callAPI('GET', API_VOUCHER, {
        key: $("#keyFind").val().trim(),
        fromdate:$("#fromdate").val(),
        todate:$("#todate").val(),
        limit: limit,
        page:page
    }, data => {
        drawTable(data.data)
        pagination(data.count,data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&fromdate=${$("#fromdate").val()}&todate=${$("#todate").val()}`)
    })
}

function changeValueCheckbox() {
    const cbox = $(event.path[0])

    if ($(cbox).is(":checked")) {
        $(cbox).val("true")
        if ($(cbox).attr("id") == "voucher_is_limit_time") {
            $("#popupAdd input[type=datetime-local]").val(null)
            $("#popupAdd input[type=datetime-local]").prop("disabled",false)
        }
        else if($(cbox).attr("id") == "voucher_is_own") {
            $("#voucher_limit_user").val(1)
        }
    }
    else {
        $(cbox).val("false")
        if ($(cbox).attr("id") == "voucher_is_limit_time") {
            $("#popupAdd input[type=datetime-local]").prop("disabled", true)
            $("#popupAdd input[type=datetime-local]").val(null) 
        }
        
    }
}

function confirmAdd() {
    const voucher_type = $("#voucher_type option:selected").val()
    const voucher_value = tryParseInt($("#voucher_value").val())
    const voucher_limit_total = tryParseInt($("#voucher_limit_total").val())
    const voucher_limit_user = tryParseInt($("#voucher_limit_user").val())
    const voucher_time_end = $("#voucher_time_end").val()
    const voucher_time_start = $("#voucher_time_start").val()
    const voucher_is_limit_time = $("#voucher_is_limit_time").val()
    const voucher_is_own = $("#voucher_is_own").val()
    const voucher_description = $("#voucher_description").val()
    const voucher_quantity = tryParseInt($("#voucher_quantity").val())

    if (voucher_is_limit_time === 'true' && (voucher_time_end == '' || voucher_time_start == '')) {
        info("Giới hạn thời gian không phù hợp")
        return
    }
    if (voucher_is_own === 'true' && voucher_limit_user != 1 ) {
        info("Có thể sở hữu chỉ áp dụng số lần = 1")
        return
    }
    if (voucher_quantity < 1) {
        info("Số lượng mã phải lớn hơn 0")
        return
    }
    if (voucher_value < 1) {
        info("Số lượng mã phải lớn hơn 0")
        return
    }
    hidePopup('popupAdd')
    callAPI('POST', API_VOUCHER, {
        voucher_type:voucher_type,
        voucher_value:voucher_value,
        voucher_limit_total:voucher_limit_total,
        voucher_limit_user:voucher_limit_user,
        voucher_time_end:voucher_time_end,
        voucher_time_start:voucher_time_start,
        voucher_is_limit_time:voucher_is_limit_time,
        voucher_is_own:voucher_is_own,
        voucher_quantity: voucher_quantity,
        voucher_description:voucher_description
    }, (datas) => {
        success("Thành công!")
        getData()
        const arrDownload = []
        datas.map(voucher => {
            arrDownload.push({
                "Mã code": voucher.voucher_code,
                "Hình thức giảm giá": $(`#voucher_type option[value=${voucher.voucher_type}]`).text(),
                "Giá trị": voucher.voucher_value,
                "Số lần áp dụng": voucher.voucher_limit_user,
                "Thời gian bắt đầu": voucher.voucher_time_end,
                "Thời gian kết thúc": voucher.voucher_time_start,
                "Mô tả": voucher.voucher_description,
            })
        })
        downloadExcelLocal(arrDownload,"Danh sách mã giảm giá")
    })
}

function findData() {
    if (event.which == 13) {
        getData()
    }
}

function drawTable(data) {
 
    $("#tabodyTable").empty()
    for (let i = 0; i < data.length; i++){
        $("#tabodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i].voucher_code}</td>
                <td>${data[i].voucher_type=="money"?"Khoảng tiền":"%"}</td>
                <td>${ money(data[i].voucher_value)}</td>
                <td>${data[i].voucher_is_limit_time?formatDate(data[i].voucher_time_start).fulldatetime:""}</td>
                <td>${data[i].voucher_is_limit_time? formatDate(data[i].voucher_time_end).fulldatetime:""}</td>
                <td>${data[i].voucher_is_limit_time ? "Có" : "Không"} | ${data[i].voucher_is_own ? "Có" : "Không"}</td>
                <td class="right">${data[i].voucher_limit_user}</td>
                <td>${data[i].voucher_limit_user< 1?"Đã dùng hết":"Chưa dùng"}</td>
            </tr>
        `)
    }
}