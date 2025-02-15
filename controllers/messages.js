const mandrill 	= require('mandrill-api/mandrill');
var np 			= require('../tools/notification_permission');


/* Data messages */

function convertDate(date, callback) { // convert default format date to display date's format

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
gPM 	= gPD / 30,
gPY		= gPM / 12;

// all case
if (gPS >= 0 && gPS <= 10)          {d = "Just now"; callback(d);}
else if (gPS > 10 && gPS <= 60)     {d = Math.floor(gPS) + " seconds ago"; callback(d);}
else if (gPMin >= 1 && gPMin < 2)	{d = Math.floor(gPMin) + " minute ago"; callback(d);}
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

function getMessageProfilePicture(id1, id2, callback) {
	if (id1 && id2) {
		pool.query('SELECT profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', id1,
		function(err, result1) {
			if (err) throw err;
			pool.query('SELECT profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', id2,
			function(err, result2) {
				if (err) throw err;
				callback({pic1: result1[0].profile_picture, pic2 : result2[0].profile_picture});
			});
		});
	} else
	callback('error id');
};

function getUsernameMessage(id1, id2, callback) {
	if (id1 && id2) {
		pool.query('SELECT username, CASE id WHEN ? then 1 WHEN ? then 2 END AS myorder FROM users WHERE id IN (?, ?) ORDER BY myorder', [id1, id2, id1, id2],
		function(err, data) {
			if (err) throw err;
			callback(data);
		});
	} else
	callback('error username');
};

function getDialogue(req, data, callback) {
	var dialogues = [];
	var stock = [];
	var NFDate;
	function recursive(i) {
		if (data[i]) {
			getMessageProfilePicture(data[i].from_user_id, data[i].to_user_id, function(res) {
				getUsernameMessage(data[i].from_user_id, data[i].to_user_id, function(res1) {
					var parent = data[i].parent_id;
					if (stock.indexOf(parent) == -1) {
						convertDate(data[i].creation_date, function(d) { NFDate = d; })
						if (res1[1].username === req.user.username) {
							var info_last = {
								id                  : data[i].from_user_id,
								to_username         : data[i].from_username,
								last_message        : data[i].message,
								date                : NFDate,
								read                : data[i].m_read,
								sender              : res1[0].username,
								pic			: res.pic1
							};
						} else {
							var info_last = {
								id                  : data[i].to_user_id,
								to_username         : data[i].to_username,
								last_message        : data[i].message,
								date                : NFDate,
								read                : data[i].m_read,
								sender              : res1[0].username,
								pic			: res.pic2
							};
						}
						dialogues.push(info_last);
						stock.push(parent);
					}
					if (data[i + 1])
					recursive(i + 1);
					else
					callback(dialogues);
				});
			});
		}
	};
	recursive(0);
};

exports.createMessage = function(req, res){
	/* Form Validation */
	req.checkBody('from_user_id', 'Error Message').isInt();
	req.checkBody('to_user_id', 'Error Message').isInt();
	req.checkBody('parent_id', 'Error Message').optional().isInt();
	req.checkBody('message', 'Error Message').isString();

	var errors = req.validationErrors(true);
	if (errors) {
		return res.status(400).send(errors);
	} else {
		pool.query('SELECT username, profile_id, CASE id WHEN ? then 1 WHEN ? then 2 END AS myorder FROM users WHERE id IN (?, ?) ORDER BY myorder',
		[req.body.from_user_id, req.body.to_user_id, req.body.from_user_id, req.body.to_user_id],
		function (err, data) {
			if (err) throw err;
			pool.query('SELECT first_name, last_name, CASE id WHEN ? then 1 WHEN ? then 2 END AS myorder FROM profiles WHERE id in (?, ?) ORDER BY myorder',
			[data[0].profile_id, data[1].profile_id, data[0].profile_id, data[1].profile_id],
			function(err, result) {
				if (err) throw err;
				req.body.parent_id	 	= req.body.from_user_id + req.body.to_user_id;
				req.body.from_username	= result[0].first_name + ' ' + result[0].last_name;
				req.body.to_username	= result[1].first_name + ' ' + result[1].last_name;
				//				      req.body.m_read		= 1;
				var infoMessage = {
					from_user_id     : req.body.from_user_id,
					to_user_id       : req.body.to_user_id,
					message          : req.body.message
				};
				checkFirstMessage(infoMessage, function (response) {
					if (response && response === true) {
						req.body.m_send = 1;
					} else {
						req.body.m_send = 0;
					}
					pool.query('INSERT INTO `messages` SET ?', req.body, function(err, result) {
						if (err) throw err;
						return res.send({success: true});
					});
				});
			});
		});
	}
};

exports.getAllConversation = function(req, res) {
	pool.query('SELECT * FROM messages WHERE from_user_id = ? || to_user_id = ? ORDER BY creation_date DESC', [req.user.id, req.user.id],
	function(err, data) {
		if (err) throw err;
		if (data[0]) {
			getDialogue(req, data, function(result) {
				return res.send({success: true, topic: result});
			});
		} else
		return res.send({success: false});
	});
};

exports.updateConversation = function(req, res) {
	pool.query('UPDATE messages SET m_read = 1 WHERE from_user_id = ? && to_user_id = ?', [req.body.id, req.user.id], function(err, result) {
		if (err) throw err;
		return res.send({success: true});
	});
};

exports.getSpecificConversation =  function(req, res) { // get all messages of a specific client by his id
	pool.query('SELECT * FROM messages WHERE from_user_id = ? && to_user_id = ? || from_user_id = ? && to_user_id = ? ORDER BY creation_date ASC',
	[req.params.id, req.user.id, req.user.id, req.params.id],
	function(err, data) {
		if (err) throw err;
		pool.query('SELECT first_name, last_name, profile_picture_icon FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', req.params.id,  function(err, profile) {
			if (err) throw err;
			pool.query('SELECT profile_picture_icon FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', req.user.id, function(err, picture) {
				if (err) throw err;
				pool.query('SELECT username FROM users WHERE id = ?', req.params.id, function(err, username) {
					if (err) throw err;
					var name = {
						first_name	: profile[0].first_name,
						last_name 	: profile[0].last_name,
						username 	: username[0].username
					};
					var profile_picture = {
						my_picture	: picture[0].profile_picture_icon,
						user_picture: profile[0].profile_picture_icon,
					};
					function recursive(index) {
						if (data[index]) {
							convertDate(data[index].creation_date, function(newDate) {
								data[index].creation_date = newDate;
								recursive(index + 1);
							});
						} else
							return res.send({success: true, messages: data, name: name, picture: profile_picture});
					}; recursive(0);
				});
			});
		});
	});
};

exports.deleteConversation = function(req, res) {
	if (req.body[0].from_user_id) {
		var id;
		id = (req.user.id === req.body[0].from_user_id) ? req.body[0].from_user_id : req.body[0].to_user_id;
		pool.query('DELETE FROM messages WHERE from_user_id = ? && parent_id = ?', [id, req.body[0].parent_id],
		function(err, result) {
			if (err) throw err;
			return res.send({success: true});
		});
	}
};

exports.getAllMessage = function(req, res) {
	if (req.user.moderator) {
		pool.query('SELECT from_username, to_username, message, creation_date, m_read, m_send FROM messages ORDER BY parent_id DESC',
			function(err, result) {
				if (err) throw err;
				else {
					return res.status(200).send(result);
				}
			});
	} else 
		return res.status(403).send("NOT AUTHORIZED");
};

exports.updateMessageAskHelp = function(req, res) {
	req.checkBody('id', 'Error Message').isInt();

	var errors = req.validationErrors(true);
	if (errors) {
		return res.status(400).send(errors);
	} else {
		req.body.check = req.body.check ? 0 : -1;
		pool.query('UPDATE messages SET ask_for_help = ? WHERE id = ?', [req.body.check, req.body.id],
			function(err, result) {
				if (err) throw err;
				return res.status(200).send({success: true});
			});
	}
};

function checkFirstMessage (info, callback) {
	pool.query('SELECT * FROM messages where from_user_id = ? and to_user_id = ?', //checking if messages has already been sent between the 2 users
	[info.from_user_id, info.to_user_id],
	function (err, data) {
		if (err) {
			throw err;
		} else {
			if (data[0]) {
				// relation exist already, now i must check the last connect of user
				console.log('data0 exits1');
				callback(false);
			} else {
				pool.query('SELECT * FROM messages where from_user_id = ? and to_user_id = ?', // checking also the relation in the 2 way
				[info.to_user_id, info.from_user_id],
				function (err, result) {
					if (err) {
						throw err;
					} else {
						if (data[0]) {
							// relation exist already, now i must check the last connect of user
							console.log('data0 exits2');
							callback(false);
						} else {
							// send mail because no relations exist
							np.sortEmailNotificationPermission('new_message', [{user_id: info.to_user_id}], function(check) {
								if (!check)
									return callback(true);
								pool.query("SELECT * FROM profiles WHERE id IN (SELECT profile_id FROM users where id = ?)",
								[info.from_user_id],
								function (err, rslt) {
									if (err) {
										throw err;
									} else {
										pool.query("SELECT * FROM users WHERE id = ?",
										[info.to_user_id],
										function (err, mail) {
											if (err) {
												throw err;
											} else {
												pool.query("SELECT * FROM profiles WHERE id IN (SELECT profile_id FROM users where id = ?)",
												[info.to_user_id],
												function (err, response) {
													if (err) {
														throw err;
													} else {
														function getNewD(value, wordwise, max, tail) {
															if (!value) return '';
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
														}

														var subj = rslt[0].first_name + " " + rslt[0].last_name + " sent you a message" ;
														var newd = getNewD(info.message, true, 76, ' ...');
														if (rslt[0].location_country) {
															var loc = rslt[0].location_city + ', ' + rslt[0].location_country;
														}
														if (rslt[0].location_state) {
															var loc = rslt[0].location_city + ', ' + rslt[0].location_state;
														}

														var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

														var template_name = "new-message";
														var template_content = [{
															"name": "new-message",
															"content": "content",
														}];

														var message = {
															"html": "<p>HTML content</p>",
															"subject": subj,
															"from_email": "noreply@wittycircle.com",
															"from_name": "Wittycircle",
															"to": [{
																"email": mail[0].email,
																"name": 'kkkkk',
																"type": "to"
															}],
															"headers": {
																"Reply-To": "noreply@wittycircle.com"
															},
															"important": false,
															"inline_css": null,
															"preserve_recipients": null,
															"view_content_link": null,
															"tracking_domain": null,
															"signing_domain": null,
															"return_path_domain": null,
															"merge": true,
															"merge_language": "mailchimp",
															"global_merge_vars": [{
																"name": "merge1",
																"content": "merge1 content"
															}],
															"merge_vars": [
																{
																	"rcpt": mail[0].email,
																	"vars": [
																		{
																			"name": "fname",
																			"content": response[0].first_name
																		},
																		{
																			"name": "ffname",
																			"content": rslt[0].first_name
																		},
																		{
																			"name": "flname",
																			"content": rslt[0].last_name
																		},
																		{
																			"name": "fimg",
																			"content": rslt[0].profile_picture_icon
																		},
																		{
																			"name": "fdesc",
																			"content": newd
																		},
																		{
																			"name": "floc",
																			"content": loc
																		}
																	]
																}
															]
														};

														var async = false;
														mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
															return callback(true);
														}, function(e) {
															// Mandrill returns the error as an object with name and message keys
															console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
															throw e;
															// A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
														});
													}
												});
											}
										});
									}
								});
							});	
						}
					}
				});
			}
		}
	});
}
