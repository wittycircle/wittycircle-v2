var	satelize 	= require('satelize'),
	cities 		= require('cities');

exports.getLocation = function(ip, callback) {
		satelize.satelize(ip, function(err, payload) {
			if (err) throw err;
			var lat 		= payload.latitude,
				long 		= payload.longitude,
				country 	= payload.country.en,
				location 	= cities.gps_lookup(lat, long);

		    return callback(location.city, location.state, country);
			
		});
};
