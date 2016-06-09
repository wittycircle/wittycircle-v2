var ensureAdmin = require('./controllers/auth').ensureAdminAuthenticated,
	mailchimp = require('./mailchimpRequest')

// function sortList(data, callback) {
// 	if (list[0]) {
// 		var newdata = [];

// 		function recursive(index) {
// 			if (list[index]) {
// 				newData.push(list[0]) ;
// 				recursive(index + 1);
// 			} else 
// 				callback(newData);
// 		};
// 		recursive(0);
// 	} else
// 		callback(false);

// };

function getProjectInfo(id, callback) {
	if (id) {
		pool.query('SELECT title, public_id FROM projects WHERE creator_user_id = ?', id,
			function(err, result) {
				if (result[0]) {
					var url = "https://www.wittycircle.com/project/" + result[0].public_id + "/" + result[0].title.replace(/ /g, '-');
					callback(url, result[0].title);
				} else
					callback(false, false);
			});
	} else
		callback(false, false);
}

module.exports = function(app) {

	app.get('/admin/check', function(req, res) {
		if (req.isAuthenticated() && req.user.moderator) {
			return res.send(true);
		} else
			return res.send(false);
	});

	app.get('/admin/list/profiles/complete', ensureAdmin, function(req, res) {
		pool.query('SELECT user_id FROM user_skills WHERE user_id IN (SELECT user_id FROM user_experiences group by user_id) group by user_id',
			function(err, result) {
				if (err) throw err;
				else {
					var arr = result.map( function(el) { return el.user_id; })
					pool.query("SELECT id, first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id IN (" + arr + ")) && (DESCRIPTION != '' && DESCRIPTION is not null)",
						function(err, result2) {
							if (err) throw err;
							else {
								var list = [];
								function recursive(index) {
									if (result2[index]) {
										pool.query('SELECT email, username, social_share, valid FROM users WHERE profile_id = ?', result2[index].id,
											function(err, result3) {
												if (err) throw err;
												list.push({
													first_name	: result2[index].first_name,
													last_name	: result2[index].last_name,
													email 		: result3[0].email,
													username 	: result3[0].username,
													social_share: result3[0].social_share,
													valid 		: result3[0].valid
												});
												return recursive(index + 1);
											});
									} else
										return res.send({success: true, list: list});
								};
								recursive(0);
							}
						});
				}
			});
	});

	app.get('/admin/mailpanel/profiles', ensureAdmin, function(req, res) {
		pool.query('SELECT profile_id, email FROM users ORDER BY id ASC', function(err, result) {
			if (err) throw err;
			else {
				function recursive(index) {
					if (result[index]) {
						pool.query('SELECT first_name, last_name FROM profiles WHERE id = ?', result[index].profile_id,
							function(err, result2) {
								if (err) throw err;
								else {
									var data = {
										'email_address': result[index].email,
										'status': 'subscribed',
										'merge_fields': {
											'FNAME': result2[0].first_name,
											'LNAME': result2[0].last_name
										}
									};
									mailchimp.addMember(data, function() {
										return recursive(index + 1);
									});
								}
							});
					} else {
						return res.send({success: true});
					}
				};
				recursive(0);
			}
		});
	});

	app.get('/admin/mailpanel/profile/incomplete/skill', ensureAdmin, function(req, res) {
		pool.query('SELECT profile_id, email, username FROM users WHERE id NOT IN (SELECT user_id FROM user_skills GROUP BY user_id ORDER BY user_id) ORDER BY id', function(err, result) {
			if (err) throw err;
			else {
				function recursive(index) {
					if (result[index]) {
						pool.query('SELECT first_name, last_name FROM profiles WHERE id = ?', result[index].profile_id, function(err, result2) {
							if (err) throw err;
							else {
								if (!result[index] || !result[index].username)
									return recursive(index + 1);
								var url = "https://www.wittycircle.com/" + result[index].username;
								var data = {
									'email_address': result[index].email,
									'status': 'subscribed',
									'merge_fields': {
										FNAME 	: result2[0].first_name,
										LNAME 	: result2[0].last_name,
										PURL 	: url,
									}
								};
								mailchimp.addMemberIncomplete('skill', data, function() {
									return recursive(index + 1);
								});
							}
						});
					} else
						return res.send({success: true});
				};
				recursive(0);	
			}
		});
	});

	app.get('/admin/mailpanel/profile/incomplete/about', ensureAdmin, function(req, res) {
		pool.query("SELECT id, first_name, last_name FROM profiles WHERE description is null || description = ''", function(err, result) {
			if (err) throw err;
			else  {
				function recursive(index) {
					if (result[index]) {
						pool.query('SELECT email, username FROM users WHERE profile_id = ?', result[index].id, function(err, result2) {
							if (err) throw err;
							else {
								if (!result2[0] || !result2[0].username)
									return recursive(index + 1);
								var url = "https://www.wittycircle.com/" + result2[0].username;
								var data = {
									'email_address': result2[0].email,
									'status': 'subscribed',
									'merge_fields': {
										'FNAME': result[index].first_name,
										'LNAME': result[index].last_name,
										'PURL': url
									}
								};
								mailchimp.addMemberIncomplete('about', data, function() {
									return recursive(index + 1);
								});
							}
						});
					} else
						return res.send({success: true});
				};
				recursive(0);
			}
		});
	});

	app.get('/admin/mailpanel/profile/incomplete/experience', ensureAdmin, function(req, res) {
		pool.query('SELECT profile_id, email, username FROM users WHERE id NOT IN (SELECT user_id FROM user_experiences)', function(err, result) {
			if (err) throw err;
			else {
				if (result[0]) {
					function recursive(index) {
						if (result[index]) {
							pool.query('SELECT first_name, last_name FROM profiles WHERE id = ?', result[index].profile_id,
								function(err, result2) {
									if (err) throw err;
									if (result2[0]) {
										if (!result[index] || !result[index].username)
											return recursive(index + 1);
										var url = "https://www.wittycircle.com/" + result[index].username;
										var data = {
										   'email_address': result[index].email,
										   'status': 'subscribed',
										   'merge_fields': {
										       'FNAME': result2[0].first_name,
										       'LNAME': result2[0].last_name,
										       'PURL': url
										   }
										};

										mailchimp.addMemberIncomplete("profile", data, function() {
											return recursive(index + 1);
										});
									} else {
										return recursive(index + 1);
									}
								});
						} else
							return res.send({success: true});

					};
					recursive(0);
				}
			}
		});
	});

	app.get('/admin/mailpanel/project/incomplete/post', ensureAdmin, function(req, res) {
		pool.query("SELECT creator_user_id FROM projects WHERE project_visibility = 1 AND post = '' AND picture != ''", function(err, result) {
			if (err) throw err;
			else {
				var arr = result.map( function(el) { return el.creator_user_id; });
				pool.query('SELECT id, email FROM users WHERE id IN (' + arr + ')', function(err, result2) {
					if (err) throw err;
					if (result2[0]) {
						function recursive(index) {
							if (result2[index]) {
							pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', result2[index].id,
								function(err, result3) {
									if (err) throw err;
									if (result3[0]) {
										getProjectInfo(result2[index].id, function(url, title) {
												if (!url || !title)
													return recursive(index + 1);
												var data = {
												   'email_address': result2[index].email,
												   'status': 'subscribed',
												   'merge_fields': {
												       'FNAME' 	: result3[0].first_name,
												       'LNAME' 	: result3[0].last_name,
												       'PRURL' 	: url,
												       'PTITLE' : title
												   }
												}
												mailchimp.addMemberIncomplete("post", data, function() {
													return recursive(index + 1);
												});
											});
									} else {
										return res.send({success: true});
									}
								});
							} else
								return res.send({success: true});
						};
						recursive(0);
					}
				})
			}
		});
	});

	app.get('/admin/mailpanel/project/incomplete/picture', ensureAdmin, function(req, res) {
		pool.query("SELECT creator_user_id, title FROM projects WHERE project_visibility = 1 AND picture = '' AND post != ''", function(err, result) {
			if (err) throw err;
			else {
				var arr = result.map( function(el) { return el.creator_user_id; });
				pool.query('SELECT id, email FROM users WHERE id IN (' + arr + ')', function(err, result2) {
					if (err) throw err;
					if (result2[0]) {
						function recursive(index) {
							if (result2[index]) {
							pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', result2[index].id,
								function(err, result3) {
									if (err) throw err;
									if (result3[0]) {
										getProjectInfo(result2[index].id, function(url, title) {
											if (!url || !title)
												return recursive(index + 1);
											var data = {
											   'email_address': result2[index].email,
											   'status': 'subscribed',
											   'merge_fields': {
											       'FNAME'	: result3[0].first_name,
											       'LNAME'	: result3[0].last_name,
											       'PRURL'	: url,
											       'PTITLE' : title
											   }
											}

											mailchimp.addMemberIncomplete("picture", data, function() {
												return recursive(index + 1);
											});
										});
									} else {
										return res.send({success: true});
									}
								});
							} else
								return res.send({success: true});
						};
						recursive(0);
					}
				});
			}
		});
	});

	app.get('/admin/mailpanel/project/incomplete/pp', ensureAdmin, function(req, res) {
		pool.query("SELECT creator_user_id, title FROM projects WHERE project_visibility = 1 AND picture = '' AND post = ''", function(err, result) {
			if (err) throw err;
			else {
				var arr = result.map( function(el) { return el.creator_user_id; });
				pool.query('SELECT id, email FROM users WHERE id IN (' + arr + ')', function(err, result2) {
					if (err) throw err;
					if (result2[0]) {
						function recursive(index) {
							if (result2[index]) {
							pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', result2[index].id,
								function(err, result3) {
									if (err) throw err;
									if (result3[0]) {
										getProjectInfo(result2[index].id, function(url, title) {
											if (!url || !title)
												return recursive(index + 1);
											var data = {
											   'email_address': result2[index].email,
											   'status': 'subscribed',
											   'merge_fields': {
											       FNAME	: result3[0].first_name,
											       LNAME	: result3[0].last_name,
											       PRURL	: url,
											       PTITLE : title,
											   }
											}

											mailchimp.addMemberIncomplete("pp", data, function() {
												return recursive(index + 1);
											});
										});
									} else {
										return res.send({success: true});
									}
								});
							} else
								return res.send({success: true});
						};
						recursive(0);
					}
				});
			}
		});
	});

	app.get('/admin/mailpanel/project/incomplete/private', ensureAdmin, function(req, res) {
		pool.query("SELECT creator_user_id, title FROM projects WHERE project_visibility = 0", function(err, result) {
			if (err) throw err;
			else {
				var arr = result.map( function(el) { return el.creator_user_id; });
				pool.query('SELECT id, email FROM users WHERE id IN (' + arr + ')', function(err, result2) {
					if (err) throw err;
					if (result2[0]) {
						function recursive(index) {
							if (result2[index]) {
							pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', result2[index].id,
								function(err, result3) {
									if (err) throw err;
									if (result3[0]) {
										getProjectInfo(result2[index].id, function(url, title) {
											if (!url || !title)
												return recursive(index + 1);
											var data = {
											   'email_address': result2[index].email,
											   'status': 'subscribed',
											   'merge_fields': {
											       'FNAME'	: result3[0].first_name,
											       'LNAME'	: result3[0].last_name,
											       'PRURL'	: url,
											       'PTITLE' : title
											   }
											}

											mailchimp.addMemberIncomplete("private", data, function() {
												return recursive(index + 1);
											});
										});
									} else {
										return res.send({success: true});
									}
								});
							} else
								return res.send({success: true});
						};
						recursive(0);
					}
				});
			}
		});
	});

	app.get('/admin/mailpanel/upvote', ensureAdmin, function(req, res) {
		pool.query('SELECT user_id FROM project_followers GROUP BY user_id HAVING count(user_id) > 9', function(err, result) {
			if (err) throw err;
			else {
				var arr = result.map( function(el) { return el.user_id; });
				pool.query('SELECT id, email FROM users WHERE id NOT IN (' + arr + ')', function(err, result2) {
					if (err) throw err;
					if (result2[0]) {
						function recursive(index) {
							if (result2[index]) {
							pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', result2[index].id,
								function(err, result3) {
									if (err) throw err;
									if (result3[0]) {
										var data = {
										   'email_address': result2[index].email,
										   'status': 'subscribed',
										   'merge_fields': {
										       'FNAME': result3[0].first_name,
										       'LNAME': result3[0].last_name
										   }
										}

										mailchimp.addMemberIncomplete("upvote", data, function() {
											return recursive(index + 1);
										});
									} else {
										return res.send({success: true});
									}
								});
							} else
								return res.send({success: true});
						};
						recursive(0);
					}
				});
			}
		});
	});

	app.get('/admin/mailpanel/followers', ensureAdmin, function(req, res) {
		pool.query('SELECT follow_user_id FROM user_followers GROUP BY follow_user_id ORDER BY follow_user_id', function(err, result) {

		});
	});
};
