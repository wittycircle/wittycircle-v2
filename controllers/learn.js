var convertDate = require('../dateConvert');

function getArticleId(number, callback) {
	var numStr = number.toString();
	var numRan = Math.floor((Math.random() * 10000) + 1).toString();
	var newNum = parseInt(numRan.concat(numStr));

	return callback(newNum);
};

exports.getSingleArticle = function(req, res) {
	console.log(req.body);
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
											convertDate.convertDate(article.creation_date, function(newDate) {
												article.creation_date = newDate;
												return res.send({success: true, article: article})
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
												convertDate.convertDate(article.creation_date, function(newDate) {
													article.creation_date = newDate;
													array.push(article);
													return recursive(index + 1);
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
	console.log(req.body);
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