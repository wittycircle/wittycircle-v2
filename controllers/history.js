exports.addProjectToUserHistory = function(req,res) {
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
	req.checkParams('id', 'id must be an integrer').isInt().min(1);
	var errors = req.validationErrors(true);
	if (errors) {
	    return res.status(400).send(errors);
	} else {
	    pool.query('SELECT * from project_history WHERE user_id = ? ORDER BY date DESC',
		  [req.params.id],
		  function (err, result) {
			  if (err) {
          console.log(new Date());
			    throw err;
			  }
		    //res.send(result);
        function recursive(index) {
          if (result[index]) {
            pool.query("SELECT * FROM projects where id = ?",
            result[index].project_id,
            function(err, data) {
              if (err) {
                console.log(new Date());
                throw err;
              }
              result[index].project = data[0];
              recursive(index + 1);
            });
          } else {
            return res.send(result);
          }
        }
        recursive(0);
		  });
	}
};
