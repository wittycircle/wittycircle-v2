var CronJob = require('cron').CronJob;

function getStartedProjects(user_id, callback) {
	pool.query('SELECT count(*) AS number FROM projects WHERE creator_user_id = ?', user_id,
		function(err, result) {
			if (err) throw err;
			else
				return callback(result[0].number);

		});
};

function getCountFeedback(user_id, callback) {
	pool.query('SELECT count(*) AS number FROM ask_replies WHERE user_id = ?', user_id,
		function(err, result) {
			if (err) throw err;
			else {
				pool.query('SELECT count(*) AS number2 FROM feedback_replies WHERE user_id = ?', user_id,
					function(err, result2) {
						if (err) throw err;
						else {
							return callback(result[0].number + result2[0].number2);
						} 
					});
			}
		});
};

function getCountFollow(user_id, callback) {
	pool.query('SELECT count(*) AS number FROM user_followers WHERE user_id = ?', user_id,
		function(err, result) {
			if (err) throw err;
			else {
				pool.query('SELECT count(*) AS number2 FROM user_followers WHERE follow_user_id = ?', user_id,
					function(err, result2) {
						if (err) throw err;
						else {
							return callback(result[0].number, result2[0].number2);
						}
					});
			}
		});
};

function getCountUpvotedProjects(user_id, callback) {
	pool.query('SELECT count(*) AS number FROM project_followers WHERE user_id = ?', user_id,
		function(err, result) {
			if (err) throw err;
			else {
				return callback(result[0].number);
			}
		})
};

function getCountReceivedMessage(user_id, callback) {
	pool.query('SELECT count(*) AS number FROM messages WHERE to_user_id = ?', user_id, 
		function(err, result) {
			if (err) throw err;
			else {
				return callback(result[0].number);
			}
		})
};

function getCountProfileViews(user_id, callback) {
	pool.query('SELECT views FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', user_id,
		function(err, result) {
			if (err) throw err;
			else {
				return callback(result[0].views);
			}
		});
};

function getProfileCompletePercentage(user_id, callback) {
	pool.query('SELECT count(*) as number FROM user_skills WHERE user_id = ?', user_id,
		function(err, result) {
			if (err) throw err;
			else {
				var pPer = result[0].number ? 20 : 0;

				pool.query('SELECT count(*) as number FROM user_experiences WHERE user_id = ?', user_id,
					function(err, result2) {
						if (err) throw err;
						else {
							pPer += result2[0].number ? 40 : 0;

							pool.query('SELECT description FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', user_id,
								function(err, result3) {
									if (err) throw err;
									else {
										pPer += result3[0].description ? 20 : 0;

										pool.query('SELECT count(*) as number FROM user_interests WHERE user_id = ?', user_id,
											function(err, result4) {
												if (err) throw err;
												else {
													pPer += result4[0].number ? 20 : 0;
													return callback(pPer);
												}
											});
									}
								});
						}
					});
			}
		});
};

function getSuccessSocialSharing(user_id, callback) {
	pool.query('SELECT social_share FROM users WHERE id = ?', user_id, 
		function(err, result) {
			if (err) throw err;
			else {
				var ssPer = result[0].social_share ? 100 : 0;
				return callback(ssPer);
			}
		});
};

function getCountSuccessInvitation(user_id, callback) {
	pool.query('SELECT count(*) as number FROM invitation WHERE user_id = ? AND status = "registed"', user_id,
		function(err, result) {
			if (err) throw err;
			else {
				return callback(result[0].number);
			}
		});
};

function getAllProfileRank(user_id, callback) {
	var rankObject = {};
	
	getStartedProjects(user_id, function(stProject) {
		rankObject.startedProject = stProject;

		getCountFeedback(user_id, function(fdProject) {
			rankObject.feedbackProject = fdProject;

			getCountFollow(user_id, function(flUser, userFl) {
				rankObject.followUser = flUser;
				rankObject.userFollowed = userFl;

				getCountUpvotedProjects(user_id, function(upProject) {
					rankObject.upvotedProject = upProject;

					getCountReceivedMessage(user_id, function(rvMessage) {
						rankObject.receivedMessage = rvMessage;

						getCountProfileViews(user_id, function(viewProfile) {
							rankObject.profileViews = viewProfile;

							getProfileCompletePercentage(user_id, function(pPer) {
								rankObject.profilePercentage = pPer;

								getSuccessSocialSharing(user_id, function(ssPer) {
									rankObject.socialPercentage = ssPer;

									getCountSuccessInvitation(user_id, function(nInvit) {
										rankObject.successInvitation = nInvit;

										return callback(rankObject);
									});
								});
							});
						});
					});
				});
			});
		});
	});
};

function getRankPoints(object, callback) {
	var totalPoint = Math.round((object.startedProject * 10) + (object.feedbackProject * 50) + object.followUser + (object.userFollowed * 2) + (object.upvotedProject * 40) 
	+ (object.receivedMessage * 10) + (object.profileViews * 0.5) + (object.profilePercentage * 10) + (object.socialPercentage + 300) + (object.successInvitation * 500));

	callback(totalPoint);
};

function registeAllRank() {
	pool.query('SELECT id FROM users', 
		function(err, result) {
			if (err) throw err;
			function recursive(index) {
				if (result[index]) {
					getAllProfileRank(result[index].id, function(object) {
						getRankPoints(object, function(points) {
							var new_object = {
								user_id: result[index].id,
								points: points
							};
							pool.query('INSERT INTO profile_ranking SET ?', new_object,
								function(err, done) {
									if (err) throw err;
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

function compareRank(user_id, newRank, callback) {
	pool.query('SELECT points, FIND_IN_SET( points, ( SELECT GROUP_CONCAT( DISTINCT points ORDER BY points DESC ) FROM profile_ranking ) ) AS rank FROM profile_ranking WHERE points >= 1000 && DATE(creation_date) = CURDATE() - 1 && user_id = ? ORDER BY rank', user_id,
		function(err, result) {
			if (err) throw err;
			else {
				if (result[0]) {
					var compareRank = newRank - result[0].rank;
					if (compareRank >= 0)
						return callback(0);
					else
						return callback(-compareRank);
				} else {
					return callback(0)
				}
			}
		});
};

var job = new CronJob({
  cronTime: '00 33 10 * * 0-6',
  onTick: function() {
    registeAllRank();
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
job.start();

exports.getProfileStatisticRank = function(req, res) {

	req.checkBody('user_id', 'Error Message').isInt();
	var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query('SELECT points, FIND_IN_SET( points, ( SELECT GROUP_CONCAT( DISTINCT points ORDER BY points DESC ) FROM profile_ranking ) ) AS rank FROM profile_ranking WHERE points >= 1000 && user_id = ? && DATE(creation_date) = CURDATE() ORDER BY rank', req.body.user_id,
		function(err, result) {
			if (err) throw err;
			else {
				if (!result[0])
					return res.status(200).send({success: true, rank: "-"});
				else {
					compareRank(req.body.user_id, result[0].rank, function(compare) {
						return res.status(200).send({success: true, rank: result[0].rank, compareR: compare});
					});
				}
			}
		});
    }
};

exports.getProfileRank = function(req, res) {
	if (req.isAuthenticated()) {
		var	user_id = req.user.id;
			
			getAllProfileRank(user_id, function(object) {
				return res.status(200).send({success: true, data: object});
			});

	} else
		return res.status(403).send("FORBIDDEN");	
};