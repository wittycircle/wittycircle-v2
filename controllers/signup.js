

/*** Sign Up ***/

exports.updateBasic = function(req, res) {

    req.checkBody('genre', 'Genre must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    req.checkBody('birthdate', 'Birthdate must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    req.checkBody('location_country', 'Location country must be between 1 and 64 characters').optional().max(64);
    req.checkBody('location_city', 'Location city must be between 1 and 64 characters').optional().min(1).max(64);
    req.checkBody('location_state', 'Location state must be between 1 and 64 characters').optional();

    req.sanitize('genre').Clean(true);
    req.sanitize('birthday').Clean(true);
    req.sanitize('location_city').Clean(true);

    var errors = req.validationErrors(true);
    if (errors)
	return res.status(400).send(errors);

    if (req.body.genre && req.body.birthdate && req.body.location_city && req.params.id) {
	pool.query('SELECT profile_id FROM users where id = ?', req.params.id,
	    function(err, result) {
		pool.query('UPDATE profiles SET genre = ?, birthdate = ?, location_country = ?, location_city = ?, location_state = ? WHERE id = ?', [req.body.genre, req.body.birthdate, req.body.location_country, req.body.location_city, req.body.location_state, result[0].profile_id],
			   function(err, result) {
			       if (err) throw err;
			       res.send({success: true});
			   });
	    });
    }
};

exports.updateAbout = function(req, res) {
    req.checkBody('about', 'About must be a string.').optional().isString()
    req.checkBody('description', 'Description must be a string.').optional().isString();

  //  req.sanitize('about').Clean(true);
 
    req.checkBody('about', 'About must be a string.').optional().isString();
    req.checkBody('description', 'Description must be a string.').optional().isString(); 

    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    pool.query('UPDATE profiles SET about = ?, description = ? WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', [req.body.about, req.body.description, req.user.id],
	       function(err, result) {
		   if (err) throw err;
		   res.send({success: true});
	       });
};
