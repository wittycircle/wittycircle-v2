

/*** NOTIFICATION ***/

var view	   = require('./controllers/view'),
follow	 = require('./controllers/follow'),
project  = require('./controllers/projects'),
ask 	 = require('./controllers/asks'),
help 	 = require('./controllers/feedbacks'),
cd       = require('./dateConvert')

// sort notification list by date
// function notifSortListDesc(list, callback) {

// 	var swap,
// 	sortlist = list,
// 	listdesc = [],
// 	i = 0,
// 	n = 0
// 	while (sortlist[i]) {

// 		while (n < sortlist.length && sortlist[i].timestamp >= sortlist[n].timestamp)
// 			n++;
// 		if (n == sortlist.length) {
// 			n = 0;
// 			listdesc.push(sortlist[i]);
// 			sortlist.splice(i, 1);
// 			i = 0;
// 		} else {
// 			n = 0;
// 			i++;
// 		}
// 	}
// 	callback(listdesc);
// };

function sortFollowUserList(req, list, callback) {
	var newList = [];
	function recursive(index) {
		if (list[index]) {
			pool.query("SELECT * FROM projects WHERE id = ?", [list[index].project_id], function(err, res) {
				if (err) throw err;
				if (res[0].creator_user_id !== req.user.id)
					newList.push(list[index]);
				recursive(index + 1);
			});
		} else
		callback(newList);
	};
	recursive(0);
};

/*** NOTIFICATION SAVE LIST ***/

// put notif follow user followed into notification_follow_user table
function saveNotificationList(req, res, list, callback) {
	pool.query('SELECT * FROM notification_list', function(err, row) {
		if (!row[0]) { // if the table is empty
			function recursive(index) {
				if (list[index]) {
					if (list[index].type === "view") { // insert notification's list about users who view currentUser into notification_list database
						pool.query('INSERT INTO notification_list (user_id, user_notif_id, user_notif_username, type_notif, date_of_view) VALUES (?, ?, ?, ?, ?)',
							[req.user.id, list[index].user_notif_id, list[index].name, list[index].type, list[index].creation_date],
							function(err, result) {
								if (err) throw err;
								recursive(index + 1);
							});
					}
					else if (list[index].type === "u_follow") { // insert notification's list about users who follow currentUser into notification_list database
						pool.query('INSERT INTO notification_list (user_id, user_notif_id, user_notif_username, type_notif, date_of_view) VALUES (?, ?, ?, ?, ?)',
							[req.user.id, list[index].user_notif_id, list[index].name, list[index].type, list[index].creation_date],
							function(err, result) {
								if (err) throw err;
								recursive(index + 1);
							});
					}
					else if (list[index].type === "p_follow") { // insert notification's list about users who follow currentUser's project into notification_list database
						pool.query('INSERT INTO notification_list (user_id, user_notif_id, user_notif_username, project_title, project_id, type_notif, date_of_view) VALUES (?, ?, ?, ?, ?, ?, ?)',
							[req.user.id, list[index].user_notif_id, list[index].name, list[index].project_title, list[index].project_id, list[index].type, list[index]. creation_date],
							function(err, result) {
								if (err) throw err;
								recursive(index + 1);
							});
					}
					else if (list[index].type === "p_user_follow") { // insert notification's list about all users followed by currentUser following projects into notification_list database
						pool.query('INSERT INTO notification_list (user_id, user_notif_id, user_notif_username, project_title, project_id, type_notif, date_of_view) VALUES (?, ?, ?, ?, ?, ?, ?)',
							[req.user.id, list[index].user_notif_id, list[index].name, list[index].project_title, list[index].project_id, list[index].type, list[index]. creation_date],
							function(err, result) {
								if (err) throw err;
								recursive(index + 1);
							});
					}
					else if (list[index].type === "u_user_follow") {
						pool.query('INSERT INTO notification_list (user_id, user_notif_id, user_notif_username, user_followed_id, user_followed_name, type_notif, date_of_view) VALUES (?, ?, ?, ?, ?, ?, ?)',
							[req.user.id, list[index].user_notif_id, list[index].name, list[index].user_followed_id, list[index].user_f_name, list[index].type, list[index].creation_date],
							function(err, result) {
								if (err) throw err;
								recursive(index + 1);
							});
					}
					else if (list[index].type_notif === "p_ask" || list[index].type_notif === "p_help" || list[index].type_notif === "p_reply_ask") {
						pool.query('INSERT INTO notification_list SET ?', list[index],
							function(err, result) {
								if (err) throw err;
								recursive(index + 1);
							});
					}
					else
						recursive(index + 1);
				} else
					callback({done: true});
			};
			recursive(0);
		} else {
			function recursive2(index) {
				if (list[index]) {
					if (list[index].type === "view") { // insert only all news elements in notification's list about users who view currentUser following projects into notification_list database
						pool.query('SELECT 1 FROM notification_list WHERE user_id = ? && user_notif_id = ? && type_notif = ?',
							[req.user.id, list[index].user_notif_id, list[index].type],
							function(err, row) {
								if (err) throw err;
								if (!row[0]) {
									pool.query('INSERT INTO notification_list (user_id, user_notif_id, user_notif_username, type_notif, date_of_view) VALUES (?, ?, ?, ?, ?)',
										[req.user.id, list[index].user_notif_id, list[index].name, list[index].type, list[index].creation_date],
										function(err, result) {
											if (err) throw err;
											recursive2(index + 1);
										});
								} else
								recursive2(index + 1);
							});
					}
					else if (list[index].type === "u_follow") { // insert only all news elements in notification's list about users who follow currentUser following projects into notification_list database
						pool.query('SELECT 1 FROM notification_list WHERE user_id = ? && user_notif_id = ? && type_notif = ?',
							[req.user.id, list[index].user_notif_id, list[index].type],
							function (err, row) {
								if (err) throw err;
								if (!row[0]) {
									pool.query('INSERT INTO notification_list (user_id, user_notif_id, user_notif_username, type_notif, date_of_view) VALUES (?, ?, ?, ?, ?)',
										[req.user.id, list[index].user_notif_id, list[index].name, list[index].type, list[index].creation_date],
										function(err, result) {
											if (err) throw err;
											recursive2(index + 1);
										});
								} else
								recursive2(index + 1);
							});
					}
					else if (list[index].type === "p_follow") { // insert only all news elements in notification's list about users who follow currentUser's projects following projects into notification_list database
						pool.query('SELECT 1 FROM notification_list WHERE user_id = ? && user_notif_id = ? && project_title = ? && type_notif = ?', [req.user.id, list[index].user_notif_id, list[index].project_title, list[index].type],
							function(err, row) {
								if (err) throw err;
								if (!row[0]) {
									pool.query('INSERT INTO notification_list (user_id, user_notif_id, user_notif_username, project_title, project_id, type_notif, date_of_view) VALUES (?, ?, ?, ?, ?, ?, ?)',
										[req.user.id, list[index].user_notif_id, list[index].name, list[index].project_title, list[index].project_id, list[index].type, list[index]. creation_date],
										function(err, result) {
											if (err) throw err;
											recursive2(index + 1);
										});
								} else
								recursive2(index + 1);
							});
					}
					else if (list[index].type === "p_user_follow") { // insert only all news elements in notification's list about all users followed by currentUser following projects into notification_list database
						pool.query('SELECT 1 FROM notification_list WHERE user_id = ? && user_notif_id = ? && project_title = ? && type_notif = ?', [req.user.id, list[index].user_notif_id, list[index].project_title, list[index].type],
							function(err, row) {
								if (err) throw err;
								if (!row[0]) {
									pool.query('INSERT INTO notification_list (user_id, user_notif_id, user_notif_username, project_title, project_id, type_notif, date_of_view) VALUES (?, ?, ?, ?, ?, ?, ?)',
										[req.user.id, list[index].user_notif_id, list[index].name, list[index].project_title, list[index].project_id, list[index].type, list[index].creation_date],
										function(err, result) {
											if (err) throw err;
											recursive2(index + 1);
										});
								} else
								recursive2(index + 1);
							});
					}
					else if (list[index].type === "u_user_follow") {
						pool.query('SELECT 1 FROM notification_list WHERE user_id = ? && user_notif_id = ? && user_followed_id = ? && type_notif = ?', 
							[req.user.id, list[index].user_notif_id, list[index].user_followed_id, list[index].type],
							function(err, row) {
								if (err) throw err;
								if (!row[0]) {
									pool.query('INSERT INTO notification_list (user_id, user_notif_id, user_notif_username, user_followed_id, user_followed_name, type_notif, date_of_view) VALUES (?, ?, ?, ?, ?, ?, ?)',
										[req.user.id, list[index].user_notif_id, list[index].name, list[index].user_followed_id, list[index].user_f_name, list[index].type, list[index].creation_date],
										function(err, result) {
											if (err) throw err;
											recursive2(index + 1);
										});
								} else
								recursive2(index + 1);
							});
					}
					else if (list[index].type === "p_involve") {
						pool.query('SELECT 1 FROM notification_list WHERE user_id = ? && project_id = ? && user_notif_id = ? && type_notif = ?',
							[list[index].user_id, list[index].project_id, list[index].user_notif_id, list[index].type],
							function(err, row) {
								if (err) throw err;
								if (!row[0]) {
									pool.query('INSERT INTO notification_list (user_id, user_notif_id, user_notif_username, project_id, project_title, type_notif, date_of_view) VALUES (?, ?, ?, ?, ?, ?, ?)',
										[list[index].user_id, list[index].user_notif_id, list[index].user_notif_username, list[index].project_id, list[index].project_title, list[index].type, list[index].creation_date],
										function(err, result) {
											if (err) throw err;
											recursive2(index + 1);
										});
								} else
									recursive2(index + 1);
							});
					}
					else if (list[index].type_notif === "p_ask" || list[index].type_notif === "p_help" || list[index].type_notif === "p_reply_ask" || list[index].type_notif === "p_reply_help") {
						pool.query('SELECT 1 FROM notification_list WHERE user_id = ? && project_id = ? && date_of_view = ? && type_notif = ?',
							[list[index].user_id, list[index].project_id, list[index].date_of_view, list[index].type_notif],
							function(err, row) {
								if (err) throw err;
								if (!row[0] || typeof row[0] === "undefined") {
									pool.query('INSERT INTO notification_list SET ?', list[index],
										function(err, result) {
											if (err) throw err;
											recursive2(index + 1);
										});
								} else
									recursive2(index + 1);
							});
					} else {
						recursive2(index + 1);
					}
				} else
					callback({done: true});
			};
			recursive2(0);
		}
	});
}

function getAllNotificationList(req, res, callback) {
	view.getView(req, res, function(data) {
		follow.getFollowList(req, res, function(data2) {
			follow.getMyProjectFollowedBy(req, res, function(data3) {
				follow.getProjectFollowedBy(req, res, function(result) {
					sortFollowUserList(req, result, function(data4) {
						follow.getUserFollowBy(req, res, function(data5) {
							project.getMyInvolvedProject(req, res, function(data6) {
								ask.getProjectAsk(req, res, function(data7) {
									ask.getProjectAskForInvolvedUsers(req, res, function(data8) {
										ask.getProjectAskForCreator(req, res, function(data9) {
											ask.getProjectReplyAskForCreator(req, res, function(data10) {
												ask.getProjectReplyAskForCommentUsers(req, res, function(data11) {
													help.getProjectHelp(req, res, function(data12) {
														help.getProjectReplyHelpForCreator(req, res, function(data13) {
															help.getProjectReplyHelpForInvolvedUser(req, res, function(data14) {
																help.getProjectReplyHelp(req, res, function(data15) {
																	var allList = data.concat(data2, data3, data4, data5, data6, data7, data8, data9, data10, data11, data12, data13, data14, data15);
																	saveNotificationList(req, res, allList, function(res) {
																		callback(res);
																	});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
};

function getPrettyDateForAllNotif(array, callback) {
	if (array && array[0]) {
		function recursive(index) {
			if (array[index]) {
				cd.convertDate(array[index].date_of_view, function(newDate) {
					array[index].date_of_view = newDate;
					recursive(index + 1);
				});
			} else
			callback(array);

		}; recursive(0);
	} else
	callback(false);
}

exports.getNotifications = function(req, res) {
	getAllNotificationList(req, res, function(result) {
		if (result.done) {
			pool.query("SELECT * FROM notification_list WHERE user_id = ? ORDER BY date_of_view DESC LIMIT 50", [req.user.id], function(err, data) {
				if (err) throw err;
				var notifArray = [];
				function recursive(index) {
					if (data[index]) {
						var newNotif = data[index];
						pool.query('SELECT profile_picture_icon FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', data[index].user_notif_id, 
							function(err, result) {
								if (err) throw err;
								if (result[0]) {
									newNotif.pic = result[0].profile_picture_icon;
								}
								notifArray.push(newNotif);
								recursive(index + 1);
							});
					} else {
						getPrettyDateForAllNotif(notifArray, function(newArray) {
							res.send({success: true, data: newArray});
						});
					}
				};
				recursive(0);
			});
		}
	});
};

/*** NOTIF PERMISSIONS ***/

function setUpPermissons(id, callback) {
	pool.query('INSERT INTO notification_permission (user_id, notif_type) VALUES (?, "profile_view"), (?, "user_follow"), (?, "follow_project"), (?, "feedback"), (?, "ask_project"), (?, "reply_project"), (?, "new_message")',
		[id, id, id, id, id, id, id],
		function(err, result) {
			if (err) throw err;
			else
				return callback(true);
		});
};

exports.getNotifPermissions = function(req, res) {
	pool.query('SELECT * FROM notification_permission WHERE user_id = ?', req.user.id,
		function(err, result) {
			if (err) throw err;
			else {
				if (!result[0]) {
					setUpPermissons(req.user.id, function(done) {
						if (done)
							return res.status(200).send({success: true, data: "all"});
					});
				} else
					return res.status(200).send({success: true, data: result});
			}
		});
};

exports.updateNotifPermissions = function(req, res) {
	req.checkBody('notif_type', 'Error Message').isString();
    req.checkBody('permission', 'Error Message').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query('UPDATE notification_permission SET permission = ? WHERE notif_type = ? AND user_id = ?', [req.body.permission, req.body.notif_type, req.user.id],
    		function(err, result) {
    			if (err) throw err;
    			else
    				return res.status(200);
    		});
    }
};

/*** NOTIFICATION UPDATE READ ***/

// exports.updateViewNotification = function(req, res) { // update n_read of view
// 	if (req.body.type === "view") {
// 		pool.query('UPDATE notification_list SET n_read = 1 WHERE user_id = ? && user_notif_id = ? && type_notif = ?', [req.user.id, req.body.notifId, req.body.type],
// 			function(err, result) {
// 				if (err) throw err;
// 				res.send({success: true});
// 			});
// 	}
// };

// exports.updateUserFollowNotif = function(req, res) { // update n_read of user follow
// 	if (req.body.type === "u_follow") {
// 		pool.query('UPDATE notification_list SET n_read = 1 WHERE user_id = ? && user_notif_id = ? && type_notif = ?', [req.user.id, req.body.notifId, req.body.type],
// 			function(err, result) {
// 				if (err) throw err;
// 				res.send({success: true});
// 			});
// 	}
// };

// exports.updateProjectFollowNotif = function(req, res) {
// 	if (req.body.type === "p_follow") {
// 		pool.query('UPDATE notification_list SET n_read = 1 WHERE user_id = ? && user_notif_id = ? && project_id = ? && type_notif = ?', 
// 			[req.user.id, req.body.notifId, req.body.projectId, req.body.type],
// 			function(err, result) {
// 				if (err) throw err;
// 				res.send({success: true});
// 			});
// 	}
// };

// exports.updateProjectFollowBy = function(req, res) {
// 	if (req.body.type === "p_user_follow") {
// 		pool.query('UPDATE notification_list SET n_read = 1 WHERE user_id = ? && user_notif_id = ? && project_id = ? && type_notif = ?',
// 			[req.user.id, req.body.notifId, req.body.projectId, req.body.type],
// 			function(err, result) {
// 				if (err) throw err;
// 				res.send({success: true});
// 			});
// 	}
// };

// exports.updateUserFollowBy = function(req, res) {
// 	if (req.body.type === "u_user_follow") {
// 		pool.query('UPDATE notification_list SET n_read = 1 WHERE user_id = ? && user_notif_id = ? && user_followed_id = ? && type_notif = ?',
// 			[req.user.id, req.body.notifId, req.body.userFollowId, req.body.type],
// 			function(err, result) {
// 				if (err) throw err;
// 				res.send({success: true});
// 			});
// 	}
// };

// exports.updateProjectInvolve = function(req, res) { // update n_read of view
// 	if (typeof req.body.id === "number") {
// 		pool.query('UPDATE notification_list SET n_read = 1 WHERE id = ?', [req.body.id],
// 			function(err, result) {
// 				if (err) throw err;
// 				res.send({success: true});
// 			});
// 	}
// };

// exports.updateProjectAsk = function(req, res) {
// 	if (typeof req.body.id === "number") {
// 		pool.query('UPDATE notification_list SET n_read = 1 WHERE id = ?', [req.body.id],
// 			function(err, result) {
// 				if (err) throw err;
// 				res.send({success: true});
// 			});
// 	}
// };

exports.updateSingleNotif = function(req, res) {
	/* Validation */
    req.checkBody('id', 'Error Message').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query('UPDATE notification_list SET n_read = 1 WHERE id = ?', [req.body.id],
    		function(err, result) {
    			if (err) throw err;
    			return res.send({success: true});
    		});
    }
};

exports.updateAllNotif = function(req, res) {
	pool.query('UPDATE notification_list SET n_read = 1 WHERE user_id = ?', [req.user.id],
		function(err, result) {
			if (err) throw err;
			res.send({success: true});
		});
};

