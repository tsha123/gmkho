let hasGetUser = false;
let employee, assets;
const elementSelectUser = $("select[name=selectUser]");
const elementTable = $("#tbodyTable");


$("#addAssetTime").val(new Date().toISOString().slice(0, 10))

const rerenderEmployee = (data) => {
  employee = data;
  if (!hasGetUser) {
    data.data.forEach(item => {
      elementSelectUser.append(`<option value="${item._id}">${item.employee_fullname}</option>`)
    })
    hasGetUser = true
  }
}
const rerenderTable = (data) => {
  assets = data;
  elementTable.empty()

  data.data.forEach((element, index) => {
    const startAt = new Date(element.asset_time)
    const now = new Date()

    const numOfDayPassed = Math.floor((now - startAt) / (1000 * 60 * 60 * 24))
    const fee = Math.max(
      Math.round(element.asset_price / element.asset_expiry) * Math.round(numOfDayPassed / 30), 0)

    elementTable.append(`
            <tr>
                <td>${index + 1}</td>
                <td>${element.id_asset}</td>
                <td>${element.asset_name}</td>
                <td>${element.asset_position}</td>
                <td class="right">${(new Date(element.asset_time)).toLocaleDateString()}</td>
                <td class="right">${money(element.asset_price)}</td>
                <td class="right">${element.asset_expiry}</td>
                <td class="right">${money(Math.min(fee, element.asset_price))}</td>
                <td class="right">${money(Math.max(element.asset_price - fee, 0))}</td>
                <td>${element.id_employee}</td>
                <td>${element.asset_note}</td>
                <td><button onclick="showPopupEdit(${index})" class="btn btn-primary"><i class="mdi mdi-information"></i> Chi tiết</button></td>
            </tr>`)
    pagination(data.count, data.data.length);
  });
}

const showPopupEdit = (index) => {
  const asset = assets.data[index];
  const user = employee.data.find(ele => ele.employee_fullname === asset.id_employee)
  // console.log("🚀 ~ file: index.js ~ line 52 ~ showPopupEdit ~ users", users)
  // console.log("🚀 ~ file: index.js ~ line 51 ~ showPopupEdit ~ user", user._id)

  $("#selectEditUser").val(user._id).change()
  $("#editAssetTime").val(asset.asset_time.slice(0, 10))
  $("#editAssetExpiry").val(asset.asset_expiry)
  $("#editIdAsset").val(asset.id_asset)
  $("#editAssetName").val(asset.asset_name)
  $("#editAssetPosition").val(asset.asset_position)
  $("#editAssetPrice").val(asset.asset_price)
  $("#editAssetNote").val(asset.asset_note)

  $("#confirmEdit").attr("onclick", `confirmEdit(${index})`)
  showPopup('popupEdit')
}

const getData = async (isLoad = true) => {
  isLoading(isLoad);

  const limit = $("#selectLimit option:selected").val();
  const key = $("#keyFind").val()

  const dataEmployee = {
    limit: 1000,
    page: 1,
    key: '',
  }
  const dataAsset = {
    limit: tryParseInt(limit),
    page: tryParseInt(page),
    key: key,
  }

  try {
    await Promise.all([
      callAPI('GET', `${API_EMPLOYEE}?`, dataEmployee, rerenderEmployee),
      callAPI('GET', `${API_ASSETS}?`, dataAsset, rerenderTable)
    ]);

    // isLoading(false);
  }
  catch (error) {
    isLoading(false);
    if (error.status == 503 || error.status == 502) info("Server bị ngắt kết nối , hãy kiểm tra lại mạng của bạn");
    if (error != null && error.status != 503 && error.status != 502)
      info(error.responseText);
  }
}

const confirmAdd = async () => {
  const id_user = $("#selectUser").val()
  const assetTime = $("#addAssetTime").val()
  const assetExpiry = $("#addAssetExpiry").val()
  const idAsset = $("#addIdAsset").val()
  const assetName = $("#addAssetName").val()
  const assetPosition = $("#addAssetPosition").val()
  const assetPrice = $("#addAssetPrice").val()
  const assetNote = $("#addAssetNote").val()
  if (!idAsset) {
    info("Mã sản phẩm không được để trống")
    return
  }
  if (!assetName) {
    info("Tên sản phẩm không được để trống")
    return
  }
  if (!assetExpiry) {
    info("Hạn sử dụng")
    return
  }
  const data = {
    'asset_name': assetName,
    'asset_position': assetPosition,
    'asset_price': assetPrice,
    'asset_expiry': assetExpiry,
    'asset_note': assetNote,
    'id_employee': id_user,
    'asset_time': assetTime,
    'id_asset': idAsset,
  }

  hidePopup('popupAdd')
  isLoading(true);
  callAPI('POST', `${API_ASSETS}?`, data, () => {
    success("Thêm thành công");
    isLoading(false);
    getData(true);
  })
}

const confirmEdit = async (index) => {
  const id = assets.data[index]._id
  
  const id_user = $("#selectEditUser").val()
  const assetTime = $("#editAssetTime").val()
  const assetExpiry = $("#editAssetExpiry").val()
  const idAsset = $("#editIdAsset").val()
  const assetName = $("#editAssetName").val()
  const assetPosition = $("#editAssetPosition").val()
  const assetPrice = $("#editAssetPrice").val()
  const assetNote = $("#editAssetNote").val()
  if (!assetName) {
    info("Tên sản phẩm không được để trống")
    return
  }
  if (!idAsset) {
    info("Mã sản phẩm không được để trống")
    return
  }
  if (!assetExpiry) {
    info("Hạn sử dụng")
    return
  }
  const data = {
    '_id': id,
    'asset_name': assetName,
    'asset_position': assetPosition,
    'asset_price': assetPrice,
    'asset_expiry': assetExpiry,
    'asset_note': assetNote,
    'id_employee': id_user,
    'asset_time': assetTime,
    'id_asset': idAsset,
  }
  // console.log("🚀 ~ file: index.js ~ line 176 ~ confirmEdit ~ data", data)

  hidePopup('popupEdit')
  isLoading(true);
  callAPI('PUT', `${API_ASSETS}?`, data, () => {
    success("Sửa thành công")
    isLoading(false);
    getData(true);
  })
}

getData(true);