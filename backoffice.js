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

module.exports = function(app) {

	app.get('/admin/check', function(req, res) {
		if (req.isAuthenticated() && req.user.moderator) {
			return res.send(true);
		} else
			return res.send(false);
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
		pool.query('SELECT profile_id, email FROM users WHERE id NOT IN (SELECT user_id FROM user_skills GROUP BY user_id ORDER BY user_id) ORDER BY id', function(err, result) {
			if (err) throw err;
			else {
				function recursive(index) {
					if (result[index]) {
						pool.query('SELECT first_name, last_name FROM profiles WHERE id = ?', result[index].profile_id, function(err, result2) {
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
						pool.query('SELECT email FROM users WHERE profile_id = ?', result[index].id, function(err, result2) {
							if (err) throw err;
							else {
								var data = {
									'email_address': result2[index].email,
									'status': 'subscribed',
									'merge_fields': {
										'FNAME': result[0].first_name,
										'LNAME': result[0].last_name
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
		pool.query('SELECT profile_id, email FROM users WHERE id NOT IN (SELECT user_id FROM user_experiences)', function(err, result) {
			if (err) throw err;
			else {
				if (result[0]) {
					function recursive(index) {
						if (result[index]) {
							pool.query('SELECT first_name, last_name FROM profiles WHERE id = ?', result[index].profile_id,
								function(err, result2) {
									if (err) throw err;
									if (result2[0]) {
										var data = {
										   'email_address': result[index].email,
										   'status': 'subscribed',
										   'merge_fields': {
										       'FNAME': result2[0].first_name,
										       'LNAME': result2[0].last_name
										   }
										}

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
		pool.query("SELECT creator_user_id, title  FROM projects WHERE project_visibility = 1 AND post = '' AND picture != ''", function(err, result) {
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
										var data = {
										   'email_address': result2[index].email,
										   'status': 'subscribed',
										   'merge_fields': {
										       'FNAME': result3[0].first_name,
										       'LNAME': result3[0].last_name
										   }
										}

										mailchimp.addMemberIncomplete("post", data, function() {
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
										var data = {
										   'email_address': result2[index].email,
										   'status': 'subscribed',
										   'merge_fields': {
										       'FNAME': result3[0].first_name,
										       'LNAME': result3[0].last_name
										   }
										}

										mailchimp.addMemberIncomplete("picture", data, function() {
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
										var data = {
										   'email_address': result2[index].email,
										   'status': 'subscribed',
										   'merge_fields': {
										       'FNAME': result3[0].first_name,
										       'LNAME': result3[0].last_name
										   }
										}

										mailchimp.addMemberIncomplete("pp", data, function() {
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
										var data = {
										   'email_address': result2[index].email,
										   'status': 'subscribed',
										   'merge_fields': {
										       'FNAME': result3[0].first_name,
										       'LNAME': result3[0].last_name
										   }
										}

										mailchimp.addMemberIncomplete("pp", data, function() {
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

	app.get('/admin/mailpanel/upvote', ensureAdmin, function(req, res) {
		pool.query('SELECT user_id FROM project_followers GROUP BY user_id HAVING count(user_id) > 9', function(err, result) {
			if (err) throw err;
			else {
				var arr = result.map( function(el) { return el.user_id; });
				pool.query('SELECT id, email FROM users WHERE id NOT IN (' + arr + ')', function(err, result2) {
					if (err) throw err;
					if (result2[0]) {
						function recursive(index) {
							if (result2[index] && index < 30) {
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