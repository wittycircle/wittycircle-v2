/*** Meet tool function ***/

exports.sortCardProfile = function(data, callback) {
    if (data[0]) {
		var newCardProfile = [];
		function recursive(index) {

		    if (data[index] && data[index] !== null && typeof data[index] !== "undefined") {
				pool.query('SELECT count(*) as followers FROM user_followers WHERE follow_user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
				    function(err, followers) {
				        if (err) throw err;
				        pool.query('SELECT count(*) as following FROM user_followers WHERE user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
						    function(err, following) {
								if (err) throw err;
								pool.query('SELECT id FROM users WHERE profile_id = ?', data[index].id,
									function(err, row) {
										if (err) throw err;
										pool.query('SELECT skill_name FROM user_skills WHERE user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
											function(err, result) {
												if (err) throw err;
												if (row[0]) {
													data[index].followers 	= followers[0].followers;
													data[index].following 	= following[0].following;
													data[index].user_id 	= row[0].id;
													data[index].skills 		= result;
													newCardProfile.push(data[index]);
													return recursive(index + 1);
												} else
													return recursive(index + 1);
											});
								});
						});
				});
		    } else {
				return callback(newCardProfile);
		    }
		};
		recursive(0);
    } else {
    	return callback([]);
    }
};
