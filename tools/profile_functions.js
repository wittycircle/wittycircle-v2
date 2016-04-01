/*** Meet tool function ***/

exports.sortCardProfile = function(data, callback) {
    if (data[0]) {
		var newCardProfile = [];
		function recursive(index) {
		    if (data[index]) {
				pool.query('SELECT count(*) as followers FROM user_followers WHERE follow_user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
				    function(err, followers) {
				        if (err) throw err;
				        pool.query('SELECT count(*) as following FROM user_followers WHERE user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
						    function(err, following) {
								if (err) throw err;
								pool.query('SELECT id FROM users WHERE profile_id = ?', data[index].id,
									function(err, row) {
										if (err) throw err;
										if (row[0]) {
											data[index].followers = followers[0].followers;
											data[index].following = following[0].following;
											data[index].user_id 	= row[0].id;
											newCardProfile.push(data[index]);
											recursive(index + 1);
										} else
											recursive(index + 1);
								});
						});
				});
		    } else
				callback(newCardProfile);
		};
		recursive(0);
    } 
};
