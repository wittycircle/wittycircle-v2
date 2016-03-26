exports.createFeedbackReplies = function(req, res) {
    if (!req.isAuthenticated()) {
	return res.stxsxcatus(404).send({message: 'User must be logged in to post a reply'});
    } else {
	req.checkBody('feedback_id', 'Must be an integrer').isInt();
	req.checkBody('description', 'Must be a string text').isString().max(1024);
	req.checkBody('creator_picture', 'Must be an url for picture').isString().max(512);
	req.checkBody('creator_first_name', 'Must be a string').isString().max(128);
	req.checkBody('creator_last_name', 'Must be a string').isString().max(128);

	var errors = req.validationErrors(true);
	if (errors) {
	    return res.status(400).send(errors);
	} else {
	    req.body.user_id = req.user.id;
	    pool.query('INSERT INTO feedback_replies SET ?',
	    req.body,
	    function (err, result) {
		if (err) {
		    throw err;
		}
		res.send(result);
	    });
	}
    }
}

exports.getFeedbackReplies = function(req, res) {
    req.checkParams('id', 'id must be an integrer').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
	return res.status(400).send(errors);
    } else {
	pool.query('SELECT * FROM feedback_replies WHERE feedback_id = ?',
	[req.params.id],
	function (err, results) {
	    if (err) {
		throw err 
	    }
	    res.send(results);
	});
    }
}

exports.deleteFeedbackReplies = function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(404).send({message: 'user need to be logged in'});
  } else {
    req.checkParams('id', 'id must be an integrer').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
      return res.status(400).send(errors);
    } else {
      pool.query('DELETE FROM feedback_replies where id = ?',
      [req.params.id],
      function (err, response) {
        if (err) {
          throw err;
        }
        res.send(response);
      });
    }
  }
};

