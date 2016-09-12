var convertDate = require('../dateConvert');

function getArticleId(number, callback) {
	var numStr = number.toString();
	var numRan = Math.floor((Math.random() * 10000) + 1).toString();
	var newNum = parseInt(numRan.concat(numStr));

	return callback(newNum);
};

function getProfileUser(user_id, callback) {
	if (user_id) {
		pool.query('SELECT first_name, last_name, profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', user_id,
			function(err, result) {
				if (err) throw err;
				else {
					return callback(result[0]);
				}
			});
	} else {
		return callback(false);
	}
};

exports.getSingleArticle = function(req, res) {
	/* Validation */
    req.checkBody('article_id').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {	
		pool.query('SELECT * FROM articles WHERE article_id = ?', req.body.article_id,
			function(err, result) {
				if (err) throw err;
				else {
					var article = result[0];
					pool.query('SELECT first_name, last_name, profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', result[0].creator_user_id,
						function(err, result2) {
							if (err) throw err;
							else {
								article.profile = result2[0];
								pool.query('SELECT tag_name FROM article_tags WHERE article_id = ?', result[0].id,
									function(err, result3) {
										if (err) throw err;
										else {
											article.tags = result3;
											pool.query('SELECT count(*) AS number FROM article_message WHERE article_id = ?', result[0].id,
												function(err, result4) {
													if (err) throw err;
													article.numCom = result4[0].number;
													convertDate.convertDate(article.creation_date, function(newDate) {
														article.creation_date = newDate;
														return res.send({success: true, article: article})
													});
												});
										}
									});
							}
						});
				}
			});
	}
};

exports.getAllArticle = function(req, res) {
	pool.query('SELECT * FROM articles ORDER BY creation_date DESC',
		function(err, result) {
			if (err) throw err;
			else {
				var array = [];
				function recursive(index) {
					if (result[index]) {
						var article = result[index];
						pool.query('SELECT first_name, last_name, profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', result[index].creator_user_id,
							function(err, result2) {
								if (err) throw err;
								else {
									article.profile = result2[0];
									pool.query('SELECT tag_name FROM article_tags WHERE article_id = ?', result[index].id,
										function(err, result3) {
											if (err) throw err;
											else {
												article.tags = result3;
												pool.query('SELECT count(*) AS number FROM article_message WHERE article_id = ?', result[index].id,
													function(err, result4) {
														if (err) throw err;
														article.numCom = result4[0].number;
														convertDate.convertDate(article.creation_date, function(newDate) {
															article.creation_date = newDate;
															array.push(article);
															return recursive(index + 1);
														});
													});
											}
										});
								}
							});
					} else 
						return res.send({success: true, articles: array});
				};
				recursive(0);
			}
		});
};

exports.postNewArticle = function(req, res) {
	/* Validation */
    req.checkBody('title', 'Error Message').isString().max(256);
    req.checkBody('picture', 'Error Message').optional().isString().max(512);
    req.checkBody('text', 'Error Message').optional().isString().max(10000);
    req.checkBody('creator_user_id').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	if (req.isAuthenticated) {
    		pool.query('SELECT count(*) as number FROM articles', 
    			function(err, result) {
    				if (err) throw err;
    				else {
    					getArticleId(result[0].number, function(aId) {
    						req.body.article_id = aId;
    						var tags = req.body.tags;
    						delete req.body.tags;

    						pool.query('INSERT INTO articles SET ?', req.body, 
    							function(err, result2) {
    								if (err) throw err;
    								if (tags[0]) {
    									pool.query('SELECT id FROM articles WHERE article_id = ?', aId,
    										function(err, result3) {
    											if (err) throw err;
    											if (result3[0].id) {
    												var article_id = result3[0].id;
			    									function recursive(index) {
			    										if (tags[index]) {
			    											pool.query('INSERT INTO article_tags (tag_name, article_id) VALUES (?, ?)', [tags[index].trim(), article_id],
			    												function(err, result4) {
			    													if (err) throw err;
			    													return recursive(index + 1);
			    												});
			    										} else
			    											return res.send({success: true}); 
			    									};
			    									recursive(0);
			    								} else
			    									return res.send({success: true});
		    								});
    								} else {
    									return res.send({success: true});
    								}
    							});
    					});
    				}
    			});
    	}
    }
};

exports.getArticleMessages = function(req, res) {
	req.checkParams('id', 'Error Message').isInt();
	var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query('SELECT * FROM article_message WHERE article_id = ? ORDER BY creation_date DESC', req.params.id, 
    		function(err, result) {
    			if (err) throw err;
    			else {
    				function recursive(index) {
    					if (result[index]) {
    						getProfileUser(result[index].user_id, function(result2) {
    							convertDate.convertDate(result[index].creation_date, function(newDate) {
	    							result[index].profile 		= result2;
	    							result[index].creation_date = newDate;
	    							return recursive(index + 1);
	    						});
    						});
    					} else
    						return res.send({success: true, data: result});
    				};
    				recursive(0);
    			}
    		});
    }
};

exports.postArticleMessage = function(req, res) {
	req.checkBody('article_id', 'Error Message').isInt();
    req.checkBody('user_id', 'Error Message').isInt();
    req.checkBody('message', 'Error Message').isString();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	if (req.isAuthenticated) {
    		pool.query('INSERT INTO article_message SET ?', req.body,
    			function(err, result) {
    				if (err) throw err;
    				else {
    					return res.send({success: true});
    				}
    			});
    	} else
    		return res.status(401).send("Request Unauthorized");
    }
};

// * SEARCH ARTICLE

exports.getArticleByTag = function(req, res) {
	req.checkParams('tag', "Error Message").isString();

	var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	var tag = req.params.tag + "%";
    	pool.query('SELECT article_id FROM article_tags WHERE tag_name LIKE ?', tag,
    		function(err, result) {
    			if (err) throw err;
    			if (result[0]) {
    				var arr = result.map( function(el) { return el.article_id; })
    				pool.query("SELECT * FROM articles WHERE id IN (" + arr + ")  ORDER BY creation_date DESC", 
    					function(err, result2) {
    						if (err) throw err;
    						else {
								function recursive(index) {
									if (result2[index]) {
										pool.query('SELECT first_name, last_name, profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', result2[index].creator_user_id,
											function(err, result3) {
												if (err) throw err;
												else {
													result2[index].profile = result3[0];
													pool.query('SELECT tag_name FROM article_tags WHERE article_id = ?', result2[index].id,
														function(err, result4) {
															if (err) throw err;
															else {
																result2[index].tags = result4;
																pool.query('SELECT count(*) AS number FROM article_message WHERE article_id = ?', result2[index].id,
																	function(err, result5) {
																		if (err) throw err;
																		result2[index].numCom = result5[0].number;
																		convertDate.convertDate(result2[index].creation_date, function(newDate) {
																			result2[index].creation_date = newDate;
																			return recursive(index + 1);
																		});
																	});
															}
														});
												}
											});
									} else 
										return res.send({success: true, articles: result2});
								};
								recursive(0);
    						}
    					});
    			} else
    				return res.send({success: false});
    		});
    };
};