
/*pool.query('SELECT id, profile_id, email, username FROM users WHERE email like "%@witty.com%"',
	function(err, result) {
		if (err) throw err;
		function recursive(index) {
			if (result[index]) {
				pool.query('SELECT count(*) as number FROM user_followers WHERE user_id = ? AND follow_user_id = 1829', result[index].id,
					function(err, result2) {
						if (err) throw err;
						if (result2[0].number)
							return recursive(index + 1);
						else {
							pool.query('SELECT first_name, last_name FROM profiles WHERE id = ?', result[index].profile_id,
								function(err, name) {
									if (err) throw err;
									var fullname = name[0].first_name + " " + name[0].last_name;
									pool.query('INSERT INTO user_followers SET user_id = ?, follow_user_id = 1829, user_username = ?', [result[index].id, fullname],
										function(err, done) {
											if (err) throw err;
											else
												return recursive(index + 1);
										});
								});
						}
					});
			} else {
				console.log("DONE");
				return ;
			}
		};
		recursive(0);
	});*/
