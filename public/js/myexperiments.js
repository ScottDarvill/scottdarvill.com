$("#imagesubmit").submit(function (event) {
    event.preventDefault(); //prevent default action 
    var post_url = $(this).attr("action"); //get form action url
    var form_data = new FormData($(this)[0]);

    $.ajax({
        url: post_url,
        data: form_data,
        cache: false,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (response) {
            $("#server").show();
            if (response.textIdentified.length > 0) {
                var responceHTML = '<p>The following text was identified in the image;</p>' +
                    '<table style="width:100%">'

                for (i in response.textIdentified) {
                    responceHTML += '<tr><th>' + (response.textIdentified[i]) + '</th></tr>'
                }
                responceHTML += '</table><br>'
                if (response.potentialLicencePlates != undefined && response.potentialLicencePlates.length > 0) {
                    responceHTML += '<p>Of the identified text we belive ' + response.potentialLicencePlates[0] +
                        ' could be a licence plate '
                    if (response.vehicle != undefined) {
                        responceHTML += 'belonging to a ' + response.vehicle + '</p>'
                    } else {
                        responceHTML += '</p>'
                    }
                }
            } else {
                var responceHTML = '<p>No text was identified in that image.</p>'
            }
            $("#server-results").html(responceHTML);

        },
        error: function (response) {
            $("#server").show();
            $("#server-results").html('<p>' + response.responseJSON.error + '</p>');
        }
    });
});

function readURL(input) {
    $("#server").hide();
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        $('#image-div').show();
        $('#image-div').html('<img id="uploaded-image" src="#" alt="your image"/>');
        reader.onload = function (e) {
            $('#uploaded-image')
                .attr('src', e.target.result)
        };

        reader.readAsDataURL(input.files[0]);
    }
}

$(document).ready(function () {
    $(document).ajaxStart(function () {
        $('#image-div').hide();
        $("#loading").show();
    }).ajaxStop(function () {
        $("#loading").hide();
    });
});

