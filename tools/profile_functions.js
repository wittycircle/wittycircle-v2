/*** Meet tool function ***/
var _  = require('underscore');

exports.sortCardProfile = function(data, callback) {
    if (data[0]) {
		function recursive(index) {

		    if (data[index] && data[index] !== null && typeof data[index] !== "undefined") {
		    	if (typeof data[index] === "string") {
		    		return recursive(index + 1);
		    	}
		    	pool.query('select u.id, u.username, uf.uf_count, fu.fu_count, r.rank from users as u left join (select follow_user_id, count(*) as uf_count from user_followers group by follow_user_id) as uf on u.id=uf.follow_user_id left join (select user_id, count(*) as fu_count from user_followers group by user_id) as fu on u.id=fu.user_id left join (select user_id, rank from rank_of_the_day) as r on u.id=r.user_id where profile_id = ?',
		    		data[index].id,
		    		function(err, result) {
		    			if (err) throw err;
		    			pool.query('SELECT skill_name FROM user_skills WHERE user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
		    				function(err, result2) {
		    					if (err) throw err;
		    					data[index].followers 	= result[0].uf_count;
								data[index].following 	= result[0].fu_count;
								data[index].user_id 	= result[0].id;
								data[index].skills 		= result2;
								data[index].username 	= result[0].username;
								data[index].myRank 		= result[0] ? result[0].rank : null;
								return recursive(index + 1);
		    				});
		    		});
				// pool.query('SELECT count(*) as followers FROM user_followers WHERE follow_user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
				//     function(err, followers) {
				//         if (err) throw err;
				//         pool.query('SELECT count(*) as following FROM user_followers WHERE user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
				// 		    function(err, following) {
				// 				if (err) throw err;
				// 				pool.query('SELECT id, username FROM users WHERE profile_id = ?', data[index].id,
				// 					function(err, row) {
				// 						if (err) throw err;
				// 						pool.query('SELECT skill_name FROM user_skills WHERE user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
				// 							function(err, result) {
				// 								if (err) throw err;
				// 								if (row[0]) {
				// 									pool.query('SELECT rank FROM rank_of_the_day WHERE user_id = ?', row[0].id, 
				// 										function(err, done) {
				// 											if (err) throw err;
				// 											data[index].followers 	= followers[0].followers;
				// 											data[index].following 	= following[0].following;
				// 											data[index].user_id 	= row[0].id;
				// 											data[index].skills 		= result;
				// 											data[index].username 	= row[0].username;
				// 											data[index].myRank 		= done[0] ? done[0].rank : null;
				// 											return recursive(index + 1);
				// 										});
				// 								} else
				// 									return recursive(index + 1);
				// 							});
				// 				});
				// 		});
				// });
		    } else {
				return callback(data);
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
			if (data[index].profiles) {
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
													if (result[0])
														var arr = result.map(function(el) { return el.skill_name})
														pool.query('SELECT rank FROM rank_of_the_day WHERE user_id = ?', data[index].user_id, 
															function(err, done) {
																if (err) throw err;

																data[index].followers 	= followers[0].followers;
																data[index].following 	= following[0].following;
																data[index].user_id 	= row[0].id;
																data[index].skills 		= _.difference(arr, data[index].skill);
																data[index].username 	= row[0].username;
																data[index].myRank 		= done[0] ? done[0].rank : null;
																newCardProfile.push(data[index]);

																return recursive(index + 1);
														});
												} else
													return recursive(index + 1);
											});
								});
						});
				});
			}
		    } else { 
				return callback(newCardProfile);
		    }
		};
		recursive(0);
    } else {
    	return callback([]);
    }
};

exports.getUsernameByProfileId = function(profile_id, callback) {
	if (profile_id) {
		pool.query('SELECT username FROM users WHERE profile_id = ?', profile_id,
			function(err, result) {
				if (err) throw err;
				if (result[0]) {
					return callback(result[0].username)
				} else
					return callback(null);
			});
	} else
		return callback(null);
};
