
/*** STATISTICS OF WITTYCIRCLE ***/
exports.getAllStatistics = function(req, res) {
	pool.query('SELECT count(*) AS number FROM profiles', 
		function(err, result) {
			if (err) throw err;
			pool.query("SELECT count(*) AS number FROM projects WHERE picture IS NOT NULL AND picture != '' AND post != '' AND post IS NOT NULL",
				function(err, result2) {
					if (err) throw err;
					pool.query('SELECT count(*) AS number FROM projects',
						function(err, result3) {
							if (err) throw err;
							pool.query('SELECT count(*) AS number FROM users WHERE date(last_activity) is not null && date(last_activity) = curdate()', 
								function(err, result4) {
									if (err) throw err;
									pool.query('SELECT count(*) AS number FROM messages',
										function(err, result5) {
											if (err) throw err;
											pool.query('SELECT count(*) AS number FROM views',
												function(err, result6) {
													if (err) throw err;
													pool.query('SELECT count(*) AS number FROM user_followers',
														function(err, result7) {
															if (err) throw err;
															pool.query('SELECT count(*) AS number FROM project_followers',
																function(err, result8) {
																	if (err) throw err;
																	var data = {
																		numUsers  		: result[0].number,
																		numComProjects	: result2[0].number,
																		numProjects 	: result3[0].number,
																		numTodayActive 	: result4[0].number,
																		numMessages 	: result5[0].number,
																		numViews 		: result6[0].number,
																		numFollows 		: result7[0].number,
																		numUpvote 		: result8[0].number
																	};
																	return res.status(200).send({success: true, data: data});
																});
														});
												});
										});
								});
						});
				});
		});
};

/*** PROFILE COMPLETE ***/
function profileComplete(callback) {
	pool.query('SELECT user_id FROM user_skills WHERE user_id IN (SELECT user_id FROM user_experiences GROUP BY user_id) GROUP BY user_id',
		function(err, result) {
			if (err) throw err;
			else {
				var arr = result.map( function(el) { return el.user_id; })
				pool.query("SELECT count(*) AS number FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id IN (" + arr + ")) && (DESCRIPTION != '' && DESCRIPTION is not null)",
					function(err, result2) {
						if (err) throw err;
						else 
							return callback(result2);
					})
			}
		});
};

exports.getStatisticAboutUsers = function(req, res) {
	pool.query("SELECT count(*) AS number FROM profiles WHERE fake = 0", 
		function(err, result) {
			if (err) throw err;
			profileComplete(function(result2) {

			});
		});
};