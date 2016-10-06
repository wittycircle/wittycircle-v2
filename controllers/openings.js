var tf            = require('../tools/profile_functions');

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

function getProjectMentor(list, callback) {
	if (list[0]) {
		var arr_id = [];
		function recursive(index) {
			if (list[index]) {
				pool.query("SELECT user_id FROM user_skills WHERE skill_name = ?", list[index],
					function(err, result) {
						if (err) throw err;
						arr_id = arr_id.concat(result);
						return recursive(index + 1);
					});
			} else {
				if (!arr_id[0])
					return callback(false);

				var arr = arr_id.map( function(el) { return el.user_id; });

				pool.query("SELECT user_id FROM user_experiences WHERE user_id IN (" + arr + ")", 
					function(err, result2) {
						if (err) throw err;
						if (result2[0])
							var arr_user_id = result2.map( function(el) { return el.user_id; });
						else
							var arr_user_id = arr;
						pool.query("SELECT id, profile_picture, first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id IN (" + arr_user_id + ")) LIMIT 17",
							function(err, result3) {
								if (err) throw err;
								else {
									function recursive2(index2) {
										if (result3[index2]) {
											tf.getUsernameByProfileId(result3[index2].id, function(username) {
												result3[index2].username = username;
												return recursive2(index2 + 1);
											});
										} else
											return callback(result3);
									}
									recursive2(0);
								}
							});
					});
			}
		}
		recursive(0);
	} else
		return callback(false);
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
          	var list = [];

          	pool.query('SELECT picture_card FROM projects WHERE public_id = ?', req.params.project_id, 
          		function(err, picture) {
          			if (err) throw err;

          			if (!picture[0])
          				result[index].picture = "https://res.cloudinary.com/dqpkpmrgk/image/upload/w_200,h_200,c_fill/v1456744591/no-bg_k0b9ob.jpg";
          			else
          				result[index].picture = picture[0].picture_card;
		          	result[index].taggs = JSON.parse(result[index].taggs);
		          	if (result[index].taggs) {
		          		list = result[index].taggs;
		          		list.push(result[index].skill);
		          	} else {
		          		list.push(result[index].skill);
		          	}

		          	getProjectMentor(list, function(result2) {
		          		result[index].contributors = result2;
						return recursive(index + 1);
		          	});
		        });
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
