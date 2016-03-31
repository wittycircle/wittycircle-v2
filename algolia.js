
/* ALGOLIA SEARCH ENGINE REAL TIME */

module.exports = function(app, algoliaClient) {

    var People	= algoliaClient.initIndex('Users');
    var Project = algoliaClient.initIndex('Projects');

    People.search('', function searchDone(err, content) {
	if (err) { // if index People does not exist then add data to index
	    pool.query('SELECT * FROM profiles', function(err, data) {
		if (err) throw err;
		People.addObjects(data, function(err, content) {
		    if (err)
			console.log(err);
		});
	    });
	}
    });
    Project.search('', function searchDone(err, content) {
	if (err) { // if index Project does not exist then add data to index
	    pool.query('SELECT * FROM projects', function(err, data) {
		if (err) throw err;
		Project.addObjects(data, function(err, content) {
		    if (err)
			console.log(err);
		});
	    });
	}
    });

};
