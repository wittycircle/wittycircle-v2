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

	app.get('/admin/mailpanel/profile/incomplete', ensureAdmin, function(req, res) {
		pool.query('SELECT id, email FROM users WHERE id NOT IN (SELECT user_id FROM user_experiences)', function(err, result) {
			if (err) throw err;
			else {
				if (result[0]) {
					function recursive(index) {
						if (result[index] && index < 20) {
							pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', result[index].id,
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

										mailchimp.addMemberIncomplete(data, function() {
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
			}
		});
	});

	app.get('/admin/mailpanel/project/incomplete', ensureAdmin, function(req, res) {
		pool.query('SELECT creator_id FROM projects WHERE post is null', function(err, result) {
			if (err) throw err;
			else {
				var arr = o.map( function(el) { return el.creator_id; });
				pool.query('SELECT id, email FROM users WHERE id IN ' + arr, function(err, result2) {
					if (err) throw err;
					if (result2[0]) {
						function recursive(index) {
							if (result2[index] && index < 20) {
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

										mailchimp.addCreatorIncomplete(data, function() {
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
};