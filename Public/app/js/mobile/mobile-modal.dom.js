/*** MOBILE MODAL ***/
var body        = document.body;

$(document).ready(function(){
    var scmobile    = $('#scmobile'),
        nmcmobile   = $('#nmcmobile'),
        ncmobile    = $('#ncmobile'),
        hsfmobile   = $('#hsfmobile'),
        hmmobile    = $('#hmmobile'),
        hnmobile    = $('#hnmobile'),
        hseeallmm   = $('#hseeallmm'),
        newmnm      = $('#newmnm');

    //* Search modal
    scmobile.on('click', function() {
        $('#body-section').show();
        hsfmobile.hide();
    });

    //* Mail Modal  
    nmcmobile.on('click', function() {
        $('#body-section').show();
        hmmobile.hide();
    });

    //* Notif Modal 
    ncmobile.on('click', function() {
        $('#body-section').show();
        hnmobile.hide();
    });

    //* New message
    newmnm.on('click', function() {
        console.log("OJ");
        console.log($('.new-messages-modal-mobile'));
        $('#nmmmobile').show();
        hmmobile.hide();
    });


    $('#hddownlistm').click(function() {
        classie.remove( document.getElementById('messages-body-messages-mobile'), 'left-to-right-message');
        classie.add( document.getElementById('messages-body-messages-mobile'), 'right-to-left-message');
        $('#messages-body-messages-mobile').show();
        hmmobile.hide();
    });

});

function BackTo(value) {
	$('#body-section').show();
    if (value === "mail")
    	$('#hmmobile').hide();
    else
    	$('#hnmobile').hide();

    classie.toggle( body, 'body-push-right' );
    setTimeout(function() {
    	classie.toggle( body, 'body-push-right' );
    }, 200)
};

function getBack(value) {
	$('#body-section').show();
    if (value === "hsf") 
    	$('#hsfmobile').hide();
    else
    	$('#hnmobile').hide();
};