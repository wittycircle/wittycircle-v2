exports.createAsk = function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(404).send({message: 'user need to be authenticated'});
  } else {
    req.checkBody('title', 'title need to be a string').isString().max(128);
    req.checkBody('message', 'message need to be a string').optional().isString().max(1024);
    req.checkBody('project_id', 'project_id need to be an int').isInt().min(1);
    req.checkBody('creator_img', 'creator img need to be a string').isString().max(512);
    req.checkBody('first_name', 'first_name need to be a string').isString().max(128);
    req.checkBody('last_name', 'last_name need to be a string').isString().max(128);
    req.checkBody('project_public_id', 'project_public_id need to be an int').isInt().min(1);

    var errors = req.validationErrors(true);
    if (errors) {
      var date = new Date();
      console.log(date + "\n");
      console.log("error in creating a ask" + "\n");
      console.log(errors);
      console.log("\n");
      res.status(400).send(errors);
    } else {
      req.body.user_id = req.user.id;
      pool.query("INSERT INTO project_asks SET ?",
      req.body,
      function (err, result) {
        if (err) {
          throw err;
        }
        res.send(result)
      });
    }
  }
};

exports.deleteAsk = function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(404).send({message: 'user need to be authenticated'});
  } else {
    req.checkParams('ask_id', 'ask_id need to be an int').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
      res.status(400).send(errors);
    } else {
      pool.query("SELECT user_id from project_ask where id = ?",
      req.params.id,
      function (err, result) {
        if (err) {
          throw err;
        }
        if (result[0].user_id == req.user.id) {
          pool.query("DELETE FROM project_ask where id = ?",
          req.params.id,
          function(error, response) {
            if (error) {
              throw error;
            }
            res.send(response);
          });
        }
        else {
          res.status(404).send({message: 'you havent the acces to delete this ask'});
        }
      });
    }
  }
};

exports.getAsksofProject = function(req, res) {
  req.checkParams('project_id', 'project_id must be an integrer');

  var errors = req.validationErrors(true);
  if (errors) {
    return res.status(400).send(errors);
  } else {
    pool.query("SELECT * FROM project_asks WHERE project_id = ?",
    req.params.project_id,
    function(err, result) {
      if (err) {
        throw err;
      }
      res.send(result);
    });
  }
};

exports.getAsksofProjectByPublicId = function(req, res) {
  req.checkParams('project_public_id', 'project_id must be an integrer');

  var errors = req.validationErrors(true);
  if (errors) {
    return res.status(400).send(errors);
  } else {
    pool.query("SELECT * FROM project_asks WHERE project_public_id = ?",
    req.params.project_public_id,
    function(err, result) {
	if (err) {
	    throw err;
	}
	res.send(result);
    });
  }
};

exports.addAskReply = function(req, res) {
    if (!req.isAuthenticated()) {
	return res.status(404).send({message: 'user need to be logged in to add an ask reply'});
    } else {
	req.checkBody('ask_id', 'ask_id need to be an int').isInt().min(1);
	req.checkBody('description', 'description is a long string plz').isString().max(1024);
	req.checkBody('creator_picture', 'creator picture is a string containing an url').isString().max(512);
	req.checkBody('creator_first_name', 'creator_first_name must be a string').isString().max(128);
	req.checkBody('creator_last_name', 'creator_last_name must be a string').isString().max(128);
	
	var errors = req.validationErrors(true);
	if (errors) {
	    return res.status(400).send(errors);
	} else {
	    req.body.user_id = req.user.id;
	    pool.query("INSERT INTO ask_replies SET ?", req.body,
		       function (err, result) {
			   if (err) {
			       throw err;
			   }
			   res.send(result);
		       });
	}
    }
};

exports.getAskReplies = function(req, res) {
    req.checkParams('ask_id', 'ask_id must be an integrer').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM ask_replies WHERE ask_id = ?',
        [req.params.ask_id],
        function (err, results) {
	             if (err) {
                throw err
            }
            res.send(results);
        });
    }
};

exports.deleteAskReplies = function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(404).send({message: 'user need to be logged in'});
  } else {
    req.checkParams('id', 'id must be an integrer').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
      return res.status(400).send(errors);
    } else {
      pool.query('DELETE FROM ask_replies where id = ?',
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
