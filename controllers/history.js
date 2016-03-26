exports.addProjectToUserHistory = function(req,res) {
    if (!req.isAuthenticated() || req.params.id != req.user.id) {
	return res.status(400).send({message: "The user must be logged in to save his project history"});
    }
    req.checkParams('id', 'id must be an integrer corresponding to an existing project').isInt().min(1);
    req.checkBody('project_id', 'project_id must be an integrer').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
	return res.status(400).send(errors);
    } else {
	pool.query('SELECT * FROM project_history WHERE user_id = ? AND project_id = ?',
		   [req.user.id, req.body.project_id],
		   function (err, rows) {
		       if (err) {
			   throw err;
			   }
		       if (rows.length != 0) {
			   res.status(200).send({message: "this entry had been added"});
			   res.end();
			   }
		       else {
			   pool.query('INSERT INTO project_history (user_id, project_id) VALUES (?, ?)',
				      [req.user.id, req.body.project_id],
				      function (err, result) {
					  if (err) {
					      throw err;
					  }
					  res.send(result);
				      });
		       }
		   });	
    }
};


exports.getUserProjectHistory = function(req, res) {
    if (!req.isAuthenticated() || req.params.id != req.user.id) {
	return res.status(404).send({message: "you don't have acces to this restricted area: zone 51"});
    }
	req.checkParams('id', 'id must be an integrer').isInt().min(1);
	var errors = req.validationErrors(true);
	if (errors) {
	    return res.status(400).send(errors);
	} else {
	    pool.query('SELECT * from project_history WHERE user_id = ? ORDER BY date DESC',
		      [req.params.id],
		      function (err, result) {
			  if (err) {
			      throw err;
			  }
		      res.send(result);
		      });
	}
};
