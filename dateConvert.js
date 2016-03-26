
exports.convertDate = function(date, callback) { // convert default format date to display date's format

    // get day of the week
    var WDay            = date.getDay();

    // get timestamp
    var dateNow         = new Date();
    var dateNowParse    = dateNow.getTime();
    var parseDate       = date.getTime();

    // get second, min, hour and day passed between now and a specific date by getting passed timestamp
    var gPS     = (dateNowParse - parseDate) / 1000;
    var gPMin   = gPS / 60;
    var gPH     = gPMin / 60;
    var gPD     = gPH / 24;

    // get date, month, year
    var gdate   = date.getDate();
    var gmonth  = date.getMonth() + 1;

    // all case
    if (gPS >= 0 && gPS <= 10)          {var d = "Just now"; callback(d);}
    else if (gPS > 10 && gPS <= 60)     {var d = Math.floor(gPS) + " seconds ago"; callback(d);}
    else if (gPMin >= 1 && gPMin <= 60) {var d = Math.floor(gPMin) + " minutes ago"; callback(d);}
    else if (gPH >= 1 && gPH < 24)      {var d = Math.floor(gPH) + "  hour ago"; callback(d);}
    else if (gPD >= 1 && gPD < 2)       {var d = "Yesterday"; callback(d);}
    else if (gPD >= 2 && gPD <= 3)      {var d = Math.floor(gPD) + " days ago"; callback(d);}
    else if (gPD > 3 && gPD <= 7)       {if (WDay == 0) {var d = "Monday"; callback(d);}
                                         if (WDay == 1) {var d = "Tuesday"; callback(d);}
                                         if (WDay == 2) {var d = "Wednesday"; callback(d);}
                                         if (WDay == 3) {var d = "Thursday"; callback(d);}
                                         if (WDay == 4) {var d = "Friday"; callback(d);}
                                         if (WDay == 5) {var d = "Saturday"; callback(d);}
                                         if (WDay == 6) {var d = "Sunday"; callback(d);} }
    else if (gPD > 7 && gPD <= 30)      {var d = gdate + "/" + gmonth; callback(d);}
    else                                {var d = date; callback(d);}
};
