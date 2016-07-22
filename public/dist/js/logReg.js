$(document).ready(function() {
    $('input').blur(function(event) {
        let mailFormat = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        let message = "";
        $(this).val();
        if (!$(this).val()) {
            message = $(this).attr("placeholder") + "不能为空!";
        } else if ($(this).attr("id") == "email" &&  !mailFormat.test($(this).val())){
            message = "邮箱格式错误";
        } else if ($(this).attr("type") == "password"){
            if ($(this).val().length < 6) {
                message = "密码不得小于6位!";
            } else if ($(this).attr("id") === "rePassword" && $("#rePassword").val() != $("#password").val()) {
                message = "密码不一致!";
            }
        }
        if (message) {
            $(this).addClass("error");
            $(this).prev().addClass("error");
            $(this).parent().next().css("display", "block").html(message);
            return;
        } else {
            $(this).removeClass("error");
            $(this).prev().removeClass("error");
            $(this).parent().next().css("display", "none").html(message);
        }
    });

    $("#myform button").click(function () {
        console.log(CryptoJS.MD5());
        let flg = true;
        $("#myform input[type!=checkbox]").each(function (index) {
            if (!$(this).val()) {
                flg = false;
            }
        });
        if ($("form input").filter(".error").length > 0 || !flg) {
            $(this).next().css("display", "block").html("信息填写错误!");
        } else if (window.location.href.indexOf("register") > -1 && !$("input[type=checkbox]").is(':checked')) {
            $(this).next().css("display", "block").html("未同意注册守则!");
        } else {
            $(this).parent().next().css("display", "none").html("");
            $("#password").val(CryptoJS.MD5($("#password").val()));
            if (window.location.href.indexOf("register") > -1) {
                $("#rePassword").val(CryptoJS.MD5($("#rePassword").val()));
            }
            document.getElementById('myform').submit();
        }
    });

    $("#captcha").click(function() {
        $("#captcha").attr("src", "register/captcha?t=" + new Date().getTime());
    });
});
