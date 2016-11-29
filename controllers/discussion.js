/**** DISCUSSION ****/
var np          = require('../tools/notification_permission');

function sortMailList(list, callback) {
    if (list[0]) {
        var newList = [];

        function recursive(index) {
            if (list[index]) {
                if (!newList[0]) {
                    newList.push(list[index].user_id);
                    return recursive(index + 1);
                }
                else {
                    if (newList.indexOf(list[index].user_id) < 0)
                        newList.push(list[index].user_id);
                    return recursive(index + 1);
                }
            } else
                callback(newList);
        };
        recursive(0);
    } else
        return ;
}

function getFollowersEmail(array, callback){
    var mailList = []; 
    sortMailList(array, function(newArray) {
        function recursive(index) {
            if (newArray[index]) {
                pool.query('SELECT email FROM users WHERE id = ? AND fake = 0', newArray[index],
                    function(err, result) {
                        if (err) throw err;
                        mailList.push({
                            email: result[0].email,
                            name: "Recipient",
                            type: "to"
                        });
                        recursive(index + 1);
                    });
            } else
                callback(mailList);
        };
        recursive(0);
    });
};

function getNewD(value, wordwise, max, tail, callback) {
    if (!value) return callback('');
    if (!max) return callback(value);
    if (value.length <= max) return callback(value);
    
    value = value.substr(0, max);
    if (wordwise) {
        var lastspace = value.lastIndexOf(' ');
        if (lastspace != -1) {
            value = value.substr(0, lastspace);
            callback(value + (tail || ' ...'));
        }
    }
};

function getAllDiscussionReplyUserId(pd_id, user_id, callback) {
    pool.query('SELECT user_id FROM project_discussion_replies WHERE project_discussion_id = ? AND user_id != ?', [pd_id, user_id],
        function(err, result) {
            if (err) throw err;
            pool.query('SELECT user_id FROM project_discussion WHERE id = ? AND user_id != ?', [pd_id, user_id],
                function(err, result2) {
                    if (err) throw err;
                    var array = result.concat(result2);
                    return callback(array);
                });
        }); 
};

function sendMailAfterFeedbackAnswer(pd_id, user_id, message, url, callback) {
    pool.query('SELECT title FROM projects WHERE id IN (SELECT project_id FROM project_discussion WHERE id = ?)', pd_id,
        function(err, result2) {
            if (err) throw err;
            getAllDiscussionReplyUserId(pd_id, user_id, function(newArray) {
                if (!newArray[0]) return ;
                else {
                    np.sortEmailNotificationPermission('reply_project', newArray, function(pArray) {
                        if (!pArray)
                            return ;
                        getFollowersEmail(pArray, function(mailList) {
                            if (!mailList[0]) return ;
                            pool.query('SELECT first_name, last_name, profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', user_id,
                                    function(err, name) {
                                        if (err) throw err;
                                        getNewD(message, true, 76, ' ...', function(newMessage) {
                                            var subj = name[0].first_name + " " + name[0].last_name + " commented on " + result2[0].title + " question";
                                            var finame = name[0].first_name + " " + name[0].last_name,
                                                picture = name[0].profile_picture;

                                            var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                                            var template_name = "reply-project";
                                            var template_content = [{
                                                "name": "reply-project",
                                                "content": "content",
                                            }];

                                            var message = {
                                                "html": "<p>HTML content</p>",
                                                "subject": subj,
                                                "from_email": "noreply@wittycircle.com",
                                                "from_name": "Wittycircle",
                                                "to": mailList,
                                                "headers": {
                                                    "Reply-To": "noreply@wittycircle.com"
                                                },
                                                "important": false,
                                                "inline_css": null,
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
                                                "global_merge_vars": [
                                                        {
                                                            "name": "fname",
                                                            "content": finame,
                                                        },
                                                        {
                                                            "name": "fdesc",
                                                            "content": newMessage,
                                                        },
                                                        {
                                                            "name": "fimg",
                                                            "content": picture,
                                                        },
                                                        {
                                                            "name": "furl",
                                                            "content": url
                                                        },
                                                        {
                                                            "name": "fproject",
                                                            "content": result2[0].title
                                                        }                                                                    
                                                ]
                                            };

                                            mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": false}, function(result) {
                                            }, function(e) {
                                                // Mandrill returns the error as an object with name and message keys
                                                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                                throw e;
                                                // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                            });
                                        });
                                });
                        });
                    });
                }
            });
        });
};

function sendMailAfterFeedback(project_id, user_id, title, message, url, callback) {
    pool.query('SELECT title FROM projects WHERE id = ?', project_id,
        function(err, result2) {
            if (err) throw err;
            else {
                pool.query('SELECT user_id FROM project_followers WHERE follow_project_id = ? AND user_id != ?', [project_id, user_id],
                    function(err, result3) {
                        if (err) throw err;
                        if (!result3[0]) return ;
                        else {
                            np.sortEmailNotificationPermission('feedback', result3, function(newArray) {
                                if (!newArray)
                                    return ;
                                pool.query('SELECT first_name, last_name, profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', user_id,
                                    function(err, name) {
                                        if (err) throw err;
                                        getFollowersEmail(newArray, function(mailList) {
                                            if (!mailList[0])
                                                return ;
                                            getNewD(message, true, 76, ' ...', function(newMessage) {
                                                var subj = name[0].first_name + " " + name[0].last_name + " asked a question about " + result2[0].title;
                                                var ptitle = title
                                                    finame = name[0].first_name + " " + name[0].last_name,
                                                    picture = name[0].profile_picture;

                                                var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                                                var template_name = "ask-project";
                                                var template_content = [{
                                                    "name": "ask-project",
                                                    "content": "content",
                                                }];

                                                var message = {
                                                    "html": "<p>HTML content</p>",
                                                    "subject": subj,
                                                    "from_email": "noreply@wittycircle.com",
                                                    "from_name": "Wittycircle",
                                                    "to": mailList,
                                                    "headers": {
                                                        "Reply-To": "noreply@wittycircle.com"
                                                    },
                                                    "important": false,
                                                    "inline_css": null,
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
                                                    "global_merge_vars": [
                                                            {
                                                                "name": "fname",
                                                                "content": finame,
                                                            },
                                                            {
                                                                "name": "fmtitle",
                                                                "content": ptitle,
                                                            },
                                                            {
                                                                "name": "fdesc",
                                                                "content": newMessage,
                                                            },
                                                            {
                                                                "name": "fimg",
                                                                "content": picture,
                                                            },
                                                            {
                                                                "name": "furl",
                                                                "content": url
                                                            },
                                                            {
                                                                "name": "fproject",
                                                                "content": result2[0].title
                                                            }                                                                    
                                                    ]
                                                };

                                                mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": false}, function(result) {
                                                }, function(e) {
                                                    // Mandrill returns the error as an object with name and message keys
                                                    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                                    throw e;
                                                    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                                });
                                            });
                                        });
                                    });
                            });
                        }
                    });
            }
        });
};

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

/*** GET PROJECT DISCUSSION LIKE ***/
function getProjectDiscussionLike(req, pd_id, callback) {
    pool.query('SELECT count(*) AS number FROM project_discussion_likes WHERE project_discussion_id = ?', pd_id,
        function(err, result) {
            if (err) throw err;
            else {
                if (req.isAuthenticated()) {
                    pool.query('SELECT count(*) AS number FROM project_discussion_likes WHERE project_discussion_id = ? AND user_id = ?', [pd_id, req.user.id],
                        function(err, result2) {
                            if (err) throw err;
                            else
                                return callback(result[0].number, result2[0].number);
                        })
                } else
                    return callback(result[0].number, 0);
            }
        });
};

/*** GET PROJECT REPLY LIKE ***/
function getProjectReplyLike(req, pdr_id, callback) {
    pool.query('SELECT count(*) AS number FROM project_reply_likes WHERE project_reply_id = ?', pdr_id,
        function(err, result) {
            if (err) throw err;
            else {
                if (req.isAuthenticated()) {
                    pool.query('SELECT count(*) AS number FROM project_reply_likes WHERE project_reply_id = ? AND user_id = ?', [pdr_id, req.user.id],
                        function(err, result2) {
                            if (err) throw err;
                            else
                                return callback(result[0].number, result2[0].number);
                        });
                } else
                    return callback(result[0].number, 0);
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
                            getProjectDiscussionLike(req, result[index].id, function(likes, myLike) {
                                result[index].numLike = likes; 
                                result[index].myLike = myLike;
    	    					pool.query('SELECT * FROM project_discussion_replies WHERE project_discussion_id = ?', result[index].id,
    	    						function(err, result2) {
    	    							if (err) throw err;
    	    							var new_array = [];
    	    							function recursive2(index2) {
    	    								if (result2[index2]) {
    	    									getUsersInformation(result2[index2].user_id, function(user_info2) {
                                                    getProjectReplyLike(req, result2[index2].id, function(rLikes, myRLike) {
        	    										result2[index2].user_info2 = user_info2;
                                                        result2[index2].numRLike = rLikes;
                                                        result2[index2].myRLike = myRLike;
        	    										new_array.push(result2[index2]);
        	    										return recursive2(index2 + 1);
                                                    });
    	    									});
    	    								} else {
    	    									result[index].comments = new_array;
    	    									return recursive(index + 1);
    	    								}
    	    							};
    	    							recursive2(0);
    	    						});
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
        var url = req.body.url;
        delete req.body.url;
    	pool.query('INSERT INTO project_discussion SET ?', req.body,
    		function(err, result) {
    			if (err) throw err;
    			res.status(200).send({success: true, insertId: result.insertId})
                sendMailAfterFeedback(req.body.project_id, req.body.user_id, req.body.title, req.body.message, url, function() {
                    return ;
                });
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
        var url = req.body.url;
        delete req.body.url;
    	pool.query('INSERT INTO project_discussion_replies SET ?', req.body,
    		function(err, result) {
    			if (err) throw err;
    			res.status(200).send({success: true, insertId: result.insertId});
                sendMailAfterFeedbackAnswer(req.body.project_discussion_id, req.body.user_id, req.body.message, url, function() {
                    return ;
                });
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

/*** POST PROJECT DISCUSSION LIKE ***/
exports.postProjectDiscussionLike = function(req, res) {
    /* Validation */
    req.checkBody('user_id', 'Error Message').isInt();
    req.checkBody('project_discussion_id', 'Error Message').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT count(*) AS number FROM project_discussion_likes WHERE user_id = ? AND project_discussion_id = ?', [req.body.user_id, req.body.project_discussion_id],
            function(err, check) {
                if (err) throw err;
                else {
                    if (!check[0].number) {
                        pool.query('INSERT INTO project_discussion_likes SET ?', req.body,
                            function(err, result) {
                                if (err) throw err;
                                return res.status(200).send({success: true, message: "Like"});
                            });
                    } else {
                        pool.query('DELETE FROM project_discussion_likes WHERE user_id = ? AND project_discussion_id = ?', [req.body.user_id, req.body.project_discussion_id],
                            function(err, result2) {
                                if (err) throw err;
                                return res.status(200).send({success: true, message: "Unlike"});
                            });
                    }
                }
            });
    }
};

/*** POST PROJECT REPLY LIKE ***/
exports.postProjectReplyLike = function(req, res) {
    req.checkBody('user_id', 'Error Message').isInt();
    req.checkBody('project_reply_id', 'Error Message').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT count(*) AS number FROM project_reply_likes WHERE user_id = ? AND project_reply_id = ?', [req.body.user_id, req.body.project_reply_id],
            function(err, check) {
                if (err) throw err;
                else {
                    if (!check[0].number) {
                        pool.query('INSERT INTO project_reply_likes SET ?', req.body,
                            function(err, result) {
                                if (err) throw err;
                                return res.status(200).send({success: true, message: "Like"});
                            });
                    } else {
                        pool.query('DELETE FROM project_reply_likes WHERE user_id = ? AND project_reply_id = ?', [req.body.user_id, req.body.project_reply_id],
                            function(err, result2) {
                                if (err) throw err;
                                return res.status(200).send({success: true, message: "Unlike"});
                            });
                    }
                }
            });
    }
};















