exports.createProjectOpening = function(req, res){
    if (!req.isAuthenticated()) {
	return res.status(404).send({message: "user need to be logged in to create opening"});
    } else {
	req.checkBody('project_id', 'Error Message').isInt();
	req.checkBody('status', 'Error Message').isString().max(128);
	req.checkBody('skill', 'Error Message').isString().max(128)
	req.checkBody('description', 'Error Message').optional().isString().max(195);
	req.checkBody('picture', 'Error Message').isString().max(128);
	req.checkBody('taggs', 'Error Message').max(512);

	var errors = req.validationErrors(true);
	if (errors) {
            return res.status(400).send(errors);
	} else {
            pool.query('INSERT INTO `project_openings` SET ?', req.body, function(err, result) {
		if (err){
                    throw err;
		}
		res.send(result);
            });
	}
    }
};

exports.getOpeningsOfProject = function(req, res) {
  req.checkParams('project_id', 'project_id need to be an int').isInt().min(1);

  var errors = req.validationErrors(true);
  if (errors) {
    return res.status(400).send(errors);
  } else {
    pool.query("SELECT * FROM project_openings WHERE project_id = (SELECT id FROM projects WHERE public_id = ?)",
    req.params.project_id,
    function (err, result) {
      if (err) {
        throw err;
      }
      function recursive (index) {
          if (result[index]) {
              result[index].taggs = JSON.parse(result[index].taggs);
              recursive(index + 1);
          } else {
              return res.send(result);
          }
      }
      recursive(0);
    });
  }
};


exports.updateProjectOpening = function(req, res){
    if (!req.isAuthenticated()) {
	return res.status(404).send({messagge: "users need to be logged in"});
    } else {
	req.checkParams('id', 'id parameter must be an integrer.').isInt().min(1);
	var errors = req.validationErrors(true);
	if (errors) {
	    return res.status(400).send(errors);
	} else {
	    pool.query('UPDATE `project_openings` SET ? WHERE `id` = ' + req.params.id,
	    req.body,
	    function(err, result) {
		if (err) {
		    throw err;
		}
		res.send(result);
	    });
	}
    }
};

exports.deleteProjectOpening = function(req, res){
    if (!req.isAuthenticated()) {
	return res.status(400).send({message: "user need to be logged in"});
    } else {
	req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
	var errors = req.validationErrors(true);
	if (errors) {
	    return res.status(400).send(errors);
	} else {
            pool.query("DELETE FROM `project_openings` WHERE `id` = ?",
	    [req.params.id],
	    function(err, result) {
		if (err){
                    throw err;
		}
		res.send(result);
            });
	}
    }
};
