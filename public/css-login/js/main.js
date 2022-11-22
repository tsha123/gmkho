
(function ($) {
 
    "use strict";

    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('button').on('click',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                return;
            }
           
        }

        //xử lý đăng nhập ở đây
        const username = $('input[name=username]').val();
        const password = $('input[name=pass]').val();
        const id_branch = $('select option:selected').val()
        if(id_branch == '')
        {
            alert("Hãy chọn chi nhánh");
            return;
        }
        $.ajax({
            type: 'POST',
            url: `../api/login/admin`,
            headers: {},
            data: {
                username:username,
                password:sha512(password),
                id_branch:id_branch
            },
            cache: false,
            success: function (data) {
                setCookie("token",data.token)
                setCookie("employee_fullname",data.employee_fullname)
                setCookie("name_group",data.name_group)
                setCookie("name_branch",$('select option:selected').text())
                window.location = '/'

            },
            error: function (data) {
                
                if(data.status == 503 || data.status == 502) alert("Server bị ngắt kết nối , hãy kiểm tra lại mạng của bạn");
                if(data!= null && data.status != 503 && data.status != 502)
                    alert(data.responseText);
                
            }
          })

        
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
            
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    
$(function() {
    $('select, .select2').each(function() {
        $(this).select2({
            theme: 'bootstrap4',
            width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
            placeholder: $(this).data('placeholder'),
            allowClear: Boolean($(this).data('allow-clear')),
            closeOnSelect: !$(this).attr('multiple'),
        });
    });
});

function setCookie(name, value, days=30) {

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function escape(s) {
    return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, "\\$1");
}

$(document).ready(function(e) {
    
    $('body').keyup(function(e){
        if(e.keyCode == 13)
        {
            $('button').click()
        }
    });

});



})(jQuery);