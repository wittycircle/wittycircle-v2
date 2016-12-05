'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:CustomFilter
 * @description
 * # CustomFilter
 * Controller of the wittyApp
 **/

angular.module('wittyApp')
.filter('wittyFilterDiscover', function($timeout, $http) {

	function searchProject(input, searchText, searchPlace) {
		var searchTextSplit, returnArray, count;
		returnArray = [];
		
		if (searchText === "  " && !searchPlace)
			return input;
		if (searchText !== "  ") {
			searchTextSplit = searchText.toLowerCase().split(' ');	
			for (var i = 0; i < searchTextSplit.length; i++) {
				if (searchTextSplit[i] === "projects") {
					searchTextSplit.splice(i, 1);
				}
				if (searchTextSplit[i] === "project") {
					searchTextSplit.splice(i, 1);
				}
				if (searchTextSplit[i] === "any") {
					searchTextSplit.splice(i, 2);
				}
				if (searchTextSplit[i] === "&") {
					searchTextSplit.splice(i - 1, 3, "FV");
				}
				if (searchTextSplit[i] === "")
					searchTextSplit.splice(i, 1);
			}
		} 
		if (searchPlace && searchText === "  ") {
			searchTextSplit = [];
			searchTextSplit.push(searchPlace.toLowerCase());
		} 
		if (searchPlace && searchText !== "  ")
			searchTextSplit.push(searchPlace.toLowerCase());
		var tt = searchTextSplit.indexOf("");
		if (tt >= 0)
			searchTextSplit.splice(tt, 1);

		function getArray(searchTextSplit) {
			if (!x) {
			 	x = 1;
				if (searchTextSplit[0] === "all" && searchTextSplit[1] === "art" && searchTextSplit[2] === "any") {
					return input;
				}
			}
			if (x == 1) {
				if (searchTextSplit[0] === "all") {
					searchTextSplit.splice(0, 1);
				}
			}
			if (!searchTextSplit[0]) {
				return input;
			}
			if (input) {
				for (var x = 0, y = 0, check = 0; x < input.length;) {
					for (var key in input[x]) {
						if (typeof input[x][key] === "string" && key === "category_name" || key === "status")
						{
								var searchKey = input[x][key].toLowerCase().indexOf(searchTextSplit[y]);
								if (searchTextSplit[y] && searchKey !== -1) {
									y++;
									count++;
									check = 1;
									break ;
								} else {
									check = 0;
								}
							// } else
							// 	check = 0;
						}
					}
					if (count === searchTextSplit.length) {
						returnArray.push(input[x]);
						count = 0;
						y = 0;
						x++;
					}
					if (!check) {
						y = 0;
						count = 0;
						x++;
					}
				}
				if (!returnArray[0]) {
					searchTextSplit.pop();
					return getArray(searchTextSplit);
				}
				return returnArray;
			}
		}; 
		return searchTextSplit ? getArray(searchTextSplit) : input;
	};

	return function(input, searchText, searchPlace, searchSkill) {

		if (searchSkill && searchSkill[0]) {
			var projectBySkill = [];
			if (input) {
				for(var y = 0; y < searchSkill.length; y++) {
					for(var x = 0; x < input.length; x++) {
						if (input[x].id === searchSkill[y]) {
							projectBySkill.push(input[x]);
							break ;
						}
					}
				}
			}
			return searchText === "  " ? projectBySkill : searchProject(projectBySkill, searchText, searchPlace);
		} else {
			return searchProject(input, searchText, searchPlace);
		}
	}
})
// .filter('wittyFilterM', function($timeout) {

// 		var x = 0;
// 		function searchUser(input, searchText) {
// 			var searchTextSplit = searchText.toLowerCase().split(' ');
// 			var returnArray = [];
// 			var textLen = searchTextSplit.length;

// 			if (searchTextSplit[0] === "anything" && searchTextSplit[1] || searchTextSplit[2])
// 				searchTextSplit.splice(0, 1);

// 			function getArray(searchTextSplit) {
// 				var count = 0;
// 				if (!x) {
// 				 	x = 1;
// 					if (!searchTextSplit[0]) {
// 						return input;
// 					}
// 				}
// 				if (input) {
// 					var inputLen = input.length;
// 					for (var x = 0, y = 0, check = 0; x < inputLen;) {
// 						for (var key in input[x]) {
// 							if (isNaN(input[x][key]))
// 							{
// 								if (key === "about" || key === "description" || key === "location_city" || key === "location_country" || key === "location_state") {
// 									var searchKey = input[x][key].toLowerCase().indexOf(searchTextSplit[y]);
// 									if (searchTextSplit[y] && searchKey !== -1) {
// 										y++;
// 										count++;
// 										check = 1;
// 										break;
// 									} else {
// 										check = 0;
// 									}
// 								} else
// 									check = 0;
// 							}
// 						}
// 						if (count === searchTextSplit.length) {
// 							returnArray.push(input[x]);
// 							count = 0;
// 							y = 0;
// 							x++;
// 						}
// 						if (!check) {
// 							y = 0;
// 							count = 0;
// 							x++;
// 						}
// 					}
// 					if (!returnArray[0]) {
// 						searchTextSplit.pop();
// 						return getArray(searchTextSplit);
// 					}
// 					return returnArray;
// 				}
// 			}
// 			return getArray(searchTextSplit);
// 		};

// 		return function(input, searchText, searchSkill) {

// 			if (searchSkill && searchSkill[0]) {
// 				var UserBySkill = [];
// 				if (input) {
// 					for(var y = 0; y < searchSkill.length; y++) {
// 						for(var x = 0; x < input.length; x++) {
// 							if (input[x].user_id === searchSkill[y]) {
// 								UserBySkill.push(input[x]);
// 								break ;
// 							}
// 						}
// 					}
// 				}
// 				return searchText === "  " ? UserBySkill : searchUser(UserBySkill, searchText);
// 			} else
// 				return searchUser(input, searchText);
// 		}
// })
.filter('wittyDateFilter', function() {

		return function(input) { // convert default format date to display date's format

			var date, WDay, gdate, gmonth, dateNow, dateNowParse, gPS, gPMin, gPH, gPD, gPM, gPY, d;
			if (!input)
				input = new Date();
			date 		= new Date(input);
			dateNow     = new Date();
			// get day of the week, month and year
			WDay    = date.getDay();
			gdate   = date.getDate();
			gmonth  = date.getMonth() + 1;

			// get timestamp
			dateNowParse    = dateNow.getTime();
			
			// parseDate       = date.getTime();

			// get second, min, hour and day passed between now and a specific date by getting passed timestamp
			gPS     = (dateNowParse - Date.parse(input)) / 1000;
			gPMin   = gPS / 60;
			gPH     = gPMin / 60;
			gPD     = gPH / 24;
			gPM 	= gPD / 30;
			gPY		= gPM / 12;

			// get date, month, year

			// all case
			if (gPS >= 0 && gPS <= 10)          {d = "Just now"; return (d);}
			else if (gPS > 10 && gPS <= 60)     {d = Math.floor(gPS) + " seconds ago"; return (d);}
			else if (gPMin >= 1 && gPMin < 2)	{d = Math.floor(gPMin) + " minute ago"; return (d);}
			else if (gPMin >= 2 && gPMin <= 60) {d = Math.floor(gPMin) + " minutes ago"; return (d);}
			else if (gPH >= 1 && gPH <= 2)      {d = Math.floor(gPH) + "  hour ago"; return (d);}
			else if (gPH >= 1 && gPH < 24)      {d = Math.floor(gPH) + "  hours ago"; return (d);}
			else if (gPD >= 1 && gPD < 2)       {d = "Yesterday"; return (d);}
			else if (gPD >= 2 && gPD <= 3)      {d = Math.floor(gPD) + " days ago"; return (d);}
			else if (gPD > 3 && gPD <= 7)   	{	if (WDay == 0) {d = "Monday"; return (d);}
					                                if (WDay == 1) {d = "Tuesday"; return (d);}
					                                if (WDay == 2) {d = "Wednesday"; return (d);}
					                                if (WDay == 3) {d = "Thursday"; return (d);}
					                                if (WDay == 4) {d = "Friday"; return (d);}
					                                if (WDay == 5) {d = "Saturday"; return (d);}
					                                if (WDay == 6) {d = "Sunday"; return (d);} 
				                             	}
			else if (gPD > 7 && gPD <= 31)      {d = gmonth + "/" + gdate; return (d);}
			else if (gPM >= 1 && gPM < 2)      	{d = Math.floor(gPM) + " month ago"; return (d);}
			else if (gPM >= 2 && gPM <= 12)     {d = Math.floor(gPM) + " months ago"; return (d);}
			else if (gPY >= 1 && gPY < 2)      	{d = Math.floor(gPY) + " year ago"; return (d);}
			else if (gPY >= 2)      			{d = Math.floor(gPY) + " years ago"; return (d);}
			else                                {d = date; return (d);}
		}
})
.filter('wittyDateFilterEx', function() {
	return function(input, number) {
		if (input.toLowerCase() === "present")
			return input;

		var date 	= new Date(input);

		var year 	= date.getFullYear();
		var month 	= date.getMonth();
		var day 	= date.getDay();

		// var dayP;
		// if (day === 0) dayP = "Monday";
		// if (day === 1) dayP = "Tuesday";
		// if (day === 2) dayP = "Wednesday";
		// if (day === 3) dayP = "Thursday";
		// if (day === 4) dayP = "Friday";
		// if (day === 5) dayP = "Saturday";
		// if (day === 6) dayP = "Sunday";
		
		var monthP;
		if (month === 0) monthP = "January"; if (month === 1) monthP = "February"; if (month === 2) monthP = "March";
		if (month === 3) monthP = "April"; if (month === 4) monthP = "May"; if (month === 5) monthP = "June";
		if (month === 6) monthP = "July"; if (month === 7) monthP = "August"; if (month === 8) monthP = "September";
		if (month === 9) monthP = "October"; if (month === 10) monthP = "November"; if (month === 11) monthP = "December";
	
		if (number === 1)
			return ({month: monthP, monthN: month + 1, year: year});
		return (monthP + ' ' + year);
	}
})
.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };

  
})
.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' ...');
    };
})
.filter('sortSkill', function () {
    return function (input) {

        if (input && input[0]) {
        	var text = "";
        	var lengthText = input.length;
        	var index;
        	var i 		= 0,
        		n 		= 0,
        		count 	= 0;

    		if (!input[1]) {
    			text = input[0].sName;
    			if (text.length > 20)
    				text = text.substring(0, 16) + "...";
    		} else {
    			text = input[0].sName;
    			if (text.length > 14) {
    				text = text.substring(0, 13) + "..., +" + (lengthText - 1).toString();
    			} else 
    				text += ", +" + (lengthText - 1).toString();
    		}

        	return text;
        }
    };
})
.filter('wordsFilter', function() {
   return function(items, word) {
       if (!word || (word && !word[0]))
	   return items;
       else {
	   var filtered = [], 
    	   lowerword,
	   wordLower = !word || !word[0] ? null : word.toLowerCase();
	   
	   angular.forEach(items, function(item) {
    	       lowerword = item.name.toLowerCase();
               if(lowerword.indexOf(wordLower) !== -1){
		   filtered.push(item);
               }
	   });
	   
	   filtered.sort(function(a,b){
               if(a.name.indexOf(wordLower) < b.name.indexOf(wordLower)) return -1;
               else if(a.name.indexOf(wordLower) > b.name.indexOf(wordLower)) return 1;
               else return 0;
	   });
	   
	   return filtered;
       }
   };
})
.filter('htmlToPlaintext', function() {
    return function(text) {
    	return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
})
.filter( 'domain', function () {
  return function ( input ) {
    var matches,
        output = "",
        urls = /\w+:\/\/([\w|\.]+)/;

    matches = urls.exec( input );

    if ( matches !== null ) output = matches[1];
    console.log(output);
    return output;
  };
})
.filter('removeSpace', function() {
	return function (input) {
		var str = input.replace(/ +/g, "");
		return str;
	}
})
.filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);

