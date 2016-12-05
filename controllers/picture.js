var algoliaClient = require('../algo/algolia').algoliaClient;
var People	= algoliaClient.initIndex('Users');

function transformUrlForCard(url) {
      if (url) {
        var tab = url.split('/');
	var i = tab.indexOf('upload');
	var parameter = "w_" + 320 + "," + "h_" + 240 + "," + "c_" + "crop";
	tab.splice(i + 1, 0, parameter);
	var url_ret = tab.join('/');
	return url_ret;
      } else {
	return url;
      }
}

exports.checkExistProfilePicture = function(req, res) {
	req.checkParams('profileId', 'must be an integer').isInt();

	var errors = req.validationErrors(true);
	if (errors)	return res.status(400).send(errors);
	else {
		pool.query('SELECT profile_picture FROM profiles WHERE id = ?', req.params.profileId,
			function(err, result) {
				if (err) throw err;
				if (result[0].profile_picture)
					return res.send({success: false});
				else
					return res.send({success: true});
			});
	}
};

exports.getRandomProfilePicture = function(req, res) {
    function recursive() {
	var x = Math.floor((Math.random() * 16) + 1);
	pool.query('SELECT url FROM witty_profile_pictures WHERE id = ?', x,
		   function(err, data) {
		       if (err) throw err;
		       if (!data[0])
			   recursive();
		       else {
			   pool.query('UPDATE profiles SET profile_picture = ?, profile_picture_icon = ? WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', [data[0].url, data[0].url, req.user.id],
				      function(err, done) {
					  if (err) throw err;
					  return res.send({success: true, url: data[0].url});
				      });
		       }
		   });
    };
    recursive();
};

exports.getRandomCoverPicture = function(req, res) {
    function recursive() {
	var x = Math.floor((Math.random() * 16) + 1);
	pool.query('SELECT url FROM witty_cover_pictures WHERE id = ?', x,
		   function(err, data) {
		       if (err) throw err;
		       if (!data[0])
			   recursive();
		       else {
			   var cover_card = transformUrlForCard(data[0].url);
			   pool.query('UPDATE profiles SET cover_picture = ?, cover_picture_cards = ?  WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', [data[0].url, cover_card, req.user.id],
				      function(err, result) {
					  if (!err) {
					      pool.query('SELECT id, first_name, last_name, profession, description, location_city, location_state, location_country, profile_picture, about, genre, creation_date, cover_picture, views, profile_picture_icon, cover_picture_cards FROM profiles WHERE id IN ( SELECT profile_id FROM users WHERE id = ? && fake = 0 )', req.user.id,
						function(err, profile_data) {
					 	    if (err) throw err;
					 	    People.addObjects(profile_data, function(err, content) {
							if (err) throw err;
						      return res.send({success: true, data: data[0].url});
					 	    });
						});
					  }
				      });
		       };
		   });
    };
    recursive(0);
};
    
exports.getCoverPicture = function(req, res) {
    req.checkBody('url', 'url must be a string of characters').isString().min(1);
    var errors = req.validationErrors(true);

    if (errors) return res.status(400).send(errors);
    else {
	pool.query('SELECT * FROM witty_cover_pictures WHERE url = ?', req.body.url,
		      function(err, data) {
			  if (err) throw err;
			  res.send({success: true, data: data});
		      });
    }
};
