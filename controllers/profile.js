

exports.updateProfileLocation = function(req, res) {
    req.checkBody('location_country', 'Location country must be between 1 and 64 characters').optional().max(64);
    req.checkBody('location_city', 'Location city must be between 1 and 64 characters').optional().max(64);
    req.checkBody('location_state', 'Location state must be between 1 and 64 characters').optional().max(64);

    req.sanitize('location_state').Clean(true);
    req.sanitize('location_city').Clean(true);
    req.sanitize('location_country').Clean(true);

    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
	pool.query('UPDATE profiles SET ? WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', [req.body, req.user.id],
		   function(err, result) {
		       if (err) throw err;
		       res.send({success: true});
		   });
    }

};

exports.updateProfilePicture = function(req, res) {
    req.checkBody('profile_picture', 'profile picture must be a string of characters').optional().max(128);
    req.checkBody('profile_picture_icon', 'profile picture must be a string of characters').optional().max(256);
    req.checkBody('cover_picture', 'cover picture must be a string of characters').optional().max(128);
    req.checkBody('cover_picture_cards', 'cover picture cards must be a string').optional().max(258);

    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
        if (req.user.moderator) {
            pool.query('UPDATE profiles SET ? WHERE id = ?', [req.body.picture, req.body.profile_id],
                function(err, result) {
                    if (err) throw err;
                    return res.send({success: true});
                });
        } else {
        	pool.query('UPDATE profiles SET ? WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', [req.body.picture, req.user.id],
                function(err, result) {
                   if (err) throw err;
                   return res.send({success: true});
                });
        }
    }
};
