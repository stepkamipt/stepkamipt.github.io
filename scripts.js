
$(document).ready(function (){
    var bot_url = '/';

    function SendInfoToServer(info_type, info) {
        $.ajax({
            url: "http://aqueous-fjord-9574.herokuapp.com/",
            jsonp: "callback",
            dataType: "jsonp",
            data: {info_type:info_type,info:info},
            success: function( response ) {
                alert("Отправилось")
            }
        });
    };

    function AskPassword() {
        $.ajax({
            url: "http://aqueous-fjord-9574.herokuapp.com/",
            jsonp: "callback",
            dataType: "jsonp",
            data: {info_type:"askPassword",info:"info"},
            success: function( response ) {
                $('#passwordText').val(response)
            }
        });   
    };

    $('#textButton').on('click', function (e) {
        e.preventDefault();
        SendInfoToServer('text', $('#textText').val() );
    })
    $('#ksButton').on('click', function (e) {
        e.preventDefault();
        SendInfoToServer('ks', $('#ksText').val() );
    })
    $('#parkingButton').on('click', function (e) {
        e.preventDefault();
        SendInfoToServer('parking', $('#parkingText').val() );
    })
    $('#locationButton').on('click', function (e) {
        e.preventDefault();
        SendInfoToServer('location', $('#locationText').val() );
    })
    $('#passwordButton').on('click', function (e) {
        e.preventDefault();
        AskPassword();
    })
})