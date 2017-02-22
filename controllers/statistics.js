
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

/*** INVITATION LINK ***/

exports.verifyShareInviteLink = function(req, res) {
	req.checkParams('invite_id', 'Error Message').isString();

    var errors = req.validationErrors(true);
    if (errors) {
		return res.status(400).send(errors);
    } else {
    	pool.query('SELECT user_id FROM share_invite_link WHERE invite_id = ?', req.params.invite_id,
    		function(err, result) {
    			if (err) throw err;
    			if (result[0]) {
    				pool.query('SELECT first_name, last_name, profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', result[0].user_id,
    					function(err, result2) {
    						if (err) throw err;
    						return res.status(200).send({success: true, info: result2[0]});
    					});
    			} else
    				return res.status(404).send(false);
    		});
    }
};

exports.getShareInviteLink = function(req, res) {
	req.checkParams('user_id', 'Error Message').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
		return res.status(400).send(errors);
    } else {
    	pool.query('SELECT invite_id FROM share_invite_link WHERE user_id = ?', req.params.user_id,
    		function(err, result) {
    			if (err) throw err;
    			if (!result[0]) return res.status(400).send('ERROR');
    			return res.status(200).send('invite/' + result[0].invite_id);
    		});
    }
};


function setInviteLink() {
	pool.query('SELECT id, first_name, last_name FROM profiles',
		function(err, result) {
			function recursive(index) {
				if (result[index]) {
					pool.query('SELECT id FROM users WHERE profile_id = ?', result[index].id,
						function(err, result2) {

							// parametre invite_id
							var invite_id = result[index].first_name.replace(/ /g,'') + result[index].last_name.replace(/ /g,'') + '_W';
							pool.query('SELECT count(*) AS number FROM share_invite_link WHERE invite_id like "' + invite_id + '%"', invite_id,
								function(err, result3) {
									if (!result3[0].number)
										invite_id = invite_id + 1;
									else
										invite_id = invite_id + (result3[0].number + 1);
									pool.query('INSERT INTO share_invite_link SET user_id = ?, invite_id = ?', [result2[0].id, invite_id],
										function(err, done) {
											return recursive(index + 1);
										});
								});
						});
				} else
				 	return ;
			};
			recursive(0);
		});
};

