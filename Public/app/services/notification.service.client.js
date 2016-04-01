/**
 * @ngdoc factory
 * @name wittyApp.facory:Notification
 * @description
 * # Notification
 * Factory in the wittyApp.
 **/
(function () {
	'use strict';

	angular
		.module('wittyApp')
		.factory('Notification', Notification);

	Notification.$inject = ['$http', '$rootScope', 'Projects'];

	function Notification($http, $rootScope, Projects) {
		var service = {};

		// service.getConvertDate				= getConvertDate;
		// service.notifSortListDesc			= notifSortListDesc;
		// service.getNotifFollowList 			= getNotifUserFollowList; 
		// service.getNotifViewList 			= getNotifViewList;
		// service.getNotifProjectFollowList 	= getNotifProjectFollowList;
		// service.getFollowUserNotif			= getFollowUserNotif;
		// service.getAllNotifList				= getAllNotifList;
		service.getNotificationList 	= getNotificationList;
		return service;

		function getNumberOfRead(data, callback) {
			var read = data;
			for(var i = 0, count = 0; i < data.length; i++) {
				if (!data[i].n_read)
					count++;
			}
			callback(count);
		};

		function getNotificationList(callback) {
			$http.get('/notification').success(function(res) {
				if (res.success) {
					getNumberOfRead(res.data, function(number) {
						callback({data: res.data, number: number});
					});
				}
			});
		};
		// function getConvertDate(date, callback) { // convert default format date to display date's format
		// 	// get day of the week
		// 	var WDay            = date.getDay();

		// 	// get timestamp
		// 	var dateNow         = new Date();
		// 	var dateNowParse    = dateNow.getTime();
		// 	var parseDate       = date.getTime() + 140000;

		// 	// get second, min, hour and day passed between now and a specific date by getting passed timestamp
		// 	var gPS     = (dateNowParse - parseDate) / 1000;
		// 	var gPMin   = gPS / 60;
		// 	var gPH     = gPMin / 60;
		// 	var gPD     = gPH / 24;

		// 	// get date, month, year
		// 	var gdate   = date.getDate();
		// 	var gmonth  = date.getMonth() + 1;

		// 	// all case
		// 	if (gPS >= 0 && gPS <= 10)          {var d = "Just now"; callback(d);}
		// 	else if (gPS > 10 && gPS <= 60)     {var d = Math.floor(gPS) + " seconds ago"; callback(d);}
		// 	else if (gPMin >= 1 && gPMin <= 60) {var d = Math.floor(gPMin) + " minutes ago"; callback(d);}
		// 	else if (gPH >= 1 && gPH < 24)      {var d = Math.floor(gPH) + "  hour ago"; callback(d);}
		// 	else if (gPD >= 1 && gPD < 2)       {var d = "Yesterday"; callback(d);}
		// 	else if (gPD >= 2 && gPD <= 3)      {var d = Math.floor(gPD) + " days ago"; callback(d);}
		// 	else if (gPD > 3 && gPD <= 7)       {if (WDay == 0) {var d = "Monday"; callback(d);}
		// 	                                 if (WDay == 1) {var d = "Tuesday"; callback(d);}
		// 	                                 if (WDay == 2) {var d = "Wednesday"; callback(d);}
		// 	                                 if (WDay == 3) {var d = "Thursday"; callback(d);}
		// 	                                 if (WDay == 4) {var d = "Friday"; callback(d);}
		// 	                                 if (WDay == 5) {var d = "Saturday"; callback(d);}
		// 	                                 if (WDay == 6) {var d = "Sunday"; callback(d);} }
		// 	else if (gPD > 7 && gPD <= 30)      {var d = gdate + "/" + gmonth; callback(d);}
		// 	else                                {var d = date; callback(d);}
		// };

		// sort notification list by date
  //       function notifSortListDesc(list, callback) {

  //           var swap;
  //           var sortlist = list;
  //           var listdesc = [];
  //           var i = 0;
  //           var n = 0;
  //           while (sortlist[i]) {

  //               while (n < sortlist.length && sortlist[i].timestamp >= sortlist[n].timestamp)
  //                   n++;
  //               if (n == sortlist.length) {
  //                   n = 0;
  //                  listdesc.push(sortlist[i]);
  //                  sortlist.splice(i, 1);
  //                  i = 0;
  //               } else {
  //                   n = 0;
  //                   i++;
  //               }
  //           }
  //           callback(listdesc);
  //       };

  // 		function sortFollowUserList(list, callback) {
		// 	var newList = [];
		// 	function recursive(index) {
		// 		if (list[index]) {
		// 			Projects.getProjectbyId(list[index].project_id, function(res) {
		// 				if (res[0].creator_user_id !== $rootScope.globals.currentUser.id)
		// 					newList.push(list[index]);
		// 				recursive(index + 1);
		// 			});
		// 		} else {
		// 			callback(newList);
		// 		}
		// 	};
		// 	recursive(0);
		// };

		// get view notification list
		// function getNotifViewList(callback) {
		// 	$http.get('/view').success(function(res) {
		// 		var lists = [];
		// 		var view = res.data;
		// 		for(var i = 0; i < view.length; i++) {
		// 			var d = new Date(view[i].creation_date);
		// 			getConvertDate(d, function(greatDate) {
		// 				var timestamp = Date.parse(d);
		// 				lists.push({
		// 					creation_date 	: view[i].creation_date,
		// 					timestamp		: timestamp,
		// 					date 			: greatDate,
		// 					read 			: view[i].m_read,
		// 					name 			: view[i].user_viewed_username,
		// 					user_notif_id 	: view[i].user_viewed_id,
		// 					type			: "view"
		// 				});
		// 			});
		// 		}
		// 		callback(lists);
		// 	});
		// };

		// get follow notification list
		// function getNotifUserFollowList(callback) {

		// 	$http.get('/follow/list').success(function(res) {
		// 		var list = [];
		// 		var follow = res.data;
		// 		for(var n = 0; n < follow.length; n++) {
		// 			var d = new Date(follow[n].creation_date);
		// 			getConvertDate(d, function(greatDate) {
		// 				var timestamp = Date.parse(d);
		// 				list.push({
		// 					creation_date 	: follow[n].creation_date,
		// 					timestamp 		: timestamp,
		// 					date 			: greatDate,
		// 					read 			: follow[n].f_read,
		// 					name 			: follow[n].user_username,
		// 					user_notif_id 	: follow[n].user_id,
		// 					type			: "u_follow"
		// 				});
		// 			});
		// 		}
		// 		callback(list);
		// 	});
		// };

		// get project follow notification list
		// function getNotifProjectFollowList(callback) {
		// 	$http.get("/follow_notification/project").success(function(res) {
		// 		var lists = [];
		// 		var projectFollow = res.data;
		// 		for (var n = 0; n < projectFollow.length; n++) {
		// 			var d = new Date(projectFollow[n].creation_date);
		// 			getConvertDate(d, function(greatDate) {
		// 				var timestamp = Date.parse(d);
		// 				lists.push({
		// 					creation_date	: projectFollow[n].creation_date,
		// 					timestamp 		: timestamp,
		// 					date 			: greatDate,
		// 					read 			: projectFollow[n].m_read,
		// 					name 			: projectFollow[n].user_name,
		// 					user_notif_id	: projectFollow[n].user_id,
		// 					project_title	: projectFollow[n].follow_project_title,
		// 					project_id		: projectFollow[n].follow_project_id,
		// 					type			: "p_follow"
		// 				});
		// 			});
		// 		}
		// 		callback(lists);
		// 	});
		// };
		// get notification list from follow user
		// function getFollowUserNotif(callback) {
		// 	$http.get("/user_followed/projectByUserId/byDate").success(function(res) {
		// 		var lists = [];
		// 		var followUserProject = res.data;
		// 		for (var n = 0; n < followUserProject.length; n++) {
		// 			var d = new Date(followUserProject[n].creation_date);
		// 			getConvertDate(d, function(greatDate) {
		// 				var timestamp = Date.parse(d);
		// 				lists.push({
		// 					creation_date 	: followUserProject[n].creation_date,
		// 					timestamp 		: timestamp,
		// 					date 			: greatDate,
		// 					name 			: followUserProject[n].user_name,
		// 					user_notif_id 	: followUserProject[n].user_id,
		// 					project_title 	: followUserProject[n].follow_project_title,
		// 					project_id 		: followUserProject[n].follow_project_id,
		// 					type 			: "p_user_follow"
		// 				});
		// 			});
		// 		}
		// 		sortFollowUserList(lists, function(res) {
		// 			callback(res);
		// 		});
		// 	});
		// };

		// get view notification list
		// function getNotifViewList(callback) {
		// 	$http.get('/view').success(function(res) {
		// 		callback(res.data);
		// 	});
		// };

		// // get follow notification list
		// function getNotifUserFollowList(callback) {
		// 	$http.get('/follow/list').success(function(res) {
		// 		callback(res.data);
		// 	});
		// };

		// // get project follow notification list
		// function getNotifProjectFollowList(callback) {
		// 	$http.get("/follow_notification/project").success(function(res) {
		// 		callback(res.data);
		// 	});
		// };
		// // get notification list from follow user
		// function getFollowUserNotif(callback) {
		// 	$http.get("/user_followed/projectByUserId/byDate").success(function(res) {
		// 		callback(res.data);
		// 	});
		// };


		// // get all notification list
		// function getAllNotifList(callback) {
		// 	getNotifViewList(function(viewList) {
		// 		getNotifUserFollowList(function(followList) {
		// 			getNotifProjectFollowList(function(pFollowList) {
		// 				getFollowUserNotif(function(pFollowUserList) {
		// 					var allList = viewList.concat(followList, pFollowList, pFollowUserList);
		// 					notifSortListDesc(allList, function(sList) {
		// 						callback(sList);
		// 					});
		// 				});
		// 			});
		// 		});
		// 	});
		// }; 
	};
})();

// $scope.listNotifs = Header.sortListDesc(lists);
