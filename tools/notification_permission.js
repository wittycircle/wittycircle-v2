/*** NOTIFICATION PERMISSIONS ***/

exports.sortEmailNotificationPermission = function(type, array, callback) {
	if (array[0]) {
		var tempArray = [];
		function recursive(index) {
			if (array[index]) {
				pool.query('SELECT permission FROM notification_permission WHERE user_id = ? AND notif_type = ?', [array[index].user_id, type],
				function(err, result) {
					if (err) throw err;
					else  {
						if (!result[0]) {
							tempArray.push(array[index]);
							return recursive(index + 1);
						} else if (!result[0].permission) {
							return recursive(index + 1);
						} else {
							tempArray.push(array[index]);
							return recursive(index + 1);
						}
					}
				});
			} else {
				if (tempArray[0])
					return callback(tempArray);
				else
					return callback(false);
			}
		};
		recursive(0);
	} else
		return callback(false);
};