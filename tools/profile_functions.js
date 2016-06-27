/*** Meet tool function ***/

exports.sortCardProfile = function(data, callback) {
    if (data[0]) {
		var newCardProfile = [];
		function recursive(index) {

		    if (data[index] && data[index] !== null && typeof data[index] !== "undefined") {
		    	if (typeof data[index] === "string") {
		    		newCardProfile.push(data[index]);
		    		return recursive(index + 1);
		    	}
				pool.query('SELECT count(*) as followers FROM user_followers WHERE follow_user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
				    function(err, followers) {
				        if (err) throw err;
				        pool.query('SELECT count(*) as following FROM user_followers WHERE user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
						    function(err, following) {
								if (err) throw err;
								pool.query('SELECT id, username FROM users WHERE profile_id = ?', data[index].id,
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
													data[index].username 	= row[0].username;
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

exports.sortCardProfileNew = function(data, callback) {
    if (data[0]) {
		var newCardProfile = [];
		function recursive(index) {
			
		    if (data[index] && data[index] !== null && typeof data[index] !== "undefined") {
		    	if (typeof data[index] === "string") {
		    		newCardProfile.push(data[index]);
		    		return recursive(index + 1);
		    	}
				pool.query('SELECT count(*) as followers FROM user_followers WHERE follow_user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].profiles.id,
				    function(err, followers) {
				        if (err) throw err;
				        pool.query('SELECT count(*) as following FROM user_followers WHERE user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].profiles.id,
						    function(err, following) {
								if (err) throw err;
								pool.query('SELECT id, username FROM users WHERE profile_id = ?', data[index].profiles.id,
									function(err, row) {
										if (err) throw err;
										pool.query('SELECT skill_name FROM user_skills WHERE user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].profiles.id,
											function(err, result) {
												if (err) throw err;
												if (row[0]) {
													data[index].profiles.followers 	= followers[0].followers;
													data[index].profiles.following 	= following[0].following;
													data[index].profiles.user_id 	= row[0].id;
													data[index].profiles.skills 		= result;
													data[index].profiles.username 	= row[0].username;
													newCardProfile.push(data[index]);
													return recursive(index + 1);
												} else
													return recursive(index + 1);
											});
								});
						});
				});
		    } else { 
		    	console.log(newCardProfile);
				return callback(newCardProfile);
		    }
		};
		recursive(0);
    } else {
    	return callback([]);
    }
};
