$(document).ready(function() {
    $('#reMail').click(reSendMail);
});

/**
 * 重新发送邮件按钮事件
 */
function reSendMail(e) {
    let activeCode = $("input[type=hidden]").val();
    if (activeCode && $("#reMail").attr("disabled") != "disabled") {
        $("small").css("display", "none").html("");
        $("#reMail").attr("disabled", "true").html("重新发送(10)");
        let time = 10;
        let job = setInterval(function () {
            $("#reMail").html("重新发送(" + --time + ")");
            if (time == 0) {
                $("#reMail").removeAttr("disabled").html("重新发送");
                clearInterval(job);
            }
        }, 1000);
        $.ajax({
            url: "/register/reMail",
            type: "POST",
            dataType:'json',
            data: {activeCode: activeCode},
            success: function (data) {
                $("small").css("display", "block").html(data.msg);
            }
        });
    }
}
