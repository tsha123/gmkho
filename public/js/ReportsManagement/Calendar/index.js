var arrData = [];
var isGetOther = true;
var dataBranch = null;
function getData()
{
    callAPI('GET', `${API_CALENDAR}?`,{
        fromdate: $("#fromdate").val(),
        isGetOther:isGetOther
    },(data) =>{
        if(isGetOther)
        {
            data.dataEmployee.forEach(employee => {
                $(`select[name=selectEmployee]`).append(`<option value="${employee._id}">${employee.employee_fullname}</option>`)
            });
            dataBranch = data.dataBranch
        }
        isLoading(false);
        drawTable(data.data);
        changeURL(`?fromdate=${$("#fromdate").val()}`)
        isGetOther = false;
    })
 
}



function showPopupAdd()
{
    const date = new Date();
    $("#addTime").val(date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate())
    if(dataBranch)
    {
   
        $("#addInNoon").val(addZero(dataBranch.in_noon_schedule.hours)+":"+addZero(dataBranch.in_noon_schedule.minutes)+":"+addZero(dataBranch.in_noon_schedule.seconds))
        $("#addOutNoon").val(addZero(dataBranch.out_noon_schedule.hours)+":"+addZero(dataBranch.out_noon_schedule.minutes)+":"+addZero(dataBranch.out_noon_schedule.seconds))
        $("#addInNight").val(addZero(dataBranch.in_night_schedule.hours)+":"+addZero(dataBranch.in_night_schedule.minutes)+":"+addZero(dataBranch.in_night_schedule.seconds))
        $("#addOutNight").val(addZero(dataBranch.out_night_schedule.hours)+":"+addZero(dataBranch.out_night_schedule.minutes)+":"+addZero(dataBranch.out_night_schedule.seconds))
    }
    $(".div-flex input[type=checkbox]").prop("checked",true)
    showPopup('popupAdd')
    
}

function changeTimeAdd(type , checkBox)
{
    if(type == 'addnoon')
    {
        if($(checkBox).is(':checked'))
        {
            $("#addInNoon").val(addZero(dataBranch.in_noon_schedule.hours)+":"+addZero(dataBranch.in_noon_schedule.minutes)+":"+addZero(dataBranch.in_noon_schedule.seconds))
            $("#addOutNoon").val(addZero(dataBranch.out_noon_schedule.hours)+":"+addZero(dataBranch.out_noon_schedule.minutes)+":"+addZero(dataBranch.out_noon_schedule.seconds))
        }
        else
        {
            $("#addInNoon").val(null)
            $("#addOutNoon").val(null)
        }
       
    }
    if(type == 'addnight')
    {
        if($(checkBox).is(':checked'))
        {
            $("#addInNight").val(addZero(dataBranch.in_noon_schedule.hours)+":"+addZero(dataBranch.in_noon_schedule.minutes)+":"+addZero(dataBranch.in_noon_schedule.seconds))
            $("#addOutNight").val(addZero(dataBranch.out_noon_schedule.hours)+":"+addZero(dataBranch.out_noon_schedule.minutes)+":"+addZero(dataBranch.out_noon_schedule.seconds))
        }
        else
        {
            $("#addInNight").val(null)
            $("#addOutNight").val(null)
        }
       
    }
}

function confirmAdd()
{
    const str_in_noon = $("#addInNoon").val();
    const str_out_noon = $("#addOutNoon").val();
    const str_in_night = $("#addInNight").val();
    const str_out_night = $("#addOutNight").val();

    if(str_in_noon.length ==0 && str_in_night.length ==0)
    {
        warning("Hãy thiết lập thời gian K cho nhân viên")
        return;
    }
    var in_noon_calendar = {hours:0,minutes:0,seconds:0}
    var out_noon_calendar = {hours:0,minutes:0,seconds:0}
    var in_night_calendar = {hours:0,minutes:0,seconds:0}
    var out_night_calendar = {hours:0,minutes:0,seconds:0}

    if(str_in_noon.length > 0)
    {
        const in_noon = new Date("1999-12-24 "+str_in_noon)
        const out_noon = new Date("1999-12-24 "+str_out_noon)
        in_noon_calendar= {hours:in_noon.getHours(), minutes:in_noon.getMinutes(),seconds:0}
        out_noon_calendar= {hours:out_noon.getHours(), minutes:out_noon.getMinutes(),seconds:0}
    }
    if(str_in_night.length>0)
    {
        const in_night = new Date("1999-12-24 "+str_in_night)
        const out_night = new Date("1999-12-24 "+str_out_night)
        in_night_calendar= {hours:in_night.getHours(), minutes:in_night.getMinutes(),seconds:0}
        out_night_calendar= {hours:out_night.getHours(), minutes:out_night.getMinutes(),seconds:0}
    }
    hidePopup('popupAdd')
    callAPI('POST', `${API_CALENDAR}`,{
        date_calendar: $("#addTime").val(),
        id_employee:$("#addSelectEmployee option:selected").val(),
        in_noon_calendar:in_noon_calendar,
        out_noon_calendar:out_noon_calendar,
        in_night_calendar:in_night_calendar,
        out_night_calendar:out_night_calendar,
    },()=>{
        success("Thành công");
           getData()
    })
    
}

function drawTable(data)
{   
    const day = dayOfWeek($("#fromdate").val())
    var arrNoonMonday = []
    var arrNoonTuesDay = []
    var arrNoonWednesday = []
    var arrNoonThursday = []
    var arrNoonFriday = []
    var arrNoonSaturday = []
    var arrNoonSunday = []

    var arrNightMonday = []
    var arrNightTuesDay = []
    var arrNightWednesday = []
    var arrNightThursday = []
    var arrNightFriday = []
    var arrNightSaturday = []
    var arrNightSunday = []

    let colorMoney = ""
    let colorTuesday = ""
    let colorWedsday = ""
    let colorThurday = ""
    let colorFriday = ""
    let colorStatuday = ""
    let colorSunday = ""

    const currendDate = new Date();
    const fromDate = new Date($("#fromdate").val());

   
    if(sameDay(day.monday,fromDate))
    {
        colorMoney = "red"
    }
    else if(sameDay(day.tuesday,fromDate))
    {
        colorTuesday = "red"
    }
    else if(sameDay(day.wednesday , fromDate)){
        colorWedsday  = "red"
    }
    else if(sameDay(day.thursday , fromDate)){
        colorThurday = "red"
    }
    else if(sameDay(day.friday , fromDate)){
        colorFriday = "red"
    }
    else if(sameDay(day.saturday , fromDate)){
        colorStatuday = "red"
    }
    else if(sameDay(day.sunday , fromDate)){
        colorSunday = "red"
    }
    $("#dataTable").html(`<tr>
    <th colspan="8">Danh sách trực sáng</th>
    </tr>
    <tr>
        <th></th>
        <th style="background-color:${colorMoney}">Thứ 2</th>
        <th style="background-color:${colorTuesday}">Thứ 3</th>
        <th style="background-color:${colorWedsday}">Thứ 4</th>
        <th style="background-color:${colorThurday}">Thứ 5</th>
        <th style="background-color:${colorFriday}">Thứ 6</th>
        <th style="background-color:${colorStatuday}">Thứ 7</th>
        <th style="background-color:${colorSunday}">Chủ nhật</th>
    </tr>`)

    for(let i =0;i<data.length;i++)
    {
       
        const date = new Date(data[i].date_calendar)
        if(sameDay(day.monday , date))
        {
            if(isChecked(data[i].in_noon_calendar) && isChecked(data[i].out_noon_calendar) )
            {
                const stringTime = "Từ "+data[i].in_noon_calendar.hours+"h"+data[i].in_noon_calendar.minutes +" - Đến "+data[i].out_noon_calendar.hours+"h"+data[i].out_noon_calendar.minutes 
                arrNoonMonday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
            if(isChecked(data[i].in_night_calendar) && isChecked(data[i].out_night_calendar) )
            {
                const stringTime = "Từ "+data[i].in_night_calendar.hours+"h"+data[i].in_night_calendar.minutes +" - Đến "+data[i].out_night_calendar.hours+"h"+data[i].out_night_calendar.minutes 
                arrNightMonday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
            
        }
        else if(sameDay(day.tuesday , date))
        {
            if(isChecked(data[i].in_noon_calendar) && isChecked(data[i].out_noon_calendar) )
            {
                const stringTime = "Từ "+data[i].in_noon_calendar.hours+"h"+data[i].in_noon_calendar.minutes +" - Đến "+data[i].out_noon_calendar.hours+"h"+data[i].out_noon_calendar.minutes 
                arrNoonTuesDay.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
            if(isChecked(data[i].in_night_calendar) && isChecked(data[i].out_night_calendar) )
            {
                const stringTime = "Từ "+data[i].in_night_calendar.hours+"h"+data[i].in_night_calendar.minutes +" - Đến "+data[i].out_night_calendar.hours+"h"+data[i].out_night_calendar.minutes 
                arrNightTuesDay.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
        }
        else if(sameDay(day.wednesday , date))
        {
            if(isChecked(data[i].in_noon_calendar) && isChecked(data[i].out_noon_calendar) )
            {
                const stringTime = "Từ "+data[i].in_noon_calendar.hours+"h"+data[i].in_noon_calendar.minutes +" - Đến "+data[i].out_noon_calendar.hours+"h"+data[i].out_noon_calendar.minutes 
                arrNoonWednesday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
            if(isChecked(data[i].in_night_calendar) && isChecked(data[i].out_night_calendar) )
            {
                const stringTime = "Từ "+data[i].in_night_calendar.hours+"h"+data[i].in_night_calendar.minutes +" - Đến "+data[i].out_night_calendar.hours+"h"+data[i].out_night_calendar.minutes 
                arrNightWednesday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
        }
        else if(sameDay(day.thursday , date))
        {
            if(isChecked(data[i].in_noon_calendar) && isChecked(data[i].out_noon_calendar) )
            {
                const stringTime = "Từ "+data[i].in_noon_calendar.hours+"h"+data[i].in_noon_calendar.minutes +" - Đến "+data[i].out_noon_calendar.hours+"h"+data[i].out_noon_calendar.minutes 
                arrNoonThursday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
            if(isChecked(data[i].in_night_calendar) && isChecked(data[i].out_night_calendar) )
            {
                const stringTime = "Từ "+data[i].in_night_calendar.hours+"h"+data[i].in_night_calendar.minutes +" - Đến "+data[i].out_night_calendar.hours+"h"+data[i].out_night_calendar.minutes 
                arrNightThursday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
        }
        else if(sameDay(day.friday , date))
        {
            if(isChecked(data[i].in_noon_calendar) && isChecked(data[i].out_noon_calendar) )
            {
                const stringTime = "Từ "+data[i].in_noon_calendar.hours+"h"+data[i].in_noon_calendar.minutes +" - Đến "+data[i].out_noon_calendar.hours+"h"+data[i].out_noon_calendar.minutes 
                arrNoonFriday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
            if(isChecked(data[i].in_night_calendar) && isChecked(data[i].out_night_calendar) )
            {
                const stringTime = "Từ "+data[i].in_night_calendar.hours+"h"+data[i].in_night_calendar.minutes +" - Đến "+data[i].out_night_calendar.hours+"h"+data[i].out_night_calendar.minutes 
                arrNightFriday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
        }
        else if(sameDay(day.saturday , date))
        {
            if(isChecked(data[i].in_noon_calendar) && isChecked(data[i].out_noon_calendar) )
            {
                const stringTime = "Từ "+data[i].in_noon_calendar.hours+"h"+data[i].in_noon_calendar.minutes +" - Đến "+data[i].out_noon_calendar.hours+"h"+data[i].out_noon_calendar.minutes 
                arrNoonSaturday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
            if(isChecked(data[i].in_night_calendar) && isChecked(data[i].out_night_calendar) )
            {
                const stringTime = "Từ "+data[i].in_night_calendar.hours+"h"+data[i].in_night_calendar.minutes +" - Đến "+data[i].out_night_calendar.hours+"h"+data[i].out_night_calendar.minutes 
                arrNightSaturday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
        }
        else if(sameDay(day.sunday , date))
        {
            if(isChecked(data[i].in_noon_calendar) && isChecked(data[i].out_noon_calendar) )
            {
                const stringTime = "Từ "+data[i].in_noon_calendar.hours+"h"+data[i].in_noon_calendar.minutes +" - Đến "+data[i].out_noon_calendar.hours+"h"+data[i].out_noon_calendar.minutes 
                arrNoonSunday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
            if(isChecked(data[i].in_night_calendar) && isChecked(data[i].out_night_calendar) )
            {
                const stringTime = "Từ "+data[i].in_night_calendar.hours+"h"+data[i].in_night_calendar.minutes +" - Đến "+data[i].out_night_calendar.hours+"h"+data[i].out_night_calendar.minutes 
                arrNightSunday.push({stringTime: stringTime, _id:data[i]._id, employee_fullname: data[i].employee_fullname, employee_phone:data[i].employee_phone })
            }
        }
    }

    let maxNoon = Math.max(arrNoonMonday.length,arrNoonTuesDay.length,arrNoonWednesday.length,arrNoonThursday.length,arrNoonFriday.length,arrNoonSaturday.length,arrNoonSunday.length)
    let maxNight = Math.max(arrNightMonday.length,arrNightTuesDay.length,arrNightWednesday.length,arrNightThursday.length,arrNightFriday.length,arrNightSaturday.length,arrNightSunday.length)



    for(let i = 0;i<maxNoon;i++)
    {
        let html = ''
        if(i==0)
        {
            html += `<td rowspan="${maxNoon}" style="text-align: center">Trực trưa</td>`
        }
        else
        {
            html += '<tr>'
        }
        if(typeof(arrNoonMonday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNoonMonday[i]._id}','Noon')" class="mdi mdi-calendar-remove"></i><label>${arrNoonMonday[i].employee_fullname}</label><br><label>${arrNoonMonday[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNoonTuesDay[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNoonTuesDay[i]._id}','Noon')" class="mdi mdi-calendar-remove"></i><label>${arrNoonTuesDay[i].employee_fullname}</label><br><label>${arrNoonTuesDay[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNoonWednesday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNoonWednesday[i]._id}','Noon')" class="mdi mdi-calendar-remove"></i><label>${arrNoonWednesday[i].employee_fullname}</label><br><label>${arrNoonWednesday[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNoonThursday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNoonThursday[i]._id}','Noon')" class="mdi mdi-calendar-remove"></i><label>${arrNoonThursday[i].employee_fullname}</label><br><label>${arrNoonThursday[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNoonFriday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNoonFriday[i]._id}','Noon')" class="mdi mdi-calendar-remove"></i><label>${arrNoonFriday[i].employee_fullname}</label><br><label>${arrNoonFriday[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNoonSaturday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNoonSaturday[i]._id}','Noon')" class="mdi mdi-calendar-remove"></i><label>${arrNoonSaturday[i].employee_fullname}</label><br><label>${arrNoonSaturday[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNoonSunday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNoonSunday[i]._id}','Noon')" class="mdi mdi-calendar-remove"></i><label>${arrNoonSunday[i].employee_fullname}</label><br><label>${arrNoonSunday[i].stringTime}</label></td>`
        else html += `<td></td>`
        html += '</tr>'
         $("#dataTable").append(html)
    }

    $("#dataTable").append(`<tr><th colspan="8">Danh sách trực tối</th></tr>`)
    for(let i = 0;i<maxNight;i++)
    {
        let html = ''
        if(i==0)
        {
            html += `<td rowspan="${maxNight}" style="text-align: center">Trực tối</td>`
        }
        else
        {
            html += '<tr>'
        }
        if(typeof(arrNightMonday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNightMonday[i]._id}','Night')" class="mdi mdi-calendar-remove"></i><label>${arrNightMonday[i].employee_fullname}</label><br><label>${arrNightMonday[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNightTuesDay[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNightTuesDay[i]._id}','Night')" class="mdi mdi-calendar-remove"></i><label>${arrNightTuesDay[i].employee_fullname}</label><br><label>${arrNightTuesDay[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNightWednesday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNightWednesday[i]._id}','Night')" class="mdi mdi-calendar-remove"></i><label>${arrNightWednesday[i].employee_fullname}</label><br><label>${arrNightWednesday[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNightThursday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNightThursday[i]._id}','Night')" class="mdi mdi-calendar-remove"></i><label>${arrNightThursday[i].employee_fullname}</label><br><label>${arrNightThursday[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNightFriday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNightFriday[i]._id}','Night')" class="mdi mdi-calendar-remove"></i><label>${arrNightFriday[i].employee_fullname}</label><br><label>${arrNightFriday[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNightSaturday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNightSaturday[i]._id}','Night')" class="mdi mdi-calendar-remove"></i><label>${arrNightSaturday[i].employee_fullname}</label><br><label>${arrNightSaturday[i].stringTime}</label></td>`
        else html += `<td></td>`

        if(typeof(arrNightSunday[i]) != 'undefined')
            html += `<td><i onclick="deleteCalendar('${arrNightSunday[i]._id}','Night')" class="mdi mdi-calendar-remove"></i><label>${arrNightSunday[i].employee_fullname}</label><br><label>${arrNightSunday[i].stringTime}</label></td>`
        else html += `<td></td>`
        html += '</tr>'
         $("#dataTable").append(html)
    }
}

function deleteCalendar(id_calendar, type)
{
    $("#btnDelete").attr("onclick",`confirmDelete('${id_calendar}','${type}')`)
    showPopup('popupDelete')
}

function confirmDelete(id_calendar, type)
{
    callAPI('PUT', `${API_CALENDAR}`,{
        id_calendar:id_calendar,
        type:type,
        current: new Date()
    },()=>{
        success("Thành công");
           getData()
    })
 
}