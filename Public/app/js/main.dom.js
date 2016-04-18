var x = $(window).width();

$(document).ready(function() { 

    if (x > 736) {
        var y,
            mbdown  = $('#mbdown'),
            mbbox   = $('#mbbox'),
            mbb2    = $('.main-body2-body'),
            mbb3    = $('.main-body3-body'),
            dbc     = document.getElementById('dbc'),
            dbp     = document.getElementById('dbp'),
            mbbox2D = document.getElementById('mbbox2'),
            mbdown2 = document.querySelectorAll("#mbdown2 img"),
            apocIT  = document.querySelectorAll("#apoc img"),
            acocIT  = document.querySelectorAll("#acoc img");

        if (screen.height > 1280)
            document.getElementById('hvbg').style.height = "650px";

        $('#main-body-page').on('click', function(e) {

            /*** section shuffler ***/
            // if (e.target.id === "mbdown" && document.getElementById('mbbox').style.display == "none") {
            //   document.getElementById('mbbox').style.display = "block"
            //   document.querySelectorAll("#mbdown img")[0].style.transform = "rotate(-180deg)";
            // } else {
            //     document.getElementById('mbbox').style.display = "none"
            //     document.querySelectorAll("#mbdown img")[0].style.transform = "rotate(0deg)";
            // }
            if (e.target.id === 'mbdown' || mbdown.is(e.target) || mbdown.has(e.target).length) {
                if (mbdown.is(e.target) || mbdown.has(e.target).length)
                    mbbox.toggle();
                else
                    mbbox.toggle();
            } else
                mbbox.hide();

            if (e.target.id === "mbdown2"  && mbbox2D.style.display === "none") {
                mbbox2D.style.display = "block";
                mbdown2[0].style.transform = "rotate(-180deg)";
            } else {
                mbbox2D.style.display = "none";
                mbdown2[0].style.transform = "rotate(0deg)";
            }
            /*** section main page project ***/
            if (e.target.id == 'apoc' && dbp.style.display == "none") {
                dbp.style.display = "block";
                apocIT[0].style.transform = "rotate(-180deg)";
            } else {
                if (dbp) {
                    dbp.style.display = "none";
                    apocIT[0].style.transform = "rotate(0deg)";
                }
            }
            if (e.target.id == 'acoc' && dbc.style.display == "none") {
                dbc.style.display = "inline-block";
                acocIT[0].style.transform = "rotate(-180deg)";
            } else {
                if (dbc) {
                    dbc.style.display = "none";
                    acocIT[0].style.transform = "rotate(0deg)";
                }
            }
        });

        $(this).scroll(function() {
            y = $(this).scrollTop();
            if (mbb2.css('display') !== "none" && y > 400) {
                mbb2.fadeTo("slow", 1);
            }
            if (mbb3.css('display') !== "none" && y > 1000) {
                mbb3.fadeTo("slow", 1);
            }
        });
    } else {

        var val = {};

        $("#searchTextField").focus(function() {
            if ($(this).val()) {
                val.text = $(this).val();
                val.width = Number($(this).width()) + 20;
                $(this).val("");
                $(this).css("width", "200px");
            }
        });

        //** Main slide carousel
        $('.main-body2-body-mobile').slick({
            centerMode: true,
            centerPadding: '60px',
            slidesToShow: 3,
            variableWidth: true,
            mobileFirst: true,
            dots: true,
            nextArrow: "",
            swipeToSlide: true,
            speed: 100,

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
            speed: 100,

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
    }
});

if (x > 736) {
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

    /* Scroll to the top at the beginning */
    // function initPage() {
    //  $(window).scrollTop(0);
    // }; setTimeout(function() {initPage()}, 800);

    function scrollToBf() {
        $('html, body').animate({
            scrollTop: $(".bf-info").offset().top
        }, 500);
    };
}