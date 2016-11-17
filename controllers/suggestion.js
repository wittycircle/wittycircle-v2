
var _ = require('underscore');

/* SUGGESTION FOR PROJECTS */
function checkFakeUser(id_list, callback) {
	pool.query('SELECT id FROM users WHERE fake = 0 AND id IN ( ' + id_list + ' )',
		function(err, result) {
			if (err) throw err;
			return callback(result);
		});
};

function addToArray(array1, array2, callback) {
	var a1Length = array1.length;

	function recursive(index) {
		if ((a1Length + (index + 1)) < 5) {
			array1.push(array2[index]);
			return recursive(index + 1);
		} else {
			return callback(array1);
		}
	};
	recursive(0)
};

function sortUserIdMatchedByLocation(list_id, city, country, callback) {
	if (list_id[0]) {
		if (list_id.length < 5) {
			return callback(list_id);
		} else {
			var new_array_id = list_id.map( function(el) { return el.id; })
			pool.query('SELECT id FROM users WHERE profile_id IN (SELECT id FROM profiles WHERE (location_city = ? OR location_country = ?) AND id IN (SELECT profile_id FROM users WHERE id IN ( ' + new_array_id + ' )) ORDER BY location_city)', [city, country],
				function(err, result2) {
					if (err) throw err;
					if (result2.length > 3)
						return callback(result2);
					else {
						if (result2[0]) {
							var new_array_id2 = result2.map( function(el) { return el.id; });
							var diff = _.difference(new_array_id, new_array_id2);

							addToArray(new_array_id2, new_array_id, function(final_list) {
								return callback(final_list);
							});
						} else 
							return callback(new_array_id);
					}
				});
		}
	} else
		return callback();
};

function matchPeopleToProjectNeed(list, callback) {
	if (list.length === 1) {
		pool.query('SELECT user_id FROM user_skills WHERE skill_name = ?', list[0],
			function(err, result) {
				if (err) throw err;
				if (!result[0])
					return callback([]);
				else {
					var array_id = result.map( function(el) { return el.user_id; })
					checkFakeUser(array_id, function(newId) {
						return callback(newId);
					});
					// return callback();
				}
			});
	} else {
		var array 	= [];
		var array2 	= [];
		function recursive(index) {
			if (list[index]) {
				pool.query('SELECT user_id FROM user_skills WHERE skill_name = ?', list[index],
					function(err, result) {
						if (err) throw err;
						if (!result[0]) {
							list.splice(index, 1);
							return recursive(0);
						} else {
							if (index === 0) {
								array = result.map( function(el) { return el.user_id; });
								return recursive(index + 1);
							} else {
								array2 = result.map( function(el) { return el.user_id; });
								var inter = _.intersection(array, array2);
								if (!inter[0])
									return recursive(index + 1);
								else {
									array = inter;
									return recursive(index + 1);
								}
							}
						}
					});
			} else {
				if (!array[0])
					return callback([]);
				else {
					checkFakeUser(array, function(newId) {
						return callback(newId);
					});
				}
			}
		};
		recursive(0);
	}
};

function parseList(skill, taggs, callback) {
	var skill_array = [];
	var skill_list  = [];
	skill_array = JSON.parse(taggs);

	function recursive(index) {
		if (skill_array[index]) {
			skill_list.push(skill_array[index]);
			return recursive(index + 1);
		} else {
			skill_list.unshift(skill);
			return callback(skill_list);
		}
	};
	recursive(0);
};

function retrieveNeedFromProject(id, city, country, callback) {
	pool.query('SELECT skill, taggs FROM project_openings WHERE project_id = ?', id,
		function(err, result) {
			if (err) throw err;
			if (!result[0])
				return callback([]);
			else {
				var array_need = [];
				function recursive(index) {
					if (result[index]) {
						parseList(result[index].skill, result[index].taggs, function(list) {
							if (list[0]) {
								matchPeopleToProjectNeed(list, function(list_id) {
									if (list_id[0]) {
										sortUserIdMatchedByLocation(list_id, city, country, function(new_list) {
											array_need.push(new_list);
											return recursive(index + 1);
										});
									} else
										return recursive(index + 1);
								});
							} else
								return recursive(index + 1);
						});
					} else
						return callback(array_need);
				};
				recursive(0);
			}
		});
};

pool.query('SELECT id, title, location_city, location_country FROM projects',
	function(err, result) {
		if (err) throw err;
		else {
			function recursive(index) {
				if (result[index]) {
					retrieveNeedFromProject(result[index].id, result[index].location_city, result[index].location_country, function(matched) {
						if (!matched[0])
							return recursive(index + 1);
						else {
							console.log(result[index].title);
							console.log(matched);
							return recursive(index + 1);
						}
					});
				} else {
					console.log("DONE!");
				}
			};
			recursive(0);
		}
	});


/* SUGGESTION FOR PEOPLE */