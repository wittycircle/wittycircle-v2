var y           = $(window).width();
    iffCon      = $('#iff'),
    mbody       = $('#main-body'),
    headerCon   = document.getElementById('header-section'),
    hcontent    = document.getElementById('header-content'),
    hdmenu      = document.getElementById('hdmenu'),
    hdropm      = document.getElementById('hdropm'),
    hdropn      = document.getElementById('hdropn'),
    hbp         = document.getElementById('hbp'),
    hnl         = document.getElementById('hnl'),
    hsb         = document.getElementById('hsb'),
    notifWI     = document.getElementById('notif-w-i'),
    notifMI     = document.getElementById('notif-m-i'),
    hlDrop      = document.getElementsByClassName('header-log-dropdown'),
    hff         = document.getElementById('header-findField'),
    hnlog       = document.getElementById('hnlog'),
    cImg        = document.getElementById('c-img'),
    bodypos     = document.body.style.position,
    bodyover    = document.body.style.overflow;

$(document).ready(function() {

    if (y > 736) {
        var messCon     = document.getElementById('messages-body-page');

        window.onclick = function(e) {
            var eTarget     = e.target.id;

            var messCon     = document.getElementById('messages-body-page');

            /* Message DOM variable */
            if (messCon) {
                var mobox       = document.getElementById('mobox'),
                    mhopI       = document.getElementById('mhop-i'),
                    mnmodal     = document.getElementById('messages-newpost-modal'),
                    mmsearch    = document.getElementById('messages-modal-searchArea'),
                    mmnew       = document.getElementById('messages-modal-newMessageArea'),
                    mcdmodal    = document.getElementById('messages-confirmDelete-modal');
            }
            /*** ----- section header ----- ***/
            if (headerCon) {
                if (eTarget === "hlo" && hdmenu.style.display === "none") {
                    cImg.style.transform = "rotate(180deg)";
                    hdmenu.style.display = "block";
                } else {
                    cImg.style.transform = "rotate(0)";
                    hdmenu.style.display = "none";
                }

                /*** ----- section modal log ----- ***/
                // if (eTarget === "mologin" && document.getElementById('main-login-modal')) {
                //  if (document.getElementById('main-login-modal').style.display === "none") {
                //      document.getElementById('main-login-modal').className = "animated fadeIn";
                //      document.getElementById('main-login-modal').style.display = "block";
                //  } else {
                //      document.getElementById('main-login-modal').className = "animated fadeOut";
                //      document.getElementById('main-login-modal').style.display = "none";
                //  }
                // }

                /*** ----- section meet ----- ***/
                if (e.target.id === 'msat' && document.getElementById('msdbox2').style.display === "none") {
                    document.getElementById('msdbox2').style.display = "block";
                    document.querySelectorAll("#msat img")[0].style.transform = "rotate(-180deg)";
                } else {
                    if (document.getElementById('msdbox2')) {
                        document.getElementById('msdbox2').style.display = "none";
                        document.querySelectorAll("#msat img")[0].style.transform = "rotate(0)";
                    }
                }

                //*** add skill ***//
                if ((e.target.id === 'input-msa2' || e.target.id === 'input-msa') && document.getElementById('msabox1').style.display === "none" && document.getElementById('msabox2').style.display === "none") {
                    document.getElementById('msabox1').style.display = "block";
                } else {
                    if (document.getElementById('msabox1'))
                        document.getElementById('msabox1').style.display = "none";
                }

                /*** section mailbox ***/
                if ((eTarget === "hlogm" || eTarget === "notif-m-i" || eTarget === "notifMailbox") && hdropm.style.display === "none") {
                    hdropm.style.display = "block";
                } else {
                    hdropm.style.display = "none";
                }

                /*** section notif ***/
                if ((eTarget === "hlogn" || eTarget === "notif-w-i" || eTarget === "notifBubble" || eTarget === "hmaar") && hdropn.style.display === "none") {
                    hdropn.style.display = "block";
                } else {
                    hdropn.style.display = "none";
                }


                if (messCon) {
                    /*** ------ section message ------ ***/
                    if (eTarget === "mhop" && mobox) {
                        mobox.style.display = "block";
                        mhopI.style.transform = "rotate(180deg)";
                    } else {
                        if (mobox) {
                            mobox.style.display = "none";
                            mhopI.style.transform = "rotate(0)";
                        }
                    }

                    /*** section messaging modal ***/

                    // message modal
                    if (mnmodal && eTarget === 'mhn' || eTarget === 'mmo' || eTarget === 'mmoinput') {
                        mnmodal.style.display = "block";
                    } else {
                        if (mnmodal) {
                            mnmodal.style.display = "none";
                            mmsearch.style.display = "block";
                            mmnew.style.display = "none";
                        }
                    }

                    // confirm delete modal
                    if (eTarget === 'mcdm' || eTarget === 'mcdc' && mcdmodal) {
                        mcdmodal.style.display = "block";
                    } else {
                        if (mcdmodal)
                            mcdmodal.style.display = "none";
                    }
                }
            }
        }

        /*** Search Field Header ***/
        mbody.on('click', function(e) {
            var iffVal      = $('#iff').val();
            if (headerCon) {
                if (iffVal && iffCon.is(e.target)) {
                    hcontent.style.backgroundColor = "white";
                    hbp.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-b_ejb1po.svg";
                    hnl.className = "header-nav-list2";
                    hsb.className = "header-searchBar2";
                    notifWI.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/waves-icon-b_swhyaz.png";
                    notifMI.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/mailbox-icon-b_lbsllf.svg";
                    cImg.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/arrow-down-icon-b_opi301.svg";
                    hlDrop[0].style.color = "#999999";
                    hff.style.display = "block";
                    hnlog.className = "header-nav-log2";
                } else {
                    hcontent.style.backgroundColor = "transparent";
                    hbp.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-w_qtyz0j.svg";
                    hnl.className = "header-nav-list";
                    hsb.className = "header-searchBar";
                    notifWI.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/waves-icon-w_wslyzh.png";
                    notifMI.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/mailbox-icon-w_sji3lw.png";
                    cImg.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/arrow-down-icon-w_csniet.svg";
                    hlDrop[0].style.color = "white";
                    hff.style.display = "none";
                    hnlog.className = "header-nav-log";
                }
            }
        });
    } else {
        var bodyJq          = $( 'body' ),
            hmmobile        = $( '#hmmobile' ),
            hnmobile        = $( '#hnmobile' ),
            hmmenu          = $( '#hmmenu' ),
            loma            = $( '#loma' ),
            lono            = $( '#lono' ),
            hsmobile        = $( '#hsmobile' ),
            hsfmobile       = $( '#hsfmobile' ),
            classTog        = classie.toggle,
            menuRight       = document.getElementById( 'cbp-spmenu-s2' ),
            showRightPush   = document.getElementById( 'showRightPush' ),
            cLogin          = document.getElementById('mologin'),
            cSignUp         = document.getElementById('mosignup'),
            hsfm            = document.getElementById('hsfmobile'),
            body            = document.body;

        function disableOther( button ) {
            if( button !== 'showRightPush' ) {
                classTog( showRightPush, 'disabled' );
            }
        };

        showRightPush.onclick = function() {
            classTog( this, 'active' );
            classTog( body, 'cbp-spmenu-push-toleft' );
            classTog( menuRight, 'cbp-spmenu-open' );
            if (bodyJq.hasClass("cbp-spmenu-push-toleft"))
                bodyJq.css('overflow-y', 'hidden');
            else
                bodyJq.css('overflow-y', 'auto');
            disableOther( 'showRightPush' );
        };

        cLogin.onclick = function() {
            classTog( this, 'active' );
            $('#main-login-modal').show();
            classTog( body, 'cbp-spmenu-push-toleft' );
            classTog( menuRight, 'cbp-spmenu-open' );
            bodyJq.css('overflow-y', 'auto');
            disableOther( 'showRightPush' );
        };

        cSignUp.onclick = function() {
            classTog( this, 'active' );
            $('#main-signup-modal').show();
            classTog( body, 'cbp-spmenu-push-toleft' );
            classTog( menuRight, 'cbp-spmenu-open' );
            bodyJq.css('overflow-y', 'auto');
            disableOther( 'showRightPush' );
        }

        // $( '#cbp-spmenu-s2' ).on("swiperight", function() {
        //     classTog( this, 'active' );
        //     classTog( body, 'cbp-spmenu-push-toleft' );
        //     classTog( menuRight, 'cbp-spmenu-open' );
        //     bodyJq.css('overflow-y', 'auto');
        //     disableOther( 'showRightPush' );
        // });

        hmmenu.on('click', function() {
            classTog( this, 'active' );
            classTog( body, 'cbp-spmenu-push-toleft' );
            classTog( menuRight, 'cbp-spmenu-open' );
            bodyJq.css('overflow-y', 'auto');
            disableOther( 'showRightPush' );
        });

        loma.on('click', function() {
            classTog( this, 'active' );
            classTog( body, 'cbp-spmenu-push-toleft' );
            classTog( menuRight, 'cbp-spmenu-open' );
            bodyJq.css('overflow-y', 'auto');
            disableOther( 'showRightPush' );
            $('#body-section').hide();
            hmmobile.show();
        });

        lono.on('click', function() {
            classTog( this, 'active' );
            classTog( body, 'cbp-spmenu-push-toleft' );
            classTog( menuRight, 'cbp-spmenu-open' );
            bodyJq.css('overflow-y', 'auto');
            disableOther( 'showRightPush' );
            $('#body-section').hide();
            hnmobile.show();
        });

        $( '#hsmobile' ).on('click', function() {
            $('#body-section').hide();
            $( '#hsfmobile' ).show();
        });

         $( '.header-log-aside' ).on('click', function(e) {
            if (e.target.id === "hlogavatar") {
                classTog( body, 'cbp-spmenu-push-toleft' );
                classTog( menuRight, 'cbp-spmenu-open' );
                bodyJq.css('overflow-y', 'auto');
                disableOther( 'showRightPush' );
            }
        });
    }

});

function showFindField() {
    var iffVal      = $('#iff').val();
    if (iffVal) {
        hcontent.style.backgroundColor = "white";
        hbp.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-b_ejb1po.svg";
        hnl.className = "header-nav-list2";
        hsb.className = "header-searchBar2";
        notifWI.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/waves-icon-b_swhyaz.png";
        notifMI.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/mailbox-icon-b_lbsllf.svg";
        cImg.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/arrow-down-icon-b_opi301.svg";
        hlDrop[0].style.color = "#999999";
        hff.style.display = "block";
        hnlog.className = "header-nav-log2";
    } else {
        hcontent.style.backgroundColor = "transparent";
        hbp.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-w_qtyz0j.svg";
        hnl.className = "header-nav-list";
        hsb.className = "header-searchBar";
        notifWI.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/waves-icon-w_wslyzh.png";
        notifMI.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/mailbox-icon-w_sji3lw.png";
        cImg.src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/arrow-down-icon-w_csniet.svg";
        hlDrop[0].style.color = "white";
        hff.style.display = "none";
        hnlog.className = "header-nav-log";
    }
};

function preventScroll() {
    bodypos = "fixed";
    bodyover = "scroll";
};

function allowScroll() {
    bodypos = "static";
};
