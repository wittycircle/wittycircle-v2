exports.createPoll = function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(404).send({message: 'user need to be loggedIn to create a poll'});
  } else {
    req.checkParams('project_id', 'project_id need to be an int').isInt().min(1);
    req.checkBody('project_public_id', 'project_public_id need to be an int').isInt().min(1);
    req.checkBody('title', 'title need to be a string').isString().min(1).max(256);
    req.checkParams('project_creator_id', 'project_creator_id need to be an int').isInt().min(1);

    var errors = req.validationErrors(true);
    if (errors) {
      return res.status(400).send(errors);
    } else {
      pool.query("SELECT * FROM project_users WHERE project_id = ?",
      req.params.project_id,
      function (err, results) {
        if (err) {
          throw err;
        }
	var already = 0;
        results.forEach(function (key) {
	    if (key.user_id == req.user.id || req.params.project_creator_id == req.user.id) {
		if (already == 0) {
		already = 1;
		req.body.project_id = req.params.project_id;
		pool.query("INSERT INTO project_polls SET ?",
		req.body,
		function (error, result) {
		    if (err) {
			throw error;
		    }
		    res.send(result);
		});
		}
	    } else {
		res.status(404).send({message: "you can't create a poll without being in the team"});
	    }
	   });
      });
    };
  } 
};

exports.getPollsOfProject = function(req, res) {
  req.checkParams('project_id', 'project_id need to be an int').isInt().min(1);

  var errors = req.validationErrors(true);
  if (errors) {
    return res.status(400).send(errors);
  } else {
    pool.query("SELECT * FROM project_polls WHERE project_id = ?",
    req.params.project_id,
    function (err, result) {
      if (err) {
        throw err;
      }
      res.send(result);
    });
  }
};
