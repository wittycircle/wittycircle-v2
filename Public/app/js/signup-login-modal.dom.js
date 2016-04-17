$(document).ready(function() {

    var y           = $(window).width(),
        x           = $(window).height(),    
        mlogmodal   = $("#main-login-modal"),
        msigmodal   = $("#main-signup-modal"),
        filter      = $("#page-wrap"),
        margeS       = (x - 600)/2/2,
        margeL       = (x - 550)/2/2,
        container   = $(this);

    $(this).on('click', function(e) {
        var eTarget = e.target;

        if (eTarget.id === "mologin" || eTarget.id === "closeCrossL" || eTarget.id === "closeCrossL2" || mlogmodal.is(eTarget) || mlogmodal.has(eTarget).length || mlogmodal.css('display') === "block") {
            if ((!mlogmodal.is(eTarget) && !mlogmodal.has(eTarget).length && eTarget.id !== "mologin") || eTarget.id === "closeCrossL" || eTarget.id === "closeCrossL2") {
                filter.fadeOut(400);
                if (y > 736) {
                    mlogmodal.animate({top: '-700px'}, 400, function() {
                        mlogmodal.hide(100, function() {
                            mlogmodal.css({'top': margeL.toString() + "px"});
                        });
                    });
                } else {
                    $('#headerCore').show();
                    $('#bodyCore').show();
                    $('#footerCore').show();
                    mlogmodal.hide();
                }
            } else {
                if (y > 736) {
                    filter.fadeIn(200);
                    mlogmodal.css({'top': margeL.toString() + "px"});
                    mlogmodal.fadeIn();
                } else {
                    $('#headerCore').hide();
                    $('#bodyCore').hide();
                    $('#footerCore').hide();
                    mlogmodal.fadeIn(100);
                }
            }
        }

        if (eTarget.id === "mosignup" || eTarget.id === "closeCrossS" || eTarget.id === "closeCrossS2" || msigmodal.is(eTarget) || msigmodal.has(eTarget).length || msigmodal.css('display') === "block") {
            if ((!msigmodal.is(eTarget) && !msigmodal.has(eTarget).length && eTarget.id !== "mosignup") || eTarget.id === "closeCrossS" | eTarget.id === "closeCrossS2") {
                filter.fadeOut(500);
                if (y > 736) {
                    msigmodal.animate({top: '-700px'}, 400, function() {
                        msigmodal.hide(100, function() {
                            msigmodal.css({'top': margeS.toString() + "px"});
                        });
                    });
                } else {
                    $('#headerCore').show();
                    $('#bodyCore').show();
                    $('#footerCore').show();
                    msigmodal.hide();
                }
            } else {
                 if (y > 736) {
                    filter.fadeIn(200);
                    msigmodal.css({'top': margeS.toString() + "px"});
                    msigmodal.fadeIn();
                } else {
                    msigmodal.show();
                    $('#headerCore').hide();
                    $('#bodyCore').hide();
                    $('#footerCore').hide();
                }
            }
        }

        // Login modal * Switch to sign up
        if (eTarget.id === "switchToS" && (mlogmodal.css('display') === "block")) {
            msigmodal.css({'top': margeL.toString() + "px"});
            msigmodal.fadeIn();
            mlogmodal.fadeOut();
        }

        // Signup modal * Switch to log in 
        if (eTarget.id === "switchToL" && msigmodal.css('display') === "block") {
            mlogmodal.css({'top': margeS.toString() + "px"});
            mlogmodal.fadeIn();
            msigmodal.fadeOut();
        }

        // Login mobile modal * Close modal
        if (eTarget.id === "closeCrossL2") {
            $('#headerCore').show();
            $('#bodyCore').show();
            $('#footerCore').show();
            container.hide();
        }

        // SignUp mobile modal * Close modal
        if (eTarget.id === "closeCrossS2") {
            $('#headerCore').show();
            $('#bodyCore').show();
            $('#footerCore').show();
            container.hide();
        }
    });

    // Login modal * Enter to go
    $(".login-modal-email").keypress(function(e) {
        if (e.which === 13 || e.keycode === 13) {
            $('.login-modal-footer button').click();
        }
    });

    // Signup modal * Enter to go
    $('.signup-modal-field').keypress(function(e) {
        if (e.which === 13 || e.keycode === 13) {
            $('.signup-modal-button button').click();
        }
    });

});
