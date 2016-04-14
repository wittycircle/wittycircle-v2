    /*** GENERAL VARIABLE ***/
	var filter 	= $("#page-wrap"),
		x 		= $(window).height()


    /*** GENERAL DOCUMENT READY ***/
    $(document).ready(function(){
        var menuRight       = document.getElementById( 'cbp-spmenu-s2' ),
            showRightPush   = document.getElementById( 'showRightPush' ),
            cLogin          = document.getElementById('mologin'),
            cSignUp         = document.getElementById('mosignup'),
            hsfm            = document.getElementById('hsfmobile'),
            body            = document.body;

        // Login modal * Switch to sign up
        $('#switchToS').on('click', function() {
            var x = $('#main-login-modal');
            var y = $("#main-signup-modal")
            if (x.css('display') === "block") {
                y.css({'top': margL.toString() + "px"});
                y.fadeIn();
                x.fadeOut();
            }
        });

        // Signup modal * Switch to log in 
        $('#switchToL').on('click', function() {
            var x = $('#main-signup-modal');
            var y = $("#main-login-modal");
            if (x.css('display') === "block") {
                y.css({'top': margeS.toString() + "px"});
                y.fadeIn();
                x.fadeOut();
            }
        });


        //* Search modal
        $('#scmobile').on('click', function() {
            $('#headerCore').show();
            $('#bodyCore').show();
            $('#footerCore').show();
            $('#hsfmobile').hide();
        });

        //* Mail Modal  
        $('#nmcmobile').on('click', function() {
            $('#headerCore').show();
            $('#bodyCore').show();
            $('#footerCore').show();
            $('#hmmobile').hide();
        });

        //* Notif Modal 
        $('#ncmobile').on('click', function() {
            $('#headerCore').show();
            $('#bodyCore').show();
            $('#footerCore').show();
            $('#hnmobile').hide();
        });

        /*** MOBILE HEADER ***/
        if (x <= 736) {
            setTimeout(function() {
                showRightPush.onclick = function() {
                    classie.toggle( this, 'active' );
                    classie.toggle( body, 'cbp-spmenu-push-toleft' );
                    classie.toggle( menuRight, 'cbp-spmenu-open' );
                    if ($('body').hasClass("cbp-spmenu-push-toleft"))
                        $('body').css('overflow-y', 'hidden');
                    else
                        $('body').css('overflow-y', 'auto');
                    disableOther( 'showRightPush' );
                };

                cLogin.onclick = function() {
                    classie.toggle( this, 'active' );
                    classie.toggle( body, 'cbp-spmenu-push-toleft' );
                    classie.toggle( menuRight, 'cbp-spmenu-open' );
                    $('body').css('overflow-y', 'auto');
                    disableOther( 'showRightPush' );
                };

                cSignUp.onclick = function() {
                    classie.toggle( this, 'active' );
                    classie.toggle( body, 'cbp-spmenu-push-toleft' );
                    classie.toggle( menuRight, 'cbp-spmenu-open' );
                    $('body').css('overflow-y', 'auto');
                    disableOther( 'showRightPush' );
                }

                $( '#cbp-spmenu-s2' ).on("swiperight", function() {
                    classie.toggle( this, 'active' );
                    classie.toggle( body, 'cbp-spmenu-push-toleft' );
                    classie.toggle( menuRight, 'cbp-spmenu-open' );
                    $('body').css('overflow-y', 'auto');
                    disableOther( 'showRightPush' );
                });

                $( '#hmmenu' ).on('click', function() {
                    classie.toggle( this, 'active' );
                    classie.toggle( body, 'cbp-spmenu-push-toleft' );
                    classie.toggle( menuRight, 'cbp-spmenu-open' );
                    $('body').css('overflow-y', 'auto');
                    disableOther( 'showRightPush' );
                });

                $( '#loma' ).on('click', function() {
                    classie.toggle( this, 'active' );
                    classie.toggle( body, 'cbp-spmenu-push-toleft' );
                    classie.toggle( menuRight, 'cbp-spmenu-open' );
                    $('body').css('overflow-y', 'auto');
                    disableOther( 'showRightPush' );
                    $('#headerCore').hide();
                    $('#bodyCore').hide();
                    $('#footerCore').hide();
                    $('#hmmobile').show();
                });

                $( '#lono' ).on('click', function() {
                    classie.toggle( this, 'active' );
                    classie.toggle( body, 'cbp-spmenu-push-toleft' );
                    classie.toggle( menuRight, 'cbp-spmenu-open' );
                    $('body').css('overflow-y', 'auto');
                    disableOther( 'showRightPush' );
                    $('#headerCore').hide();
                    $('#bodyCore').hide();
                    $('#footerCore').hide();
                    $('#hnmobile').show();
                });

                function disableOther( button ) {
                    if( button !== 'showRightPush' ) {
                        classie.toggle( showRightPush, 'disabled' );
                    }
                };
            }, 1000);
        }

        $( '#hsmobile' ).on('click', function() {
            $('#headerCore').hide();
            $('#bodyCore').hide();
            $('#footerCore').hide();
            $('#hsfmobile').show();
        });

        //** Main slide carousel
        /* Get home video bg according to the screen height */

        $('.main-body2-body-mobile').slick({
            centerMode: true,
            centerPadding: '60px',
            slidesToShow: 3,
            variableWidth: true,
            mobileFirst: true,
            dots: true,
            nextArrow: "",
            swipeToSlide: true,

            responsive: [{
                breakpoint: 768,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            }]
        });

        $('.main-body3-body-mobile').slick({
            centerMode: true,
            centerPadding: '60px',
            slidesToShow: 3,
            variableWidth: true,
            mobileFirst: true,
            dots: true,
            nextArrow: "",

            responsive: [{
                breakpoint: 768,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            }]
        });

        /*** FOOTER JS ***/
        $(document).ready(function() {
            var container1  = $("#fta"),
                container2  = $("#fte"),
                container3  = $("#ftm"),
                list1       = $("#ftal"),
                list2       = $("#ftel"),
                list3       = $("#ftml")

            container1.on('click', function() {
                list3.slideUp(200);
                list2.slideUp(200);
                list1.slideToggle(200);
            });

            container2.on('click', function() {
                list3.slideUp(200);
                list1.slideUp(200);
                list2.slideToggle(200);
            });

            container3.on('click', function() {
                list1.slideUp(200);
                list2.slideUp(200);
                list3.slideToggle(200);
            });
        });

    });

	/*** LOGIN MODAL ***/
    $(".login-modal-email").keypress(function(e) {
        if (e.which === 13 || e.keycode === 13) {
            $('.login-modal-footer button').click();
        }
    });

    $(document).mouseup(function (e) {
        var container = $("#main-login-modal"),
            container2 = $("#main-signup-modal"),
            margL,
            margeS = (x - 600)/2/2;

        if (x <= 736)
            margL = -5;
        else
            margL = (x - 550)/2/2;

        if (e.target.id === "mologin" || e.target.id === "closeCrossL" || e.target.id === "closeCrossL2" || container.is(e.target) || container.has(e.target).length || container.css('display') === "block") {
            if ((!container.is(e.target) && !container.has(e.target).length && e.target.id !== "mologin") || e.target.id === "closeCrossL" || e.target.id === "closeCrossL2") {
                filter.fadeOut(400);
                if (x > 736) {
                    container.animate({top: '-700px'}, 400, function() {
                        container.hide(100, function() {
                            container.css({'top': margL.toString() + "px"});
                        });
                    });
                } else {
                    $('#headerCore').show();
                    $('#bodyCore').show();
                    $('#footerCore').show();
                    container.hide();
                }
            } else {
                if (x > 736) {
                    filter.fadeIn(200);
                    container.fadeIn();
                } else {
                    $('#headerCore').hide();
                    $('#bodyCore').hide();
                    $('#footerCore').hide();
                    container.fadeIn(100);
                }
                container.css({'top': margL.toString() + "px"});
            }
        }

    /*** SIGN UP MODAL ***/
        if (x <= 736)
            margeS = -5;

        if (e.target.id === "mosignup" || e.target.id === "closeCrossS" || e.target.id === "closeCrossS2" || container2.is(e.target) || container2.has(e.target).length || container2.css('display') === "block") {
            if ((!container2.is(e.target) && !container2.has(e.target).length && e.target.id !== "mosignup") || e.target.id === "closeCrossS" | e.target.id === "closeCrossS2") {
                filter.fadeOut(500);
                if (x > 736) {
                    container2.animate({top: '-700px'}, 400, function() {
                        container2.hide(100, function() {
                            container2.css({'top': margeS.toString() + "px"});
                        });
                    });
                } else {
                    $('#headerCore').show();
                    $('#bodyCore').show();
                    $('#footerCore').show();
                    container2.hide();
                }
            } else {
                 if (x > 736) {
                    filter.fadeIn(200);
                    container2.fadeIn();
                } else {
                    container2.show();
                    $('#headerCore').hide();
                    $('#bodyCore').hide();
                    $('#footerCore').hide();
                }
                container2.css({'top': margeS.toString() + "px"});
            }
        }
    });

    $('.signup-modal-field').keypress(function(e) {
        if (e.which === 13 || e.keycode === 13) {
            $('.signup-modal-button button').click();
        }
    });

    /*** MOBILE MODAL ***/
    function BackTo(value) {
		var body = document.body;

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

    /*** HEADER SCRIPT DOM ***/
    if (x > 736) {

        setTimeout(function() {
            var xh = screen.height;
            if (xh > 1280) {
                document.getElementById('hvbg').style.height = "650px";
            }

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

    	    /*** Search Field Header ***/

    	    $('#main-body').on('click', function(e) {
    	        var container2  = $('#header-findField'),
    	        	container   = $('#iff'),
    	        	val         = $('#iff').val(),
    	        	header      = document.getElementById('header-section');

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
        }, 2000);
	}

    function preventScroll() {
        document.body.style.position = "fixed";
        document.body.style.overflow = "scroll";
    }

    function allowScroll() {
        document.body.style.position = "static";
    }

    /*** MAIN PAGE JS ***/
    /* Scroll to the top at the beginning */
	// function initPage() {
	// 	$(window).scrollTop(0);
	// }; setTimeout(function() {initPage()}, 800);

	$(document).scroll(function() {
		var y = $(this).scrollTop();
		if ($('.main-body2-body').css('display') !== "none" && y > 400) {
			$('.main-body2-body').fadeTo("slow", 1);
		}
		if ($('.main-body3-body').css('display') !== "none" && y > 1000) {
			$('.main-body3-body').fadeTo("slow", 1);
		}
	});

	function scrollToBf() {
		$('html, body').animate({
			scrollTop: $(".bf-info").offset().top
		}, 500);
	};

	/*** section shuffler ***/
	if (x > 736) {
        setTimeout(function() {
    		$('#main-body-page').click(function(e) {
    			var container = $('#mbdown');
    			if (e.target.id === 'mbdown' || container.is(e.target) || container.has(e.target).length) {
    				if (container.is(e.target) || container.has(e.target).length)
    					$('#mbbox').toggle();
    				else
    					$('#mbbox').toggle();
    			} else
    			$('#mbbox').hide();
    		});


    		function changeInputWidth() {
    			$("#mptitle").css('width', function() {
    				var el = $('<span />', {
    					text : this.value,
    					css  : {left: -9999, position: 'relative', 'font-family': 'FreigLight', 'font-size': '32px'}
    				}).appendTo('body');
    				var w = parseInt(el.css('width').replace(/[^-\d\.]/g, '')) + 30;
    				el.remove();
    				if (w > 179)
    					return w.toString() + "px";
    				else
    					return '179px';
    			});
    		};

    		document.getElementById('main-body-page').onclick = function(e) {
    			
    			/*** section shuffler ***/

    			// if (e.target.id === "mbdown" && document.getElementById('mbbox').style.display == "none") {
    			//   document.getElementById('mbbox').style.display = "block"
    			//   document.querySelectorAll("#mbdown img")[0].style.transform = "rotate(-180deg)";
    			// } else {
    			//     document.getElementById('mbbox').style.display = "none"
    			//     document.querySelectorAll("#mbdown img")[0].style.transform = "rotate(0deg)";
    			// }
    			if (e.target.id === "mbdown2"  && document.getElementById('mbbox2').style.display == "none") {
    				document.getElementById('mbbox2').style.display = "block"
    				document.querySelectorAll("#mbdown2 img")[0].style.transform = "rotate(-180deg)";
    			} else {
    				document.getElementById('mbbox2').style.display = "none"
    				document.querySelectorAll("#mbdown2 img")[0].style.transform = "rotate(0deg)";
    			}
    			/*** section main page project ***/
    			if (e.target.id == 'apoc' && document.getElementById('dbp').style.display == "none") {
    				document.getElementById('dbp').style.display = "block";
    				document.querySelectorAll("#apoc img")[0].style.transform = "rotate(-180deg)";
    			} else {
    				if (document.getElementById('dbp')) {
    					document.getElementById('dbp').style.display = "none";
    					document.querySelectorAll("#apoc img")[0].style.transform = "rotate(0deg)";
    				}
    			}
    			if (e.target.id == 'acoc' && document.getElementById('dbc').style.display == "none") {
    				document.getElementById('dbc').style.display = "inline-block";
    				document.querySelectorAll("#acoc img")[0].style.transform = "rotate(-180deg)";
    			} else {
    				if (document.getElementById('dbc')) {
    					document.getElementById('dbc').style.display = "none";
    					document.querySelectorAll("#acoc img")[0].style.transform = "rotate(0deg)";
    				}
    			}
    		}
        }, 2000);
    }