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
pool.query('SELECT invite_email FROM invitation WHERE user_id = ? AND status = "registed"', user_id,
		   function(err, result) {
		   if (err) throw err;
		   else {

		   var usersInvite = [];
		   function recursive(index) {
		   if (result[index]) {
		   pool.query('SELECT profile_id, username FROM users WHERE email = ?', result[index].invite_email,
				      function(err, result2) {
				      if (err) throw err;
				      else {
				      if (result2[0]) {
				      pool.query('SELECT first_name, last_name, profile_picture FROM profiles WHERE id = ?', result2[0].profile_id,
							 function(err, result3) {
							 if (err) throw err;
							 else {
							 usersInvite.push({
									  username: result2[0].username,
									  first_name: result3[0].first_name,
									  last_name : result3[0].last_name,
									  profile_picture : result3[0].profile_picture
									  });
							 return recursive(index + 1);
							 }
							 });
				      } else
				      return recursive(index + 1);
				      }
				      });
		   } else
		   return callback(result.length, usersInvite);
		   };
		   recursive(0);
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
				    
				    getCountSuccessInvitation(user_id, function(nInvit, users) {
					rankObject.successInvitation = nInvit;
					rankObject.inviteUsers = users;
					
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
		       } else {
			   pool.query('DELETE FROM rank_of_the_day', 
				      function(err, done) {
					  if (err) throw err;
					  else {
					      pool.query('SELECT user_id, @curRank := @curRank + 1 AS rank FROM profile_ranking, (SELECT @curRank := 0) r WHERE DATE(creation_date) = curdate() ORDER BY points DESC',
							 function(err, result) {
							     if (err) throw err;
							     else {
								 function recursive(index) {
								     if (result[index]) {
									 pool.query('INSERT INTO rank_of_the_day SET ?', result[index],
										    function(err, result2) {
											if (err) throw err;
											else
											    recursive(index + 1);
										    })
								     } else 
									 return ;
								 };
								 recursive(0);
							     }
							 });
					  }
				      });
		       }
		   };
		   recursive(0);
	       });
};

function compareRank(user_id, newRank, callback) {
    pool.query('SELECT points, rank FROM (SELECT points, user_id, @curRank := @curRank + 1 AS rank FROM profile_ranking, (SELECT @curRank := 0) r WHERE DATE(creation_date) = curdate() - 1 ORDER BY points DESC) x WHERE user_id = ?', user_id,
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
    cronTime: '00 00 17 * * 0-6',
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
	pool.query('SELECT points, rank FROM (SELECT points, user_id, @curRank := @curRank + 1 AS rank FROM profile_ranking, (SELECT @curRank := 0) r WHERE DATE(creation_date) = curdate() ORDER BY points DESC) x WHERE user_id = ?', req.body.user_id,
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
	var user_id = req.user.id;
	getAllProfileRank(user_id, function(object) {
	    return res.status(200).send({success: true, data: object});
	});
	
    } else
	return res.status(403).send("FORBIDDEN");
};

exports.getProfileAllTimeRank = function(req, res) {
    pool.query("SELECT count(*) as number FROM profile_ranking WHERE user_id = ? ORDER BY creation_date", req.user.id,
	       function(err, result) {
		   if (err) throw err;
		   else {
		       if (result[0]) {
			   var rankArr = [];
			   function recursive(index) {
			       if (index < result[0].number - 1) {
				   if (!index)
				       var curdate = "CURDATE()"
				   else 
				       var curdate = "CURDATE() - INTERVAL " + index + " DAY";
				   pool.query('SELECT creation_date, rank FROM (SELECT creation_date, user_id, @curRank := @curRank + 1 AS rank FROM profile_ranking, (SELECT @curRank := 0) r WHERE DATE(creation_date) = ' + curdate + ' ORDER BY points DESC) x WHERE user_id = ?', req.user.id,
					      function(err, result2) {
						  if (err) throw err;
						  else {
						      
						      if (result2[0])
							  rankArr.unshift({rank: result2[0].rank, date: result2[0].creation_date});
						      return recursive(index + 1);
						  }
					      });
			       } else {
				   var numberArr = rankArr.map( function(el) { return el.rank; });
				   var maxum = Math.max.apply(Math, numberArr);
				   var minum = Math.min.apply(Math, numberArr);
				   return res.status(200).send({success: true, data: rankArr, min: minum, max: maxum});
			       }
			   };
			   recursive(0);
		       } else
			   return res.status(200).send({success: false});
		   }
	       });
};
