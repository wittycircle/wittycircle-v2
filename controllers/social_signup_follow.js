var mysql	= require('mysql');
var dbconfig	= require('../database');
var pool	= mysql.createConnection(dbconfig.connection);
var _ 		= require('underscore');

pool.query('USE ' + dbconfig.database);

function checkFollowBetweenUsers(contact_id, callback) {
	pool.query('SELECT id FROM users WHERE email = "jaychau.ho@gmail.com"',
		function(err, result) {
			if (err) throw err;
			else {
				pool.query('SELECT id FROM user_followers WHERE user_id = ? && follow_user_id = ?', [result[0].id, contact_id],
					function(err, result2) {
						if (err) throw err;
						else {
							if (result2[0]) return callback({check: false});
							else return callback({check: true, user_id: result[0].id, contact_id: contact_id});
						}
					});
			}
		});
};

function followUserByForce(user_id, contact_id, callback) {
	pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', user_id, 
		function(err, result) {
			if (err) throw err;
			if (!result[0]) return callback();
			var fullname = result[0].first_name + ' ' + result[0].last_name;
			pool.query('INSERT INTO user_followers SET user_id = ?, follow_user_id = ?, user_username = ?', [user_id, contact_id, fullname],
				function(err, result) {
					if (err) throw err;
					return callback();
				});
		});
};

function followFromGoogleContacts(contacts) {
	pool.query('SELECT email FROM users', 
		function(err, result) {
			if (err) throw err;
			else {
				var array = result.map( function(el) { return el.email; });
				var unionContacts = _.intersection(contacts, array);
				if (unionContacts) {
					function recursive(index) {
						if (unionContacts[index]) {
							pool.query('SELECT id FROM users WHERE email = ?', unionContacts[index], 
								function(err, result2) {
									if (err) throw err;
									else {
										checkFollowBetweenUsers(result2[0].id, function(object) {
											console.log(object);
											if (!object.check) return recursive(index + 1);
											else {
												followUserByForce(object.user_id, object.contact_id, function() {
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

exports.handleGoogleContacts = function(contacts) {
	var newContacts = contacts.map( function(el) {return el.email });
	followFromGoogleContacts(newContacts);
};