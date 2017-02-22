var mysql	= require('mysql');
var dbconfig	= require('../database');
var pool	= mysql.createConnection(dbconfig.connection);
var _ 		= require('underscore');

pool.query('USE ' + dbconfig.database);

function checkFollowBetweenUsers(owner_id, contact_id, callback) {
	pool.query('SELECT id FROM user_followers WHERE user_id = ? && follow_user_id = ?', [owner_id, contact_id],
		function(err, result2) {
			if (err) throw err;
			else {
				pool.query('SELECT id FROM user_followers WHERE user_id = ? && follow_user_id = ?', [contact_id, owner_id],
					function(err, result3) {
						if (err) throw err;
						if (result2[0] && result3[0]) return callback({check: false});
						var c1 = !result2[0] ? true : false;
						var c2 = !result3[0] ? true : false;
							return callback({check: true, check1: c1, check2: c2});
					});
			}
		});
};

function followUserByForce(user_id, contact_id, c1, c2, callback) {
	pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', user_id, 
		function(err, result) {
			if (err) throw err;
			pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', contact_id,
				function(err, result2) {
					if (err) throw err;

					if (!result[0] || !result2[0]) return callback();
					var fullname = result[0].first_name + ' ' + result[0].last_name;
					var fullname2 = result2[0].first_name + ' ' + result2[0].last_name;

					if (c1 && !c2) {
						pool.query('INSERT INTO user_followers SET user_id = ?, follow_user_id = ?, user_username = ?', [user_id, contact_id, fullname],
							function(err, result1) {
								if (err) throw err;
								// here send mail
								return callback();
							});
					} else if (c2 && !c1) {
						pool.query('INSERT INTO user_followers SET user_id = ?, follow_user_id = ?, user_username = ?', [contact_id, user_id, fullname2],
							function(err, result1) {
								if (err) throw err;
								// here send mail
								return callback();
							});
					} else {
						pool.query('INSERT INTO user_followers (user_id, follow_user_id, user_username) SELECT ?, ?, ? UNION ALL SELECT ?, ?, ?', [user_id, contact_id, fullname, contact_id, user_id, fullname2],
							function(err, result1) {
								if (err) throw err;
								// here send mail
								return callback();
							});
					}
				});
		});
};

function followFromGoogleContacts(owner_id, contacts) {
	pool.query('SELECT email FROM users', 
		function(err, result) {
			if (err) throw err;
			else {
				var array = result.map( function(el) { return el.email; });
				var interContacts = _.intersection(contacts, array);
				if (interContacts) {
					function recursive(index) {
						if (interContacts[index]) {
							pool.query('SELECT id FROM users WHERE email = ?', interContacts[index], 
								function(err, result2) {
									if (err) throw err;
									else {
										checkFollowBetweenUsers(owner_id, result2[0].id, function(object) {
											if (!object.check) return recursive(index + 1);
											else {
												followUserByForce(owner_id, result2[0].id, object.check1, object.check2, function() {
													return recursive(index + 1);
												});
											}
										});
									}
								});
						} else
							return ;
					};
					recursive(0);
				} else
					return ;
			}
		});
};

function followFromFacebookFriends(owner_id, data) {
	pool.query('SELECT id FROM users WHERE profile_id IN (SELECT id FROM profiles WHERE facebook_id IN (' + data + '))',
		function(err, result) {
			if (err) throw err;
			function recursive(index) {
				if (result[index]) {
					checkFollowBetweenUsers(owner_id, result[index].id, function(object) {
						if (!object.check) return recursive(index + 1);
						else {
							followUserByForce(owner_id, result[index].id, object.check1, object.check2, function() {
								return recursive(index + 1);
							});	
						}
					});
				} else {
					return ;
				}
			};
			recursive(0);
		});
};

exports.handleGoogleContacts = function(owner_id, contacts) {
	var newContacts = contacts.map( function(el) {return el.email });
	followFromGoogleContacts(owner_id, newContacts);
};

exports.handleFacebookFriends = function(owner_id, data) {
	var newData = data.map( function(el) { return el.id; });
	followFromFacebookFriends(owner_id, newData);
};