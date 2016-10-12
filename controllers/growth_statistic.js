
// Retrieve daily account created
exports.getCreateAccountBasedOnDate = function(req, res) {
	pool.query('SELECT count(*) FROM profiles WHERE DATE(creation_date) = ?', req.body.date,
		function(err, result) {
			if (err) throw err;
			else {
				return res.status(200).send({success: true, data: result});
			}
		});
};


// Retrieve monthly account created
exports.getCreateAccountBasedOnMonth = function(req, res) {
	pool.query('SELECT count(*) FROM profiles WHERE YEAR(creation_date) = ? AND MONTH(creation_date) = ?', req.body.date,
		function(err, result) {
			if (err) throw err;
			else 
				return res.status(200).send({success: true, data: result});
		});
};


// Retrieve daily project created
exports.getCreateProjectBasedOnDate = function(req, res) {
	pool.query('SELECT count(*) FROM projects WHERE DATE(creation_date) = ?', req.body.date,
		function(err, result) {
			if (err) throw err;
			else
				return res.status(200).send({success: true, data: result});
		});
};


// Retrieve monthly project created
exports.getCreateProjectBasedOnMonth = function(req, res) {
	pool.queyr('SELECT count(*) FROM projects WHERE YEAR(creation_date) = ? AND MONTH(creation_date) = ?', req.body.date,
		function(err, result) {
			if (err) throw err;
			else
				return res.status(200).send({success: true, data: result})
		});
};