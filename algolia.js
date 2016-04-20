
/* ALGOLIA SEARCH ENGINE REAL TIME */

module.exports = function(app, algoliaClient) {
    
    var People	= algoliaClient.initIndex('Users');
    var Project = algoliaClient.initIndex('Projects');
    var PAndP 	= algoliaClient.initIndex('PAndP');

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
    PAndP.search('', function searchDone(err, content) {
	if (err) { // if index People does not exist then add data to index
	    pool.query('SELECT * FROM projects', function(err, data) {
		if (err) throw err;
		if (data[0]) {
			pool.query('SELECT * FROM profiles', function(err, data1) {
				if (err) throw err;
				if (data1[0]) {
					function recursive(index) {
						if (data[index]) {
							data1.push(data[index]);
							recursive(index + 1);
						} else {
							PAndP.addObjects(data1, function(err, content) {
							    if (err) console.log(err);
							    return ;
							});
						}
					};
					recursive(0);
				}
			});
		}
	    });
	}
    });

};
