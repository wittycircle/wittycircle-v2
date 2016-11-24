/**** DISCUSSION ****/

function getUsersInformation(user_id, callback) {
	pool.query('SELECT profile_id, username FROM users WHERE id = ?', user_id,
		function(err, result) {
			if (err) throw err;
			else {
				pool.query('SELECT first_name, last_name, profile_picture FROM profiles WHERE id = ?', result[0].profile_id,
					function(err, result2) {
						if (err) throw err;
						else {
							var object = {
								username 	: result[0].username,
								first_name 	: result2[0].first_name,
								last_name 	: result2[0].last_name,
								picture 	: result2[0].profile_picture
							};
							return callback(object);
						}
					});
			}
		});
};

/*** GET PROJECT DISCUSSIONS ***/
exports.getProjectsDiscussion = function(req, res) {
	/* Validation */
    req.checkParams('project_id', 'Error Message').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query('SELECT * FROM project_discussion WHERE project_id = ? ORDER BY creation_date', req.params.project_id,
    		function(err, result) {
    			if (err) throw err;
    			function recursive(index) {
    				if (result[index]) {
    					getUsersInformation(result[index].user_id, function(user_info) {
    						result[index].user_info = user_info;
	    					pool.query('SELECT * FROM project_discussion_replies WHERE project_discussion_id = ?', result[index].id,
	    						function(err, result2) {
	    							if (err) throw err;
	    							var new_array = [];
	    							function recursive2(index2) {
	    								if (result2[index2]) {
	    									getUsersInformation(result2[index2].user_id, function(user_info2) {
	    										result2[index2].user_info2 = user_info2;
	    										new_array.push(result2[index2]);
	    										return recursive2(index2 + 1);
	    									});
	    								} else {
	    									result[index].comments = new_array;
	    									return recursive(index + 1);
	    								}
	    							};
	    							recursive2(0);
	    						});
	    				});
    				} else
    					return res.status(200).send({success: true, data: result});
    			};
    			recursive(0);
    		});
    }
};

/*** ADD PROJECT DISCUSSION ***/
exports.postNewProjectDiscussion = function(req, res) {
	/* Validation */
    req.checkBody('user_id', 'Error Message').isInt();
    req.checkBody('project_id', 'Error Message').isInt();
    req.checkBody('title', 'Error Message').isString();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query('INSERT INTO project_discussion SET ?', req.body,
    		function(err, result) {
    			if (err) throw err;
    			return res.status(200).send({success: true, insertId: result.insertId})
       		});
    }
};

/*** UPDATE PROJECT DISCUSSION ***/
exports.updateProjectDiscussion = function(req, res) {
	/* Validation */
    req.checkBody('discuss_id', 'Error Message').isInt();
    req.checkBody('title', 'Error Message').isString();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query('SELECT user_id FROM project_discussion WHERE id = ?', req.body.discuss_id,
    		function(err, check) {
    			if (err) throw err;
    			if (check[0]) {
    				if (req.user.id === check[0].user_id) {
    					var updateObject = {
    						title 	: req.body.title,
    						message : req.body.message
    					};
    					pool.query('UPDATE project_discussion SET ? WHERE id = ?', [updateObject, req.body.discuss_id],
    						function(err, result) {
    							if (err) throw err;
    							else
    								return res.status(200).send({success: true});
    						});
    				} else
				    	return res.status(404).send("FORBIDDEN!");
    			} else
    				return res.status(400).send("NOT FOUND");
    		});
    }
};

/*** DELETE PROJECT DISCUSSION ***/
exports.deleteProjectDiscussion = function(req, res) {
	/* Validation */
    req.checkParams('discuss_id', 'Error Message').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query('SELECT user_id FROM project_discussion WHERE id = ?', req.params.discuss_id,
    		function(err, check) {
    			if (err) throw err;
    			if (check[0]) {
	    			if (req.user.id === check[0].user_id) {
				    	pool.query('DELETE FROM project_discussion WHERE id = ?', req.params.discuss_id,
				    		function(err, result) {
				    			if (err) throw err;
				    			else
				    				return res.status(200).send({success: true});
				    		});
				    } else
				    	return res.status(404).send("FORBIDDEN!");
				} else
					return res.status(400).send("NOT FOUND!");
		    });
    }
};

/*** ADD PROJECT DISCUSSION REPLY ***/
exports.postNewProjectDiscussionReply = function(req, res) {
	/* Validation */
    req.checkBody('user_id', 'Error Message').isInt();
    req.checkBody('project_discussion_id', 'Error Message').isInt();
    req.checkBody('message', 'Error Message').isString();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query('INSERT INTO project_discussion_replies SET ?', req.body,
    		function(err, result) {
    			if (err) throw err;
    			return res.status(200).send({success: true, insertId: result.insertId});
    		});
    }
};

/*** UPDATE PROJECT DISCUSSION REPLY***/
exports.updateProjectDiscussionReply = function(req, res) {
	/* Validation */
    req.checkBody('pdr_id', 'Error Message').isInt();
    req.checkBody('message', 'Error Message').isString();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query('SELECT user_id FROM project_discussion_replies WHERE id = ?', req.body.pdr_id,
    		function(err, check) {
    			if (err) throw err;
    			if (check[0]) {
    				if (req.user.id === check[0].user_id) {
    					pool.query('UPDATE project_discussion_replies SET message = ? WHERE id = ?', [req.body.message, req.body.pdr_id],
    						function(err, result) {
    							if (err) throw err;
    							return res.status(200).send({success: true});
    						})
    				} else
				    	return res.status(404).send("FORBIDDEN!");
    			} else
    				return res.status(400).send("NOT FOUND");
    		});
    }
};

/*** DELETE PROJECT DISCUSSION REPLY ***/
exports.deleteProjectDiscussionReply = function(req, res) {
	/* Validation */
    req.checkParams('pdr_id', 'Error Message').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query("SELECT user_id FROM project_discussion_replies WHERE id = ?", req.params.pdr_id,
    		function(err, check) {
    			if (err) throw err;
    			if (check[0]) {
    				if (req.user.id === check[0].user_id) {
    					pool.query('DELETE FROM project_discussion_replies WHERE id = ?', req.params.pdr_id,
    						function(err, result) {
    							if (err) throw err;
    							return res.status(200).send({success: true});
    						});
    				} else
				    	return res.status(404).send("FORBIDDEN!")
    			} else
    				return res.status(400).send("NOT FOUND");
    		});
    }
};







