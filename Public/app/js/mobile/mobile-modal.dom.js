/*** MOBILE MODAL ***/
var body        = document.body;

$(document).ready(function(){
    var scmobile    = $('#scmobile'),
        nmcmobile   = $('#nmcmobile'),
        ncmobile    = $('#ncmobile'),
        hsfmobile   = $('#hsfmobile'),
        hmmobile    = $('#hmmobile'),
        hnmobile    = $('#hnmobile');

    //* Search modal
   scmobile.on('click', function() {
        $('#headerCore').show();
        $('#bodyCore').show();
        $('#footerCore').show();
        hsfmobile.hide();
    });

    //* Mail Modal  
    nmcmobile.on('click', function() {
        $('#headerCore').show();
        $('#bodyCore').show();
        $('#footerCore').show();
        hmmobile.hide();
    });

    //* Notif Modal 
    ncmobile.on('click', function() {
        $('#headerCore').show();
        $('#bodyCore').show();
        $('#footerCore').show();
        hnmobile.hide();
    });
});

function BackTo(value) {
	$('#headerCore').show();
    $('#bodyCore').show();
    $('#footerCore').show();
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
	$('#headerCore').show();
    $('#bodyCore').show();
    $('#footerCore').show();
    if (value === "hsf") 
    	$('#hsfmobile').hide();
    else
    	$('#hnmobile').hide();
};