
exports.convertDate = function(date, callback) { // convert default format date to display date's format

    var d,
    // get day of the week
    WDay            = date.getDay(),

    // get timestamp
    dateNow         = new Date(),
    dateNowParse    = dateNow.getTime(),
    parseDate       = date.getTime(),

    // get second, min, hour and day passed between now and a specific date by getting passed timestamp
    gPS     = (dateNowParse - parseDate) / 1000,
    gPMin   = gPS / 60,
    gPH     = gPMin / 60,
    gPD     = gPH / 24,

    // get date, month, year
    gdate   = date.getDate(),
    gmonth  = date.getMonth() + 1,
    gPM     = gPD / 30,
    gPY     = gPM / 12;

    // all case
    if (gPS >= 0 && gPS <= 10)          {d = "Just now"; callback(d);}
    else if (gPS > 10 && gPS <= 60)     {d = Math.floor(gPS) + " seconds ago"; callback(d);}
    else if (gPMin >= 1 && gPMin < 2)   {d = Math.floor(gPMin) + " minute ago"; callback(d);}
    else if (gPMin >= 2 && gPMin <= 60) {d = Math.floor(gPMin) + " minutes ago"; callback(d);}
    else if (gPH >= 1 && gPH <= 2)      {d = Math.floor(gPH) + "  hour ago"; callback(d);}
    else if (gPH >= 1 && gPH < 24)      {d = Math.floor(gPH) + "  hours ago"; callback(d);}
    else if (gPH >= 1 && gPH < 24)      {d = Math.floor(gPH) + "  hours ago"; callback(d);}
    else if (gPD >= 1 && gPD < 2)       {d = "Yesterday"; callback(d);}
    else if (gPD >= 2 && gPD <= 3)      {d = Math.floor(gPD) + " days ago"; callback(d);}
    else if (gPD > 3 && gPD <= 7)       {if (WDay == 0) {d = "Monday"; callback(d);}
                                         if (WDay == 1) {d = "Tuesday"; callback(d);}
                                         if (WDay == 2) {d = "Wednesday"; callback(d);}
                                         if (WDay == 3) {d = "Thursday"; callback(d);}
                                         if (WDay == 4) {d = "Friday"; callback(d);}
                                         if (WDay == 5) {d = "Saturday"; callback(d);}
                                         if (WDay == 6) {d = "Sunday"; callback(d);} }
    else if (gPD > 7 && gPD <= 30)      {d = gdate + "/" + gmonth; callback(d);}
    else if (gPM >= 1 && gPM < 2)       {d = Math.floor(gPM) + " month ago"; callback (d);}
    else if (gPM >= 2 && gPM <= 12)     {d = Math.floor(gPM) + " months ago"; callback (d);}
    else if (gPY >= 1 && gPY < 2)       {d = Math.floor(gPY) + " year ago"; callback (d);}
    else if (gPY >= 2)                  {d = Math.floor(gPY) + " years ago"; callback (d);}
    else                                {d = date; callback(d);}
};
