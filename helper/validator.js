//var/www/gmkho/html/helper
import mongoose from "mongoose"
import * as helper from "./helper.js"
export const ObjectId = mongoose.Types.ObjectId
const isDebug = true
//parse time
import * as date_fns from "date-fns"
const start_of_day = date_fns.startOfDay
const end_of_day = date_fns.endOfDay
const start_of_week = date_fns.startOfWeek
const end_of_week = date_fns.endOfWeek
const start_of_month = date_fns.startOfMonth
const start_of_year = date_fns.startOfYear
const compare_asc = date_fns.compareAsc //so sánh nếu ngày 1 < ngày 2 => return -1
const format_ISO = date_fns.formatISO
//id function
import sanitize from "mongo-sanitize"
import { unlink } from "fs/promises"
//
import admin from "firebase-admin"
const maxNumber = 10000000000
const minNumber = -10000000000
const maxLength = 10000
const limit_query = 100
//
const FIXED_LIMIT = 40
export const DEFAULT_LIMIT = 100
//#region check validate
export const ARRAY_STATUS_EXPORT = ["Chờ xác nhận","Đã xuất kho","Chờ lắp đặt" ,"Đang lắp đặt", "Đã lắp đặt xong","Chờ giao hàng" ,"Đang giao hàng", "Hoàn thành"]
export const ARRAY_STATUS_ORDER = ["Chờ xác nhận","Chờ lấy hàng", "Đang giao hàng", "Hoàn thành","Đã hủy"]

export const TYPE_IMPORT_WARRANTY = "Nhập bảo hành"
export const TYPE_IMPORT_RETURN = "Nhập hàng khách trả lại"
export const TYPE_IMPORT_BORROWING = 'Nhập hàng mượn kho'
export const TYPE_EXPORT_BORROWING = 'Xuất hàng mượn kho'
export const TYPE_EXPORT_WARRANTY = "Xuất bảo hành"
export const TYPE_EXPORT = "Xuất hàng để bán"
export const TYPE_EXPORT_CHANGE_WAREHOUSE = "Xuất đổi kho"
export const TYPE_EXPORT_SEPARATION = "Xuất bóc tách"
export const TYPE_EXPORT_EXTERNAL_REPAIR_SERVICE = "Xuất hàng dịch vụ sửa chữa ngoài"
export const TYPE_IMPORT_SEPARATION = "Nhập bóc tách"
export const TYPE_IMPORT_CHANGE_WAREHOUSE = "Nhập đổi kho"
export const TYPE_IMPORT_EXTERNAL_REPAIR_SERVICE = "Nhập hàng dịch vụ sửa chữa ngoài"
//limit - page
export const URL_IMAGE_CATEGORY = "public/images/images_category"
export const URL_IMAGE_EMPLOYEE = "public/images/images_employee"
export const URL_IMAGE_PRODUCT = "public/images/images_product"
export const URL_IMAGE_PROMOTION = "public/images/images_promotion"
export const URL_IMAGE_NEWS = "public/images/images_news"
export const URL_IMAGE_MENU = "public/images/images_menu"
export const URL_IMAGE_WEBSITE_COMPONENT = "public/images/images_website_component"
export const URL_IMAGE_SLIDE = "public/images/images_slide_banner"
//
export const id_website_component_shopweb = `62733731a23200000c005a23`

export const isDefine = function (val) {
    try {
        if (val == undefined || val == `undefined` || val == null || val == `null` || val.toString().length == 0 || typeof val == "undefined" || val.length == 0) return false
        return true
    } catch (err) {
        return false
    }
}

//check empty

const jsonConstructor = {}.constructor
const arrayConstructor = [].constructor
const stringConstructor = "string-test".constructor
export const isNotEmpty = function (val) {
    try {
        if (val == undefined || val == `undefined` || val == null || val == `null` || val.toString().length == 0) return false
        if (val.constructor === jsonConstructor) {
            return isDefineJson(val)
        }
        if (val.constructor === arrayConstructor) {
            return isDefineArray(val)
        }
        if (val.constructor === stringConstructor) {
            return isDefineString(val)
        }
        return true
    } catch (err) {
        return false
    }
}

function isDefineJson(obj) {
    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return true
        }
    }
    return false
}
function isDefineArray(array) {
    if (Array.isArray(array) && array.length) {
        // array exists and is not empty
        return true
    }
    return false
}
function isDefineString(str) {
    if (str == undefined || str == `undefined` || str == null || str == `null` || str == `` || str.length == 0) return false
    return true
}

//valid date
export const isValidDate = (dateObject) => {
    return new Date(dateObject).toString() !== "Invalid Date"
}
//check object id
export const isObjectId = (id) => {
    if (isNotEmpty(id)) {
        return ObjectId.isValid(id)
    } else {
        return false
    }
}
//number

//check boolean
export const isBoolean = function (val) {
    if (typeof val == "boolean") {
        return true
    } else {
        return false
    }
}
//json
export const isJson = (item) => {
    if (isArray(item)) return true

    item = typeof item !== "string" ? JSON.stringify(item) : item

    try {
        item = JSON.parse(item)
    } catch (e) {
        return false
    }

    if (typeof item === "object" && item !== null) {
        return true
    }

    return false
}
//array
function isArray(val) {
    try {
        return Array.isArray(val)
    } catch (e) {
        throwError(e)
        return false
    }
}
//#endregion check validate ===============================================================
//#region log
export const throwError = (e) => {
    if (isDebug && e) {
        console.error(e)
    }
}
export const throwValue = (val) => {
    if (isDebug && val) {
        console.log(val)
    }
}
//#endregion check los ===============================================================
//#region parse
export const tryParseInt = function (str) {
    try {
        return parseInt(str)
    } catch (e) {
        return 0
    }
}

export const tryParseFloat = function (str) {
    try {
        if (!isDefine(str)) return 0
        return parseFloat(str.toString()) || 0
    } catch (e) {
        return 0
    }
}
export const tryParseJson = function (str) {
    try {
        if (!str) return null
        return JSON.parse(str)
    } catch (e) {
        console.log(e)
        return null
    }
}

export const tryParseBoolean = (str) => {
    if (isNotEmpty(str)) {
        switch (str.toLowerCase().trim()) {
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
//#endregion parse ===============================================================
//#region helper
var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
}
function escapeHtml(string) {
    string = string + ""
    if (!isNotEmpty(string)) return ""
    if (string.includes("<script>")) {
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s]
        })
    } else {
        return string
    }
}
function capitalizeFirstLetter(string) {
    if (isDefine(string)) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    } else {
        return null
    }
}

function empty(val) {
    // test results
    //---------------
    // []        true, empty array
    // {}        true, empty object
    // null      true
    // undefined true
    // ""        true, empty string
    // ''        true, empty string
    // 0         false, number
    // true      false, boolean
    // false     false, boolean
    // Date      false
    // function  false

    if (val === undefined) return true

    if (typeof val == "function" || typeof val == "number" || typeof val == "boolean" || Object.prototype.toString.call(val) === "[object Date]") return false

    if (val == null || val.length === 0)
        // null or 0 length array
        return true

    if (typeof val == "object") {
        // empty object

        var r = true

        for (var f in val) r = false

        return r
    }

    return false
}
function setSlug(value) {
    return stringToSlug(value)
}

export const stringToSlug = function (str) {
    // remove accents
// Loại bỏ các điểm nhấn
    if (empty(str)) return null
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

export const stringTextSearch = function (str) {
    // remove accents
    if (empty(str)) return null
    var from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
        to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy"
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(RegExp(from[i], "gi"), to[i])
    }

    str = str.toLowerCase().trim()
    return str
}
//làm tròn số
function decimalAdjust(type, value, exp) {
    try {
        if (!isNotEmpty(value)) return false
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
        return false
    }
}
// Decimal round
export const round2 = (value) => decimalAdjust("round", value, -2)
export const round = (value) => decimalAdjust("round", value, 0)
// Decimal làm tròn xuống
export const floor2 = (value) => decimalAdjust("floor", value, -2)
// Decimal làm tròn lên
export const ceil2 = (value) => decimalAdjust("ceil", value, -2)
export const ceil = (value) => decimalAdjust("ceil", value, 0)

export const toFixed2 = (val) => {
    try {
        if (!isDefine(val)) return false
        return Number.parseFloat(val).toFixed(2)
    } catch (err) {
        throwError(err)
        return false
    }
}
//xuống chữ thường
export const toLowerCase = (str) => {
    return escapeHtml(str).toLocaleLowerCase()
}

export const getOnlyNumber = function (str) {
    var num = str.replace(/[^0-9]/g, "")
    return num
}
//#endregion helper ===============================================================
//#region date time helper

export const tryParseISODate = (dateObject) => {
    if (isValidDate(dateObject)) {
        return new Date(dateObject).toISOString()
    } else {
        return new Date.now.toISOString()
    }
}
export const tryParseUTCDate = (dateObject) => {
    if (isValidDate(dateObject)) {
        return new Date(dateObject).toUTCString()
    } else {
        return new Date.now.toUTCString()
    }
}

export const compareAsc = (date1, date2) => {
    return compare_asc(new Date(date1), new Date(date2))
}
export const startOfDay = (val) => {
    return start_of_day(new Date(val))
}
export const endOfDay = (val) => {
    return end_of_day(new Date(val))
}
export const startOfWeek = (val) => {
    return start_of_week(new Date(val), { weekStartsOn: 1 })
}
export const endOfWeek = (val) => {
    return end_of_week(new Date(val), { weekStartsOn: 1 })
}
export const startOfMonth = (val) => {
    return start_of_month(new Date(val))
}
export const startOfYear = (val) => {
    return start_of_year(new Date(val))
}
export const next_day = (val) => {
    return new Date(new Date(val).setDate(new Date(val).getDate() + 1)).toISOString()
}
function padValue(value) {
    return value < 10 ? "0" + value : value
}
export const time_now = () => {
    const d = new Date()
    return {
        fulltime: `${d.getFullYear()}${padValue(d.getMonth() + 1)}${padValue(d.getDate())}${padValue(d.getHours())}${padValue(d.getMinutes())}${padValue(d.getSeconds())}`,
        sorttime: `${padValue(d.getMonth() + 1)}${padValue(d.getDate())}${padValue(d.getHours())}${padValue(d.getMinutes())}${padValue(d.getSeconds())}`,
    }
}
export const timeString = (time = new Date()) => {
    const current = new Date(time)

    return {
        startOfWeek: addZero(startOfWeek(current).getFullYear()) + "-" + addZero(startOfWeek(current).getMonth() + 1) + "-" + addZero(startOfWeek(current).getDate()),
        fulldate: addZero(current.getFullYear()) + "-" + addZero(current.getMonth() + 1) + "-" + addZero(current.getDate()),
        startOfDay: new Date(current.getFullYear() + "-" + addZero(current.getMonth() + 1) + "-" + addZero(current.getDate()) + " 00:00:00"),
        endOfDay: new Date(current.getFullYear() + "-" + addZero(current.getMonth() + 1) + "-" + addZero(current.getDate()) + " 23:59:59"),
    }
}
// GMT +07:00
export const dateTimeZone = (timezone = "GMT +00:00", date = new Date()) => {
    const time = timezone.replace("UTC", "").replace("GMT", "").replace("GTM", "").trim().split(":")
    const timeZonemHours = tryParseInt(time[0]) * 60
    const timeZoneminutes = tryParseInt(time[0]) < 0 ? -1 * tryParseInt(time[1]) : tryParseInt(time[1])
    const current = date + (timeZonemHours + timeZoneminutes) * 60 * 1000
    const now = new Date(current)
    return {
        currentTime: now,
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
        fullyear: now.getFullYear(),
        month: now.getMonth() + 1,
        date: now.getDate(),
        scheduleNow: { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() },
        startOfDay: new Date(now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + addZero(now.getDate()) + " 00:00:00"),
        endOfDay: new Date(now.getFullYear() + "-" + addZero(now.getMonth() + 1) + "-" + addZero(now.getDate()) + " 23:59:59"),
    }
}
export const query_createdAt = (fromdate, todate) => {
    if (new Date(fromdate) == "Invalid Date" && new Date(fromdate) == "Invalid Date") return {}
    return { $and: [{ createdAt: { $gte: new Date(fromdate + " 00:00:00") } }, { createdAt: { $lte: new Date(todate + " 23:59:59") } }] }
}
export const isChecked = (time) => {
    if (time.hours == 0 && time.minutes == 0 && time.seconds == 0) return false
    return true
}
export const addZero = (number, length = 2) => {
    var my_string = "" + number
    while (my_string.length < length) {
        my_string = "0" + my_string
    }
    return my_string
}
//#endregion date time helper ===============================================================
export const viToEn = function (str) {
    // remove accents
    if (empty(str)) return null
    var from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
        to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy"
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(RegExp(from[i], "gi"), to[i])
    }

    str = str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\-]/g, " ")
        .replace(/-+/g, " ")

    return str
}
//#region schema
function setNumber(num) {
    return tryParseInt(num)
}

function getNumber(num) {
    //return fm.from(num, true);
    return num
}
function setMoneyVi(money) {
    return tryParseInt(money)
}
function getMoneyVi(money) {
    //return fm.from(money, true);
    return money
}
function setMoneyEn(money) {
    return tryParseFloat(money)
}
function getMoneyEn(money) {
    //return fm.from(money, true);
    return money
}
function setMoney(money) {
    return tryParseFloat(money)
}

function getMoney(money) {
    //return fm.from(money, true);
    return money
}
function setJsonObject(json) {
    const results = tryParseJson(json)

    if (isArray(results)) {
        return results
    }

    return null
}

function setJsonArray(json) {
    if (Array.isArray(json)) return json
    return []
}
export const trySanitiza = (str) => {
    return str
}
export const validatorFOAD = {
    runValidators: true,
    new: true,
    returnNewDocument: true,
    returnOriginal: false,
}
export const schemaNumber = {
    type: Number,
    default: 0,
    trim: true,
    min: minNumber,
    max: maxNumber,
    // set: setNumber,
    // get: getNumber,
}
export const schemaMoney = {
    type: Number,
    default: 0,
    trim: true,
    min: 0,
    max: maxNumber,
    set: setMoney,
    get: getMoney,
}
export const schemaMoneyVi = {
    type: Number,
    default: 0,
    trim: true,
    min: 0,
    max: maxNumber,
    set: setMoneyVi,
    get: getMoneyVi,
}
export const schemaMoneyEn = {
    type: Number,
    default: 0,
    trim: true,
    min: 0,
    max: maxNumber,
    set: setMoneyEn,
    get: getMoneyEn,
}
export const schemaMoneyVi_negative = {
    type: Number,
    default: 0,
    trim: true,
    min: minNumber,
    max: maxNumber,
    set: setMoneyVi,
    get: getMoneyVi,
}
export const schemaMoneyEn_negative = {
    type: Number,
    default: 0,
    trim: true,
    min: minNumber,
    max: maxNumber,
    set: setMoneyEn,
    get: getMoneyEn,
}
export const schemaCapitalizeFirstLetter = {
    set: capitalizeFirstLetter,
}
export const schemaString = {
    type: String,
    trim: true,
    default: null,
}

export const schemaObjectId = {
    type: ObjectId,
    trim: true,
    default: null,
    maxLength: maxLength,
    index: true,
}
export const schemaDatetime = {
    type: Date,
    trim: true,
    default: Date.now,
    maxLength: maxLength,
    index: true,
    sparse: true,
}
export const schemaUnique = {
    unique: true,
}
export const schemaRequired = {
    required: true,
}
export const schemaPoint = {
    type: {
        type: String,
        enum: ["Point"],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    },
}

export const schemaJson = {
    type: JSON,
    trim: true,
    default: null,
    maxLength: 10000,
    // set: setJsonObject,
}
export const schemaArray = {
    type: Array,
    default: [],
    maxLength: 10000,
    set: setJsonArray,
}

export const schemaIndex = {
    index: true,
    sparse: true,
}
export const schemaAutoIndex = {
    // đánh inđex
    // autoIndex: true,
    index: true,
    sparse: true,
}

export const schemaBoolean = {
    type: Boolean,
    default: true,
}

export const schemaBooleanFalse = {
    //
    type: Boolean,
    default: false,
}

export const schemaTextIndex = {
    // tìm kiếm text
    text: true,
    sparse: true,
}

export const schemaImmutable = {
    //không thay đổi
    immutable: true,
}
//
export const schemaSlugLink = {
    text: true,
    set: setSlug,
}

export const sortDES = {
    _id: -1,
}

export const schemaSchedule = {
    hours: {
        type: Number,
        required: true,
        min: 0,
        max: 23,
        default: 0,
    },
    minutes: {
        type: Number,
        default: 0,
        min: 0,
        max: 59,
        required: true,
    },
    seconds: {
        type: Number,
        default: 0,
        min: 0,
        max: 59,
        required: true,
    },
}

//#endregion schema ===============================================================

export const schePre = (Schema) => {
    Schema.index({ createdAt: 1 })
    Schema.index({ updatedAt: 1 })

    Schema.pre(["find", "findOne", "findById"], async function (next) {
        this.lean()
        this.sort({ _id: -1 })
        return next()
    })
    Schema.pre(["aggregate"], async function (next) {
        this.sort({ _id: -1 })
        return next()
    })
    Schema.pre(["findOneAndUpdate", "findByIdAndUpdate"], async function (next) {
        this.options.runValidators = true
        this.options.new = true
        this.lean()
        return next()
    })

    Schema.pre(["updateOne", "updateMany"], async function (next) {
        this.options.runValidators = true
        this.options.new = true
        return next()
    })

    // Schema.post(['find'], async function(docs, next) {
    //     return next(docs)
    // })
}

export const isNumber = function (variable, is_different_type = false) {
    if (is_different_type) {
        return !isNaN(variable)
    } else {
        return typeof variable == "number"
    }
}

export const getLimit = (req) => {
    var limit = 10

    if (isDefine(req.query.limit)) {
        limit = parseInt(req.query.limit)
        if (isNaN(limit) || limit < 0) {
            limit = 10
        }
    }
    return limit
}

export const getOffset = (req) => {
    var page = 1
    if (isDefine(req.query.page)) {
        page = parseInt(req.query.page)
        if (isNaN(page) || page <= 0) {
            page = 1
        }

        return (page - 1) * getLimit(req)
    } else if (isDefine(req.query.offset)) {
        return tryParseInt(req.query.offset)
    } else return 0
}

export const removeFile = async (url) => {
    try {
        await unlink(url)
    } catch (e) {}
}

export const totalMoney = (price = 0, vat = 0, ck = 0, discount = 0, number = 1) => {
    return (tryParseInt(price) + (tryParseInt(price) / 100) * tryParseInt(vat) - (tryParseInt(price) / 100) * tryParseInt(ck) - tryParseInt(discount)) * tryParseInt(number)
}

export const calculateMoneyImport = (data) => {
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

export const calculateMoneyExport = (data) => {

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

function escapehtml(s) {
    if (!s) return ""
    return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, "\\$1")
}
export const eshtml = (req) => {
    Object.keys(req.query).map((key) => {
        if (isNaN(parseInt(req.query[key]))) {
            req.query[key] = escapehtml(req.query[key])
        }
    })
}

admin.initializeApp({
    credential: admin.credential.cert({
        type: "service_account",
        project_id: "gaming-market-b77a5",
        private_key_id: "5cb0aad14642a253bc0e7d08c2244bab462a43bc",
        private_key:
            "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC68H95ZN4WRgjh\nSPBdZrrIELgwG6Ry4dbnBhhvlJxQt4xOIJXjO5JoSffz7w+ggiShbNdX5ghsFLjH\nL9Y4dW4S8isAIct0g7TYFshPeQYylm9kYQMAj0/6LbZ05EhEa0al/6v0BuopA6QO\n/XSH51O1buYO76P/Fyy2us+Lp1x4KyNXP1KYh2bL8Il+b9CH4LobLe2YuAI4UQ7O\nALX5TsvmgESLk7FCc+kfnxEeLNZMZ4vsKWq+oC4C48B+LThsEiXIedVtDqbSwRC7\nFw5jtjAL/45w3b9iIisClYX1RIxEhO9yOaaEWYpipiAPd2wtY3vX0JIgO9J8P5bn\n5OIlrnIHAgMBAAECggEAOIlYvDGN20WmFOBW1aCml7A6zE3n39i+glM9G63h0qWY\nWN6RBk6zejf4tf0UiFIj2vBMdmh7Hpjrw04L5zpYpoE4EQuneR8GGB5XyXVMMwt9\nN+oBGu+82+hsWJDb7FlXXgfjjON0eSABQ4lS73E+R055ZIYEXrc3DjKUZ2Of2zWH\nwfvC7hjHwm81yVqOUHMruzEtmrDTP6JqYDvrkFgbo729bi4jnj9CifjGJqvy6wW3\n7Y4ZVsRuI4sbWJb6clVujtMFKbOBxwAuCHnNUmicQWrwBCCqiwbVjgMxCmnKwTdo\nzCB4K1N1uD9M+VGepkGj5SUyymDe2EvaRTsWwj+mVQKBgQDxDD7RmFo9Tp0N0iHC\nyX+Sub57zU/eIMlux+m0Qf5mhJrF2ENTgazds3MZLwznAT/1WWFJ+3h5L7wstELV\niMhHRJ1juLzYgbhHH/m1l1Df8J3dIXNxcKq+ry3QPF7IX0VKXZdcAvL4zDY/hm4B\n0Fy1cmjK5uh67m3Bl4tJl/uexQKBgQDGiQfKI5A1rEafWJRYrogoVpFYUCn74POR\n3AtzFq7YCfq2rDCdcwnFYgqoIJdn5XdBFFCu04XGMnOYaqMYrOazwO0z5hoN/EfW\nDgrpeS+RUa8hgOZ2h22qA6PBWghBSHxoWXdFTzh77nIib+74daCnPuU2RiYjzd+l\nXm/FznkaWwKBgQCucTI09JC5tV6rVdrg4HnWcV2MsrSOCCQ+a6aRsQCuqGBptWxj\nzoCPoQI2w3oO4zSqFhj2NWqmKQmBQKLtbaOjD+Dm/haMiLQXpOhNpkf9CGD2WvL0\nsZifjp8VB9uAHpJCkyCqkefMbd0EdADAh03Qcg+sZxbvgAUmCMngZIDQEQKBgDhL\nbLkFgoOlmNTgEhhfTN5bRZVMDcuNCqOmSFzW5rb9hWi8xIAwuWmNlkX8D9J2/2yl\nrQcVlU4QyjRCsIJzrGr13oyjx2mFynzIuJFhOnqzNbyDR1X+qrrVk15lAAg63IPe\nMnKltvd1MknPgWxUNjyWGfpcw73NR4glkf39wNsXAoGBAOud5q5rswbtxqLonRlh\nmkw0sSym4a/gQtZ1MPnJ5KL/Xeg81+1L8YD53UCAZJFiQdolFiXC0EelpvXHMf6c\n5StX9FVFpYMTkGAB6gTp6CBa6c3g4i6TW7UMdz0Xlwwlbn7yk5Tja3ZblYXu5qzo\nNctX1xQicWqbtjLyXo0s2HPW\n-----END PRIVATE KEY-----\n",
        client_email: "firebase-adminsdk-dkdt3@gaming-market-b77a5.iam.gserviceaccount.com",
        client_id: "114522157134584170862",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dkdt3%40gaming-market-b77a5.iam.gserviceaccount.com",
    }),
})

const dbFirebase = admin.firestore()

export const notifyTopic = (topicName, title, body) => {
    const message = {
        notification: {
            title: title,
            body: body,
        },
        data: {
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            id: "1",
            status: "done",
            sound: "default",
            screen: "Details",
            type: "schedule",
            accept: "ok",
        },
        topic: topicName,
    }

    admin
        .messaging()
        .send(message)
        .then((response) => {
            console.log("Successfully sent message:", response)
        })
        .catch((error) => {
            console.log("Error sending message:", error)
        })
}
export const load_parent_category = (arr, _id, arr_ids = [], arr_child_category = []) => {
    arr.forEach((element) => {
        if (element.id_parent_category && element.id_parent_category.toString() == _id.toString()) {
            arr_ids.push(ObjectId(element._id))
            arr_child_category.push(element)
            load_parent_category(arr, element._id, arr_ids)
        }
    })

    return {
        arr_ids: arr_ids,
        arr_child_category: arr_child_category,
    }
}

export const display_money = (nStr) => {
    nStr = tryParseInt(nStr)
    nStr += ""
    let x = nStr.split(".")
    let x1 = x[0]
    let x2 = x.length > 1 ? "." + x[1] : ""
    var rgx = /(\d+)(\d{3})/
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, "$1" + "." + "$2")
    }
    return x1 + x2 + "₫"
}
var mangso = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]

function dochangchuc(so, daydu) {
    var chuoi = ""
    var chuc = Math.floor(so / 10)
    var donvi = so % 10
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
    var tram = Math.floor(so / 100)
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
    var trieu = Math.floor(so / 1000000)
    so = so % 1000000
    if (trieu > 0) {
        chuoi = docblock(trieu, daydu) + " triệu"
        daydu = true
    }
    var nghin = Math.floor(so / 1000)
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

export const  tranfer_number_to_text = (so) => {
    if (so == 0) return mangso[0]
    var chuoi = "",
        hauto = ""
    do {
       var ty = so % 1000000000
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
