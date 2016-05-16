var tf            = require('../tools/project_functions');
var algoliaClient = require('../algo/algolia').algoliaClient;
var Project       = algoliaClient.initIndex('Projects');
var _             = require('underscore');
var mandrill      = require('mandrill-api/mandrill');


/*** TOOL FUNCTION ***/
function getUsername(elem, callback) {
    if (elem) {
        pool.query("SELECT first_name, last_name from profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)", elem,
            function(err, data) {
                if (err) {
                    console.log(new Date());
                    throw err;
                }
                callback(data[0].first_name + " " + data[0].last_name);
            });
    } else
        callback(null);
};

function getProjectTitle(elem, callback) {
    if (elem) {
        pool.query("SELECT title FROM projects WHERE id = ?", elem,
            function(err, data) {
                if (err) {
                    console.log(new Date());
                    throw err;
                }
                callback(data[0].title);
            })
    } else
        callback(null);
};

function sortListProject(list, callback) {
    if (list[0]) {
        var newList = [];
        function recursive(index) {
            if (list[index]) {
                getUsername(list[index].invited_by, function(name) {
                    getProjectTitle(list[index].project_id, function(pName) {
                        if (name && pName) {
                            newList.push({
                                user_id: list[index].user_id,
                                user_notif_id: list[index].invited_by,
                                user_notif_username: name,
                                project_id: list[index].project_id,
                                project_title: pName,
                                type: 'p_involve',
                                creation_date: list[index].creation_date,
                                timestamp: list[index].creation_date.getTime()
                            });
                            recursive(index + 1);
                        }
                    });
                });
            } else
                callback(newList);
        };
        recursive(0);
    } else
        callback(false);
};

exports.getMyInvolvedProject = function(req, res, callback) {
    pool.query("SELECT * FROM project_users WHERE user_id = ?", req.user.id, function(err, data) {
        if (err) {
            console.log(new Date());
            throw err;
        }
        sortListProject(data, function(newData) {
            callback(newData);
        });
    });
};

exports.getProjects = function(req, res){
    pool.query("SELECT * FROM `projects` WHERE project_visibility = 1 ORDER BY view DESC",
    function (err, results, fields) {
        if (err) {
	    var date = new Date();
	    console.log(date);
	    console.log("Error getting projects in projects.js/getProjects" + "\n");
	    throw err;
	}
	tf.sortProjectCard(results, function(data) {
	    if (!data)
		res.send({message: 'No projects has been found'});
	    else
		res.send(data);
	});
    });
};

exports.getProjectsDiscover = function(req, res){
    pool.query('SELECT * FROM `projects` WHERE project_visibility = 1 AND picture_card != "" ORDER BY view DESC',
    function (err, results, fields) {
        if (err) {
        var date = new Date();
        console.log(date);
        console.log("Error getting projects in projects.js/getProjects" + "\n");
        throw err;
    }
    tf.sortProjectCard(results, function(data) {
        if (!data)
        res.send({message: 'No projects has been found'});
        else
        res.send(data);
    });
    });
};

exports.getProject = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `projects` WHERE `id` = ?",
        [req.params.id],
        function (err, results, fields) {
            if(err){
        		var date = new Date();
        		console.log(date);
        		console.log("Error getting a project in projects.js/getProject" + "\n");
                throw err;
            }
            if (results[0]) {
                var uid = results[0].creator_user_id;
                pool.query("SELECT profile_picture_icon FROM profiles where id = (SELECT profile_id FROM users WHERE id = ?)",
                [uid],
                function (eror, rez) {
                    if (eror) {
                        throw eror;
                    }
                    results[0].creator_user_picture = rez[0].profile_picture_icon;
                    res.send(results);
                });
            }
        });
    }
};

exports.getProjectByPublicId = function(req, res){
    req.checkParams('public_id', 'public_id must be an integrer').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
	return res.status(400).send(errors);
    } else {
	pool.query("SELECT * FROM projects WHERE public_id = ?",
	[req.params.public_id],
	function (err, results) {
	    if (err) {
		var date = new Date();
		console.log(date);
		console.log("Error getting a project by public id in projects.js/getProjectByPublicId" + "\n");
		throw err;
	    }
	    if (results[0]) {
		var uid = results[0].creator_user_id;
		pool.query("SELECT profile_picture_icon FROM profiles where id = (SELECT profile_id FROM users WHERE id = ?)",
			   [uid],
			   function (eror, rez) {
			       if (eror) {
				   throw eror;
			       }
			       results[0].creator_user_picture = rez[0].profile_picture_icon;
			       res.send(results);
			   });
	    }
	});
    }
};

exports.getProjectsFromCategory = function(req, res){
    req.checkParams('category_id', 'Category id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `projects` WHERE `category_id` = ?",  [req.params.category_id],
        function (err, results, fields) {
            if(err) {
		var date = new Date();
		console.log(date);
		console.log("Error getting projects for mcategory in projects.js/getProjectsFromcCategory" + "\n");
		throw err;
	    }
            tf.sortProjectCard(results, function(data) {
		if (!data)
		    res.status(400).send('Error');
		else
		    res.send(data);
	    });
        });
    }
};

exports.getProjectsCreatedByUser = function(req, res){
    req.checkParams('user_id', 'User id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    }
    else {
        if (req.user && req.user.id == req.params.user_id) {
            pool.query("SELECT * FROM `projects` WHERE `creator_user_id` = ?",
            [req.params.user_id],
            function (err, results, fields) {
                if (err) {
            		var date = new Date();
            		console.log(date);
            		console.log("Error getting projects in projects.js/getProjectsCreatedByUser" + "\n");
            		throw err;
    	       }
        	    if (results[0]) {
                    pool.query("SELECT * FROM `projects` WHERE `id` IN (SELECT `project_id` FROM `project_users` WHERE `user_id` = ?)",
                    [req.params.user_id],
                    function (eror, rez) {
                        for (var i = rez.length - 1; i >= 0; i--) {
                            results.push(rez[i]);
                        }
                        tf.sortProjectCard(results, function(data) {
                            if (!data)
                                return res.status(400).send('Error00');
                            else {
                                tf.addUserPictureToProject(data, function (rez) {
                                  if (!rez)
                                    return res.status(400).send('Error01');
                                  else
                                    return res.send(rez);
                                })
                            }
                        });
                    });
        	    }
		if (!results[0]) {
		  pool.query("SELECT * FROM `projects` WHERE `id` IN (SELECT `project_id` FROM `project_users` WHERE `user_id` = ?)",
                    [req.params.user_id],
                    function (eror, rez) {
			if (eror) {
			    console.log(new Date());
			    throw err;
			}
                        for (var i = rez.length - 1; i >= 0; i--) {
                            results.push(rez[i]);
                        }
                        tf.sortProjectCard(results, function(data) {
                            if (!data)
                                return res.send([]);
                            else {
                                tf.addUserPictureToProject(data, function (rez) {
                                  if (!rez)
                                    return res.send('Error01');
                                  else {
                                    return res.send(rez);
				  }
                                })
                            }
                        });
                    });
		}
		/*else {
        		    return res.send(results);
			}*/
            });
        } else {
            pool.query('SELECT * FROM `projects` WHERE `creator_user_id` = ? AND project_visibility = 1 ',
            [req.params.user_id],
            function (err, results, fields) {
                if (err) {
                    var date = new Date();
                    console.log(date);
                    console.log("Error getting projects in projects.js/getProjectsCreatedByUser" + "\n");
                    throw err;
               }
                if (results[0]) {
                    pool.query("SELECT * FROM `projects` WHERE `id` IN (SELECT `project_id` FROM `project_users` WHERE `user_id` = ? AND n_accept = 1) AND project_visibility = 1",
                    [req.params.user_id],
                    function (eror, rez) {
                        for (var i = rez.length - 1; i >= 0; i--) {
                            results.push(rez[i]);
                        };
                        tf.sortProjectCard(results, function(data) {
                          if (!data)
                              return res.status(400).send('Error1');
                          else {
                              tf.addUserPictureToProject(data, function (rez) {
                                if (!rez)
                                  return res.status(400).send('Error2');
                                else
                                  return res.send(rez);
                              })
                          }
                        });
                    });
                } else {
                    pool.query("SELECT * FROM `projects` WHERE `id` IN (SELECT `project_id` FROM `project_users` WHERE `user_id` = ? AND n_accept = 1) AND project_visibility = 1",
                    [req.params.user_id],
                    function (eror, rez) {
                        tf.sortProjectCard(rez, function(data) {
                            if (!data)
                                return res.send(results);
                            else {
                                tf.addUserPictureToProject(data, function (rez) {
                                  if (!rez)
                                    {
                                        return res.status(400).send('Error3');
                                    }
                                  else
                                    return res.send(rez);
                                })
                            }
                        });
                    });
                }
            });
        }
    }
};

exports.getProjectsInvolvedByUser = function(req, res){
    req.checkParams('user_id', 'User id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `projects` WHERE `id` IN (SELECT `project_id` FROM `project_users` WHERE `user_id` = ?)",
        [req.params.user_id],
        function (err, results, fields) {
            if(err){
		var date = new Date();
		console.log(date);
		console.log("Error getting projects in projects.js/getProjectsInvolvedByUser" + "\n");
                throw err;
            }
            res.send(results);
        });
    }
};

exports.getInvolvedUserOfProject = function(req, res){
    req.checkParams('project_id', 'Project id parameter must be an integrer').isInt().min(1);

    var errors = req.validationErrors(true);
    if (errors) {
	   return res.status(400).send(errors);
    } else {
    	pool.query("SELECT * FROM project_users where project_id = ?",
    	[req.params.project_id],
    	function (err, results) {
    	    if (err) {
    		  throw err;
    	    }
    	    res.send(results);
    	});
    }
};

exports.getAllUsersInvolvedByPublicId = function(req, res) {
  req.checkParams('public_id', 'Public id parameter must be an integrer').isInt().min(1);

  var errors = req.validationErrors(true);
  if (errors) {
    return res.status(400).send(errors);
  } else {
    pool.query("SELECT * FROM project_users WHERE project_id = (SELECT id FROM projects WHERE public_id = ?)",
    req.params.public_id,
    function(er, results) {
      if (er) {
        console.log(new Date());
        console.log('eror in getAllUsersInvolvedByPublicId');
        throw er;
      } else {
        var editable = false;
        var show     = false;
        var involver = [];
        var userIn   = [];
        function recursive (index) {
            if(results[index]) {
                if (req.isAuthenticated() && results[index].user_id === req.user.id && results[index].n_accept === 0) {
                  show = true;
                  pool.query("SELECT * FROM `profiles` WHERE `id` IN (SELECT `profile_id` FROM `users` WHERE `id` = ?)",
                  [results[index].invited_by],
                  function (err, result) {
                      if(err){
                          throw err;
                      }
                      involver.push(result[0]);
                      recursive(index + 1);
                  });
                }
                if (req.isAuthenticated() && results[index].user_id === req.user.id && results[index].n_accept === 1) {
                  editable = true;
                }
                if (results[index].n_accept === 1) {
                  pool.query("SELECT * FROM `profiles` WHERE `id` IN (SELECT `profile_id` FROM `users` WHERE `id` = ?)",
                  [results[index].user_id],
                  function (err, result, field) {
                      if(err){
                          throw err;
                      }
                      results.splice(index, 1);
                      userIn.push(result[0]);
                      recursive(index + 1);
                  });
                }
                if (req.user && results[index].user_id !== req.user.id && results[index].n_accept != 1) {
                  recursive(index + 1);
                }
		if (!req.isAuthenticated() && results[index].n_accept !== 1) {
		  recursive(index + 1);
		}
            } else {
                return res.send({content: results, editable: editable, show: show, involver: involver, userIn: userIn});
            }
        }
        recursive(0);
      }
    });
  }
}

exports.acceptInvolvment = function(req, res){
    req.checkParams('project_id', 'Project id must be a integrer').isInt().min(1);
    req.checkParams('user_id', 'User id must be an integrer').isInt().min(1);

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("UPDATE project_users SET n_accept = 1, n_read = 1 WHERE project_id = ? AND user_id = ?",
        [req.params.project_id, req.params.user_id],
        function (err, results) {
            if (err) {
                console.log(new Date());
                throw err;
            }
            res.send(results);
        });
    }
}

exports.declineInvolvment = function(req, res){
    req.checkParams('project_id', 'Project id must be a integrer').isInt().min(1);
    req.checkParams('user_id', 'User id must be an integrer').isInt().min(1);

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        //pool.query("UPDATE project_users SET n_accept = 0, n_read = 1 WHERE project_id = ? AND user_id = ?",
	pool.query("DELETE FROM project_users WHERE project_id = ? AND user_id = ?",
        [req.params.project_id, req.params.user_id],
        function (err, results) {
            if (err) {
                console.log(new Date());
                throw err;
            }
            res.send(results);
        });
    }
}

exports.deleteUserInvolved = function(req, res) {
    if (!req.isAuthenticated()) {
	res.status(404).send({message: "You need to be logged in to delete an involved user in your project"});
    }
    req.checkParams('project_id', 'Project_id must be an integrer').isInt().min(1);
    req.checkParams('user_id', 'User_id must be an integrer').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
	return res.status(400).send(errors);
    } else {
	pool.query("SELECT creator_user_id FROM projects WHERE id = ?",
		   [req.params.project_id],
		   function (err, result) {
	    if (err) {
		throw err;
	    }
	    pool.query("DELETE FROM project_users WHERE project_id = ? AND user_id = ?",
		[req.params.project_id, req.params.user_id],
			   function (err, result) {
		    if (err) {
			throw err;
		    }
		    algoliaClient.deleteIndex('Projects', function(error) {
			pool.query('SELECT * FROM projects', function(err, data) {
			    if (err) throw err;
			    Project.addObjects(data, function(err, content) {
				if (err) throw err;
				res.send(result);
			    });
			});
                    });

		});
	});
    }
};

exports.searchProjects = function(req, res){
    req.checkParams('search', 'Error Message').isString().max(128);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `projects` WHERE `title` LIKE '%" + req.params.search + "%' OR `description` LIKE '%" + req.params.search + "%'",
        function (err, results, fields) {
            if(err){
		var date = new Date();
		console.log(date);
		console.log("Error getting projects in projects.js/searchProjects" + "\n");
                throw err;
            }
            res.send(results);
        });
    }
};

exports.createProject = function(req, res){
    /* Validation */
    req.checkBody('public_id', 'Must be an integrer').isInt();
    req.checkBody('category_id', 'Error Message').isInt();
    req.checkBody('title', 'Error Message').isString().max(256);
    req.checkBody('description', 'Error Message').optional().isString().max(512);
    req.checkBody('location_city', 'Error Message').isString().max(64);
    req.checkBody('location_state', 'Error Message').optional().isString().max(64);
    req.checkBody('location_country', 'Error Message').isString().max(64);
    req.checkBody('picture', 'Error Message').optional().isString().max(128);
    req.checkBody('post', 'Error Message').optional().isString().max(10000);
    req.checkBody('status', 'Errror Message').isString().max(128);
    req.checkBody('creator_user_name','Error Message').isString().max(128);
    req.checkBody('creator_user_picture', 'Error Message');
    req.checkBody('picture_position', 'Error Message').optional().isString().max(128);
    req.checkBody('category_name').isString().max(128);

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        if(req.isAuthenticated()){
            req.body.creator_user_id = req.user.id;
            pool.query('INSERT INTO `projects` SET ?', req.body, function(err, result) {
                if (err){
        		    var date = new Date();
        		    console.log(date);
        		    console.log("Error getting projects in projects.js/createProject");
        		    console.log(err);
        		    console.log("\n");
                    throw err;
                } else {
                    pool.query("SELECT first_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)", req.user.id, 
                        function(err, data) {
                            if (err) throw err;
                            else {
                                console.log("New Project !!!");
                                var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                                var template_name = "new project";
                                var template_content = [{
                                    "name": "new project",
                                    "content": "content",
                                }];

                                var message = {
                                    "html": "<p>HTML content</p>",
                                    "subject": "Your project on Wittycircle",
                                    "from_email": "noreply@wittycircle.com",
                                    "from_name": "Wittycircle",
                                    "to": [{
                                        "email": req.user.email,
                                        "name": data[0].first_name,
                                        "type": "to"
                                    }],
                                    "headers": {
                                        "Reply-To": "message.reply@example.com"
                                    },
                                    "important": false,
                                    "track_opens": null,
                                    "track_clicks": null,
                                    "auto_text": null,
                                    "auto_html": null,
                                    "inline_css": null,
                                    "url_strip_qs": null,
                                    "preserve_recipients": null,
                                    "view_content_link": null,
                                    "tracking_domain": null,
                                    "signing_domain": null,
                                    "return_path_domain": null,
                                    "merge": true,
                                    "merge_language": "mailchimp",
                                    "global_merge_vars": [{
                                        "name": "merge1",
                                        "content": "merge1 content"
                                    }],
                                    "merge_vars": [
                                    {
                                        "rcpt": "maxencemasson.mm@gmail.com",
                                        "vars": [
                                        {
                                            "name": "fname",
                                            "content": data[0].first_name
                                        },
                                        {
                                            "name": "lname",
                                            "content": "Smith"
                                        }
                                        ]
                                    }
                                    ]
                                };
                                var async = false;
                                mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
                                    var date = new Date();
                                    console.log("MAIL at " + date + ":" + "\n" + "A new mail was sent to " + req.user.email);
                                }, function(e) {
                                    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                });
                                return res.send(result);
                            }
                        });
                }
            });
        } else {
            res.status(404).send({message: 'You need to login.'});
        }
    }
};

exports.updateProject = function(req, res){
    if(!req.isAuthenticated()){
	return res.status(400).send({message: 'You need to login'});
    }
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    req.checkBody('category_id', 'Error Message').isInt();
    req.checkBody('title', 'Error Message').isString().max(256);
    req.checkBody('description', 'Error Message').optional().isString().max(512);
    req.checkBody('location_city', 'Error Message').isString().max(64);
    req.checkBody('location_state', 'Error Message').optional().isString().max(64);
    req.checkBody('location_country', 'Error Message').isString().max(64);
    req.checkBody('picture', 'Error Message').optional().isString().max(128);
    req.checkBody('post', 'Error Message').optional().isString().max(10000);
    req.checkBody('main_video', 'Error Message').optional().isString().max(256);
    req.checkBody('picture_position', 'Error Message').optional().isString().max(128);
    req.checkBody('main_video_id', 'Error message').optional().isString().max(256);
    req.checkBody('picture_card', 'Error message').optional().isString().max(258);


    var errors = req.validationErrors(true);
    if (errors) {
        console.log(errors);
	return res.status(400).send(errors);
    } else {
        pool.query('UPDATE `projects` SET ? WHERE `id` = ' + req.params.id, req.body, function(err, result) {
            if (err) {
                var date = new Date();
                console.log(date);
                console.log("Error getting projects in projects.js/createProject");
                console.log(err);
                console.log("\n");
		throw err;
	    }
            algoliaClient.deleteIndex('Projects', function(error) {
                 pool.query('SELECT * FROM projects', function(err, data) {
                     if (err) throw err;
                     Project.addObjects(data, function(err, content) {
                        if (err) throw err;
                        res.send(result);
                    });
                 });
           	});
        });
    }
};

exports.getProjectOpenings = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `project_openings` WHERE `id` = ?",
        [req.params.id],
        function (err, results, fields) {
            if(err){
                var date = new Date();
                console.log(date);
                console.log("Error getting projects in projects.js/getProjectOpenings");
                console.log(err);
                console.log("\n");
                throw err;
            }
            function recursive(index){
                if(index !== results.length){
                    pool.query("SELECT * FROM `skills` WHERE `id` IN (SELECT `skill_id` FROM `opening_skills` WHERE `opening_id` = ?)",
                    [results[index].id],
                    function (err, result, field) {
                        if(err){
                            throw err;
                        }
                        results[index].skills = result;
                        recursive(index + 1);
                    });
                } else {
                    res.send(results);
                }
            }
            recursive(0);
        });
    }
};

exports.getProjectFeedbacks = function(req, res){
    req.checkParams('project_id', 'project_id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `project_feedbacks` WHERE `project_id` = ?",
        [req.params.project_id],
        function (err, results, fields) {
            if(err){
                var date = new Date();
                console.log(date);
                console.log("Error getting projects in projects.js/getProjectFeedbacks");
                console.log(err);
                console.log("\n");
                throw err;
            }
            res.send(results);
        });
    }
};

exports.getProjectFeedbacksPublic = function(req, res){
    req.checkParams('public_id', 'public_id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `project_feedbacks` WHERE `public_id` = ?",
        [req.params.public_id],
        function (err, results, fields) {
            if(err){
                var date = new Date();
                console.log(date);
                console.log("Error getting projects in projects.js/getProjectFeedbacksPublic");
                console.log(err);
                console.log("\n");
                throw err;
            }
            function recursive (index) {
              if (results[index]) {
                  pool.query('SELECT id, description, created_at, user_id FROM `feedback_replies` WHERE `feedback_id` = ?',
                  results[index].id,
                  function (err, response) {
                    if (err) {
                      console.log(new Date());
                      throw err;
                    }
                    /*if (response.length === 1) {
                      results[index].replies = response[0];
                  }*/
                    //if (response.length > 1) {
                      results[index].replies = response;
                    //}
                    recursive(index + 1);
                  });
              } else {
                  tf.addprofilestoFeedbacks(req.user, results, function(rez) {
                      if (!rez) {
                          return res.send(results);
                          //console.log('error');
                      } else {
                          return res.send(rez);
                      }
                  })
                  //return res.send(results);
              }
            }
            recursive(0);
        });
    }
};

exports.deleteProject = function(req, res){
    if (!req.isAuthenticated()) {
	res.status(400).send({message: "User is not logged in"});
    }
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
	return res.status(400).send(errors);
    } else {
	pool.query("SELECT * FROM projects WHERE id = ?",
	[req.params.id],
	function (err, results) {
	 if (results[0].creator_user_id == req.user.id) {
	     pool.query("DELETE FROM `projects` WHERE `id` = ?",
	     [req.params.id],
			function (err, results, fields) {
			    if(err){
				throw err;
			    }
			    algoliaClient.deleteIndex('Projects', function(error) {
				pool.query('SELECT * FROM projects', function(err, data) {
				    if (err) throw err;
				    Project.addObjects(data, function(err, content) {
					if (err) throw err;
					res.send(content);
				    });
				});
			    });
			});
	 } else {
	     res.status(400).send({message: "User is not Authorized to delete this project"});
	 }
	});
    }
};

exports.incrementViewProject = function(req, res) {
    req.checkParams('id', 'id parameter must be an integrer corresponding to a project').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
	return res.status(400).send(errors);
    } else {
	pool.query("UPDATE projects SET view=view+1 WHERE id = " + req.params.id, function(err,result) {
	    if (err) {
                var date = new Date();
                console.log(date);
                console.log("Error getting projects in projects.js/incrementViewProject");
                console.log(err);
                console.log("\n");
		throw err;
	    }
	    res.send(result);
	});
    }
};


exports.getAllProjectMembers = function(req, res) {
        req.checkParams('public_id', 'public_id parameter must be an integrer corresponding to a project').isInt().min(1);

        var errors = req.validationErrors(true);
        var message = {};
        if (errors) {
            return res.status(400).send(errors);
        } else {
            pool.query("SELECT creator_user_id FROM projects where public_id = ?", req.params.public_id, function(err, response) {
                if (err) {
                    console.log(new Date());
                    throw err;
                }
                if (req.user.id  === response[0].creator_user_id) {
                    return res.send({message: "success"});
                }
                else {
                    pool.query("SELECT user_id FROM project_users WHERE project_id IN (SELECT id FROM projects WHERE public_id = ?) AND n_accept = 1", req.params.public_id, function(err, response) {
                        if (err) {
                            console.log(new Date());
                            throw err;
                        }
                        function recursiv(index) {
                            if (response[index]) {
                                if (response[index].user_id === req.user.id) {
                                    return res.send({message: "success"});
                                }
                                recursiv(index + 1);
                            } else {
                                return res.send({message: "not found"});
                            }
                        };
                        recursiv(0);
                    });
                }
            });
        }
}

exports.updateVideoPoster = function(req, res) {
    req.checkParams('public_id', 'public_id must be an int').isInt().min(1);

    var errors = req.validationErrors(true);
    if (errors) {
	console.log(errors);
	return res.status(400).send(errors);
    } else {
	pool.query('UPDATE projects set video_poster = ? WHERE public_id = ?',
	[req.body.poster, req.params.public_id],
	function (err, result) {
	    if (err) {
		console.log(new Date());
		throw err;
	    } else {
		return res.send(result);
	    }
	});
    }
}
