/**
 * @ngdoc service
 * @name wittyApp.header
 * @description
 * # header
 * Factory in the wittyApp.
 **/
(function () {
      	'use strict';

    angular
        .module('wittyApp')
       	.factory('Header', Header);

   	Header.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
    function Header($http, $cookieStore, $rootScope, $resource, $q) {
        var service = {};

        service.getConvertDate  = getConvertDate;
        service.sortListDesc    = sortListDesc;

        return service;

        function getConvertDate(date) { // convert default format date to display date's format

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
            if (gPS >= 0 && gPS <= 10)          {var d = "Just now"; return d;}
            else if (gPS > 10 && gPS <= 60)     {var d = Math.floor(gPS) + " seconds ago"; return d;}
            else if (gPMin >= 1 && gPMin <= 60) {var d = Math.floor(gPMin) + " minutes ago"; return d;}
            else if (gPH >= 1 && gPH < 24)      {var d = Math.floor(gPH) + "  hour ago"; return d;}
            else if (gPD >= 1 && gPD < 2)       {var d = "Yesterday"; return d;}
            else if (gPD >= 2 && gPD <= 3)      {var d = Math.floor(gPD) + " days ago"; return d;}
            else if (gPD > 3 && gPD <= 7)       {if (WDay == 0) {var d = "Monday"; return d;}
                                                 if (WDay == 1) {var d = "Tuesday"; return d;}
                                                 if (WDay == 2) {var d = "Wednesday"; return d;}
                                                 if (WDay == 3) {var d = "Thursday"; return d;}
                                                 if (WDay == 4) {var d = "Friday"; return d;}
                                                 if (WDay == 5) {var d = "Saturday"; return d;}
                                                 if (WDay == 6) {var d = "Sunday"; return d;} }
            else if (gPD > 7 && gPD <= 30)      {var d = gdate + "/" + gmonth; return d;}
            else                                {var d = date; return d;}
        };

        function sortListDesc(list) {

            var swap;
            var sortlist = list;
            var listdesc = [];
            var i = 0;
            var n = 0;
            while (sortlist[i]) {

                while (n < sortlist.length && sortlist[i].timestamp >= sortlist[n].timestamp)
                    n++;
                if (n == sortlist.length) {
                    n = 0;
                   listdesc.push(sortlist[i]);
                   sortlist.splice(i, 1);
                   i = 0;
                } else {
                    n = 0;
                    i++;
                }
            }
            return listdesc;
        };

    };

})();