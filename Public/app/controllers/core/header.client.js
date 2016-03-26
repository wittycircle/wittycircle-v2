/*** HEADER SCRIPT DOM ***/

	var filter = $("#page-wrap");
	var x = $(window).height();
	var marge = (x - 551)/2/2;

    $(document).ready(function(){
        $('#switchToS').click(function() {
            var x = $('#main-login-modal');
            var y = $("#main-signup-modal")
            if (x.css('display') === "block") {
                y.css({'top': marge.toString() + "px"});
                y.fadeIn();
                x.fadeOut();
            }
        });

        $('#switchToL').click(function() {
            var x = $('#main-signup-modal');
            var y = $("#main-login-modal");
            if (x.css('display') === "block") {
                y.css({'top': marge.toString() + "px"});
                y.fadeIn();
                x.fadeOut();
            }
        });

    });

    $(document).mouseup(function (e) {
        var container = $("#main-login-modal");
        var container2 = $("#main-signup-modal");

        if (e.target.id === "mologin" || e.target.id === "closeCrossL" || container.is(e.target) || container.has(e.target).length || container.css('display') === "block") {
            if ((!container.is(e.target) && !container.has(e.target).length && e.target.id !== "mologin") || e.target.id === "closeCrossL") {
                filter.fadeOut(500);
                container.animate({top: '-700px'}, 400, function() {
                    container.hide(100, function() {
                        container.css({'top': marge.toString() + "px"});
                    });
                });
            } else {
                filter.fadeIn(300);
                container.css({'top': marge.toString() + "px"});
                container.fadeIn();
            }
        }
        if (e.target.id === "mosignup" || e.target.id === "closeCrossS" || container2.is(e.target) || container2.has(e.target).length || container2.css('display') === "block") {
            if ((!container2.is(e.target) && !container2.has(e.target).length && e.target.id !== "mosignup") || e.target.id === "closeCrossS") {
                filter.fadeOut(500);
                container2.animate({top: '-700px'}, 400, function() {
                    container2.hide(100, function() {
                        container2.css({'top': marge.toString() + "px"});
                    });
                });
            } else {
                filter.fadeIn(300);
                container2.css({'top': marge.toString() + "px"});
                container2.fadeIn();
            }
        }
    });

    window.onclick = function(e) {

    /*** ----- section header ----- ***/
    var container = document.getElementById('header-section');
        if (container) {
            if (e.target.id === "hlo" && document.getElementById('hdmenu').style.display === "none") {
                document.getElementById('c-img').style.transform = "rotate(180deg)";
                document.getElementById('hdmenu').style.display = "block";
            } else {
                document.getElementById('c-img').style.transform = "rotate(0)";
                document.getElementById('hdmenu').style.display = "none";
            }

        /*** ----- section modal log ----- ***/
            // if (e.target.id === "mologin" && document.getElementById('main-login-modal')) {
            //  if (document.getElementById('main-login-modal').style.display === "none") {
            //      document.getElementById('main-login-modal').className = "animated fadeIn";
            //      document.getElementById('main-login-modal').style.display = "block";
            //  } else {
            //      document.getElementById('main-login-modal').className = "animated fadeOut";
            //      document.getElementById('main-login-modal').style.display = "none";
            //  }
            // }

        /*** section mailbox ***/
            if ((e.target.id === "hlogm" || e.target.id === "notif-m-i" || e.target.id === "notifMailbox") && document.getElementById('hdropm').style.display === "none") {
                document.getElementById('hdropm').style.display = "block";
            } else {
                document.getElementById('hdropm').style.display = "none";
            }

        /*** section notif ***/
            if ((e.target.id === "hlogn" || e.target.id === "notif-w-i" || e.target.id === "notifBubble" || e.target.id === "hmaar") && document.getElementById('hdropn').style.display === "none") {
                document.getElementById('hdropn').style.display = "block";
            } else {
                document.getElementById('hdropn').style.display = "none";
            }

        /*** ----- section meet ----- ***/
            if (e.target.id == 'msat' && document.getElementById('msdbox2').style.display == "none") {
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

            /*** ------ section message ------ ***/

            if (e.target.id === "mhop" && document.getElementById('mobox')) {
                document.getElementById('mobox').style.display = "block";
                document.getElementById('mhop-i').style.transform = "rotate(180deg)";
            } else {
                if (document.getElementById('mobox')) {
                    document.getElementById('mobox').style.display = "none";
                    document.getElementById('mhop-i').style.transform = "rotate(0)";
                }
            }

            /*** section messaging modal ***/

            // message modal
            if (document.getElementById('messages-newpost-modal') && e.target.id === 'mhn' || e.target.id === 'mmo' || e.target.id === 'mmoinput') {
                document.getElementById('messages-newpost-modal').style.display = "block";
            } else {
                if (document.getElementById('messages-newpost-modal')) {
                    document.getElementById('messages-newpost-modal').style.display = "none";
                    document.getElementById('messages-modal-searchArea').style.display = "block";
                    document.getElementById('messages-modal-newMessageArea').style.display = "none";
                }
            }

            // confirm delete modal
            if (e.target.id === 'mcdm' || e.target.id === 'mcdc' && document.getElementById('messages-confirmDelete-modal')) {
                document.getElementById('messages-confirmDelete-modal').style.display = "block";
            } else {
                if (document.getElementById('messages-confirmDelete-modal'))
                    document.getElementById('messages-confirmDelete-modal').style.display = "none";
            }
        }
    }

    function preventScroll() {
        document.body.style.position = "fixed";
        document.body.style.overflow = "scroll";
    }

    function allowScroll() {
        document.body.style.position = "static";
    }

    /*** Search Field Header ***/

    $('#main-body').on('click', function(e) {
        var container2  = $('#header-findField');
        var container   = $('#iff');
        var val         = $('#iff').val();
        var header      = document.getElementById('header-section');

        if (header) {
            if (val && container.is(e.target)) {
                document.getElementById('header-content').style.backgroundColor = "white";
                document.getElementById('hbp').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-b_ejb1po.svg";
                document.getElementById('hnl').className = "header-nav-list2";
                document.getElementById('hsb').className = "header-searchBar2";
                document.getElementById('notif-w-i').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/waves-icon-b_swhyaz.png";
                document.getElementById('notif-m-i').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/mailbox-icon-b_lbsllf.svg";
                document.getElementById('c-img').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/arrow-down-icon-b_opi301.svg";
                document.getElementsByClassName('header-log-dropdown')[0].style.color = "#999999";
                document.getElementById('header-findField').style.display = "block";
                document.getElementById('hnlog').className = "header-nav-log2";
            } else {
                document.getElementById('header-content').style.backgroundColor = "transparent";
                document.getElementById('hbp').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-w_qtyz0j.svg";
                document.getElementById('hnl').className = "header-nav-list";
                document.getElementById('hsb').className = "header-searchBar";
                document.getElementById('notif-w-i').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/waves-icon-w_wslyzh.png";
                document.getElementById('notif-m-i').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/mailbox-icon-w_sji3lw.png";
                document.getElementById('c-img').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/arrow-down-icon-w_csniet.svg";
                document.getElementsByClassName('header-log-dropdown')[0].style.color = "white";
                document.getElementById('header-findField').style.display = "none";
                document.getElementById('hnlog').className = "header-nav-log";
            }
        }   
    });

    function showFindField() {
        var x = document.getElementById('iff').value;
        if (x) {
            document.getElementById('header-content').style.backgroundColor = "white";
            document.getElementById('hbp').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-b_ejb1po.svg";
            document.getElementById('hnl').className = "header-nav-list2";
            document.getElementById('hsb').className = "header-searchBar2";
            document.getElementById('notif-w-i').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/waves-icon-b_swhyaz.png";
            document.getElementById('notif-m-i').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/mailbox-icon-b_lbsllf.svg";
            document.getElementById('c-img').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/arrow-down-icon-b_opi301.svg";
            document.getElementsByClassName('header-log-dropdown')[0].style.color = "#999999";
            document.getElementById('header-findField').style.display = "block";
            document.getElementById('hnlog').className = "header-nav-log2";
        } else {
            document.getElementById('header-content').style.backgroundColor = "transparent";
            document.getElementById('hbp').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-w_qtyz0j.svg";
            document.getElementById('hnl').className = "header-nav-list";
            document.getElementById('hsb').className = "header-searchBar";
            document.getElementById('notif-w-i').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/waves-icon-w_wslyzh.png";
            document.getElementById('notif-m-i').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/mailbox-icon-w_sji3lw.png";
            document.getElementById('c-img').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/arrow-down-icon-w_csniet.svg";
            document.getElementsByClassName('header-log-dropdown')[0].style.color = "white";
            document.getElementById('header-findField').style.display = "none";
            document.getElementById('hnlog').className = "header-nav-log";
        }
    }
