exports.getNewsStatistics = function(req, res) {
	pool.query('SELECT valid FROM news_feature WHERE user_id = ? && type = "statistic"', req.user.id, 
		function(err, result) {
			if (err) throw err;
			else {
				if (!result[0]) {
					pool.query('INSERT INTO news_feature SET user_id = ?, type = "statistic", valid = 1', req.user.id,
						function(err, result2) {
							if (err) throw err;
							return res.send({done: true});
						});
				} else {
					if (result[0].valid) {
						return res.status(200).send({done: false});
					} else {
						pool.query('UPDATE news_feature SET valid = 1 WHERE user_id = ?', req.user.id,
							function(err, result2) {
								if (err) throw err;
								return res.status(200).send({done: true});
							});
					}
				}
			}
		});
};