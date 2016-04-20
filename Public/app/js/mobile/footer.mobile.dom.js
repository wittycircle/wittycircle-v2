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