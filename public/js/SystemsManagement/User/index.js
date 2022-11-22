
var arrData = []
var arr_excel = []
getData()
function getData(){
  const key = $("#keyFind").val()
  limit = tryParseInt($("#selectLimit option:selected").val())
  callAPI('GET',API_USER,{
    key:key,
    page:page,
    limit:limit
  }, data =>{
    drawTable(data.data);
    pagination(data.count, data.data.length)
    changeURL(`?limit=${limit}&page=${page}&key=${key}`)
  })
}


const drawTable = (data) => {
    arrData = []
    $("#tbodyTable").empty()
    for(let i =0;i<data.length;i++){
      arrData.push(data[i])
      $("#tbodyTable").append(`
          <tr>
                <td>${stt + i}</td>
                <td>${data[i].user_fullname}</td>
                <td>${data[i].user_phone}</td>
                <td>${data[i].user_address}</td>
                <td class="right">${data[i].user_birthday ? (new Date(data[i].user_birthday)).toLocaleDateString() : ''}</td>
                <td>${data[i].user_gender || ''}</td>
                <td>${data[i].user_point}</td>
                <td><button onclick="showPopupEdit(${i})" name="${data[i]._id}" class="btn btn-primary"><i class="mdi mdi-information"></i> Chi tiết</button></td>
          </tr>
      `)
    }

}

function confirmAdd(){
  const inputs = $("#popupAdd input")
  const user_phone = $(inputs[0]).val().trim()
  const user_fullname = $(inputs[1]).val().trim()
  const user_birthday = $(inputs[2]).val().trim()
  const user_gender = $("#popupAdd select option:selected").val()
  const password = $(inputs[3]).val().trim().length > 0 ? sha512($(inputs[3]).val().trim()).toString():null
  const user_email = $(inputs[4]).val().trim()
  const user_address = $(inputs[5]).val().trim()

  if(user_phone.length == 0){
    info("Số điện thoại không được để trống")
    return
  }
  if(user_fullname.length == 0){
    info("Tên khách hàng không được để trống")
    return
  }
  hidePopup('popupAdd')
  callAPI('POST',API_USER, {
    data: JSON.stringify({
      user_phone: user_phone,
      user_fullname:user_fullname,
      user_birthday:user_birthday,
      user_gender:user_gender,
      user_password:password,
      user_email:user_email,
      user_address:user_address
    })
  }, data =>{
    success("Thành công")
    getData()
  })
}

function showPopupEdit(index){
  const inputs = $("#popupEdit input")
  $(inputs).val(null)
  $(inputs[0]).val(arrData[index].user_phone)
  $(inputs[1]).val(arrData[index].user_fullname)
  $(inputs[2]).val(formatDate(arrData[index].user_birthday).fulldate)
  $("#popupEdit select").val(arrData[index].user_gender).change()
  
  $(inputs[4]).val(arrData[index].user_email)
  $(inputs[5]).val(arrData[index].user_address)

  $("#popupEdit .modal-footer button:nth-child(2)").attr("onclick",`confirmEdit(${index})`)
  showPopup('popupEdit')
}

function confirmEdit(index){
  const inputs = $("#popupEdit input")

  const user_phone = $(inputs[0]).val().trim()
  const user_fullname = $(inputs[1]).val().trim()
  const user_birthday = $(inputs[2]).val().trim()
  const user_gender = $("#popupEdit select option:selected").val()
  const password = $(inputs[3]).val().trim().length > 0 ? sha512($(inputs[3]).val().trim()).toString():arrData[index].user_password
  const user_email = $(inputs[4]).val().trim()
  const user_address = $(inputs[5]).val().trim()

  if(user_phone.length == 0){
    info("Số điện thoại không được để trống")
    return
  }
  if(user_fullname.length == 0){
    info("Tên khách hàng không được để trống")
    return
  }
  hidePopup('popupEdit')
  callAPI('PUT',API_USER, {
    data: JSON.stringify({
      user_phone: user_phone,
      user_fullname:user_fullname,
      user_birthday:user_birthday,
      user_gender:user_gender,
      user_password:password,
      user_email:user_email,
      user_address:user_address,
      id_user:arrData[index]._id
    })
  }, data =>{
    success("Thành công")
    getData()
  })
}

function downloadTemplate(){
  const arr_template = [{
    "Số điện thoại":"012345678",
    "Họ và tên":"Phạm Văn A",
    "Địa chỉ":"Số 1 Đường ABC",
    "Ngày sinh":"2022-02-20",
    "Email":"phamvana@gmail.com",
    "Mật khẩu":"1",
    "Giới tính":"Nam/Nữ"
  }]
  downloadExcelLocal(arr_template,"Mẫu excel thêm khách hàng")
}

function showPopupExcel(){
  $("#popupAddExcel .modal-body").html(`
    <table  class="table table-hover">
    <thead>
      <tr>
      <th>Số điện thoại</th>
      <th>Họ và tên</th>
      <th>Địa chỉ</th>
      <th>Ngày sinh</th>
      <th>Email</th>
      <th>Mật khẩu</th>
      <th>Giới tính</th>
      </tr>
    </thead>
    <tbody ></tbody>
  </table>
  `)
  $("#popupAddExcel input[type=file]").val(null)
  arr_excel = []
  showPopup('popupAddExcel',true)
}

function selectFile(){
  $("#popupAddExcel input[type=file]").click()
}

function file_change(input){
  arr_excel = []
  const fileUpload = input

  if (typeof FileReader != "undefined") {
        var reader = new FileReader()

        //For Browsers other than IE.
        if (reader.readAsBinaryString) {
            reader.onload = function (e) {
              drawTable_excel(e.target.result)
            }
            reader.readAsBinaryString(fileUpload.files[0])
        } else {
            //For IE Browser.
            reader.onload = function (e) {
                var data = ""
                var bytes = new Uint8Array(e.target.result)
                for (var i = 0; i < bytes.byteLength; i++) {
                    data += String.fromCharCode(bytes[i])
                }
                drawTable_excel(data)
            }
            reader.readAsArrayBuffer(fileUpload.files[0])
        }
  } else {
        info("Brower không hỗ trợ đọc excel")
  }
}

function drawTable_excel(data){
  const workbook = XLSX.read(data, {
    type: "binary",
  })
  const Sheet = workbook.SheetNames[0]
  const excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[Sheet])
  $("#popupAddExcel .modal-body").html(`
    <table  class="table table-hover">
      <thead>
        <tr>
          <th>Số điện thoại</th>
          <th>Họ và tên</th>
          <th>Địa chỉ</th>
          <th>Ngày sinh</th>
          <th>Email</th>
          <th>Mật khẩu</th>
          <th>Giới tính</th>
        </tr>
      </thead>
    <tbody ></tbody>
  </table>
  `)

  arr_excel = []
  for(let i =0;i<excelRows.length;i++){
    if(excelRows[i]["Số điện thoại"] && excelRows[i]["Họ và tên"] && excelRows[i]["Số điện thoại"] != "012345678"){
      arr_excel.push({
        user_phone:excelRows[i]["Số điện thoại"].trim(),
        user_fullname:excelRows[i]["Họ và tên"]?excelRows[i]["Họ và tên"].trim():"",
        user_address:excelRows[i]["Địa chỉ"]?excelRows[i]["Địa chỉ"].trim():"",
        user_birthday:excelRows[i]["Ngày sinh"]?excelRows[i]["Ngày sinh"].trim():"",
        user_email:excelRows[i]["Email"]?excelRows[i]["Email"].trim():"",
        user_password:excelRows[i]["Mật khẩu"] && excelRows[i]["Mật khẩu"].length > 0 ?sha512(excelRows[i]["Mật khẩu"]):null,
        user_gender:excelRows[i]["Giới tính"] == "Nam" || excelRows[i]["Giới tính"] == "nam"?"Name":"Nữ",
      })
      $("#popupAddExcel .modal-body table tbody").append(`
          <tr>
            <td>${arr_excel[arr_excel.length-1].user_phone}</td>
            <td>${arr_excel[arr_excel.length-1].user_fullname}</td>
            <td>${arr_excel[arr_excel.length-1].user_address}</td>
            <td>${arr_excel[arr_excel.length-1].user_birthday}</td>
            <td>${arr_excel[arr_excel.length-1].user_email}</td>
            <td>${excelRows[arr_excel.length-1]["Mật khẩu"]||""}</td>
            <td>${arr_excel[arr_excel.length-1].user_gender}</td>
          </tr>
      `)
    }
  }
  dataTable2($("#popupAddExcel .modal-body table"))
}

function confirmAddExcel(){
    if(arr_excel.length == 0) {
      info("Hãy nhập ít nhất một sản phẩm")
      return
    }
    hidePopup('popupAddExcel')
    callAPI('POST',`${API_USER}/excel`,{
      arr_excel: JSON.stringify(arr_excel)
    }, () =>{
      success("Thành công")
      getData()
    })
}