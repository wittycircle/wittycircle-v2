
var _ 		= require('underscore');
var uf      = require('../tools/useful_function');
var mail 	= require('../tools/mail_message_functions');

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
			var array_id = list_id.map( function(el) { return el.id })
			return callback(array_id);
		} else {
			var new_array_id = list_id.map( function(el) { return el.id; })
			pool.query('SELECT id FROM users WHERE profile_id IN (SELECT id FROM profiles WHERE (location_city = ? OR location_country = ?) AND id IN (SELECT profile_id FROM users WHERE id IN ( ' + new_array_id + ' )) ORDER BY location_city)', [city, country],
				function(err, result2) {
					if (err) throw err;
					if (result2.length > 3) {
						var array_id = result2.map( function(el) { return el.id });
						return callback(array_id);
					} else {
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
					} else {
						return callback(array_need);
					}
				};
				recursive(0);
			}
		});
};

function getFirstNeedParsed(id, callback) {
	pool.query('SELECT skill, taggs FROM project_openings WHERE project_id = ?', id,
		function(err, result) {
			if (err) throw err;
			if (!result[0])
				return callback([]);
			else {
				parseList(result[0].skill, result[0].taggs, function(list) {
					return callback(list);
				});
			}
		});
};

exports.executePeopleSuggestion = function(req, res) {
	pool.query('SELECT id, title, creator_user_id, location_city, location_country FROM projects WHERE project_visibility = 1',
		function(err, result) {
			if (err) throw err;
			else {
				function recursive(index) {
					if (result[index]) {
						retrieveNeedFromProject(result[index].id, result[index].location_city, result[index].location_country, function(matched) {
							if (!matched[0])
								return recursive(index + 1);
							else {
								getFirstNeedParsed(result[index].id, function(skill_list) {
									mail.sendSuggestionMailForProject(result[index].creator_user_id, result[index].id, result[index].title, matched, skill_list, function() {
										return recursive(index + 1);
									});
								});
							}
						});
					} else {
						return res.status(200).send({success: true});
					}
				};
				recursive(0);
			}
		});
};

/* SUGGESTION FOR PEOPLE */
function checkUserNotCreator(callback) {
	pool.query('SELECT creator_user_id FROM projects',
		function(err, result) {
			if (err) throw err;
			else {
				var array = result.map( function(el) { return el.creator_user_id; })
				pool.query('SELECT user_id FROM project_users WHERE n_accept = 1',
					function(err, result2) {
						if (err) throw err;
						else {
							var array2 = result2.map ( function(el) { return el.user_id });
							array = array.concat(array2);
							pool.query('SELECT profile_id FROM users WHERE id IN ( ' + array + ' )',
								function(err, done) {
									if (err) throw err;
									else {
										array = done.map ( function(el) {return el.profile_id });
										return callback(array);
									}
								});
						}
					});
			}
		});
};

function retrieveUserSkills(profile_id, callback) {
	pool.query('SELECT id FROM users WHERE profile_id = ?', profile_id,
		function(err, result) {
			if (err) throw err;
			else {
				if (!result[0])
					return callback([]);
				else {
					pool.query('SELECT skill_name FROM user_skills WHERE user_id = ?', result[0].id,
						function(err, result2) {
							if (err) throw err;
							var array_skill = result2.map( function(el) { return el.skill_name });
							return callback(array_skill);
						});
				}
			}
		});
};

function getCheckedProjects(callback) {
	pool.query("SELECT id FROM projects WHERE project_visibility = 1 AND (picture IS NOT NULL and picture != '') AND (post IS NOT NULL || post != '')",
		function(err, result) {
			if (err) throw err;
			var array1 = result.map( function(el) { return el.id });
			pool.query('SELECT project_id FROM project_openings GROUP BY project_id',
				function(err, result2) {
					if (err) throw err;
					var array2 = result.map( function(el) { return el.id });
					array1 = _.intersection(array1, array2);
					return callback(array1);
				});
		});
};

function matchProjectToPeople(skill_list, callback) {
	getCheckedProjects(function(project_id) {
		var match_array = [];
		function recursive(index) {
			if (project_id[index]) {
				pool.query('SELECT skill, taggs FROM project_openings WHERE project_id = ?', project_id[index],
					function(err, result) {
						if (err) throw err;
						if (result[0]) {
							function recursive2(index2) {
								if (result[index2]) {
									parseList(result[index2].skill, result[index2].taggs, function(list) {
										if (list[0]) {
											var inter = _.intersection(list, skill_list);
											if (inter.length) {
												if (!match_array[0])
													match_array.push(project_id[index]);
												else {
													if (inter.length > match_array[0].length)
														match_array.unshift(project_id[index]);
													else
														match_array.push(project_id[index]);
												}
											}
											return recursive2(index2 + 1);
										} else
											return recursive2(index2 + 1);
									});

								} else {
									return recursive(index + 1);
								}
							};
							recursive2(0);
						} else
							return recursive(index + 1);
					});
			} else {
				return callback(match_array);
			}
		};
		recursive(0);
	});
};

function sortProjectMatchByLocation(list_id, city, country, callback) {
	if (list_id.length > 3 && city && country) {
		pool.query('SELECT id FROM projects WHERE location_city = ? AND id IN ( ' + list_id + ' )', city,
			function(err, result) {
				if (err) throw err;
				var array_id = result.map( function(el) { return el.id });
				if (array_id.length < 3) {
					pool.query('SELECT id FROM projects WHERE location_country = ? AND id IN ( ' + list_id + ' )', country,
						function(err, result2) {
							if (err) throw err;
							var array_id2 = result2.map( function(el) { return el.id });
							var diff = _.difference(array_id2, array_id);
							array_id = array_id.concat(diff);
							if (array_id.length < 3) {
								diff 		= _.difference(list_id, array_id);
								array_id 	= array_id.concat(diff); 
								return callback(array_id);
							} else
								return callback(array_id);
						});
				} else {
					return callback(array_id);
				}
			});
	} else
		return callback(list_id);
};

function skillMatched(skill_list, project_list, callback) {
	var tempoArr = [];
	if (project_list[0]) {
		function recursive(index) {
			if (project_list[index]) {
				pool.query('SELECT skill, taggs FROM project_openings WHERE project_id = ?', project_list[index],
					function(err, result) {
						if (err) throw err;
						else {
							parseList(result[0].skill, result[0].taggs, function(list) {
								function recursive2(index2) {
									if (skill_list[index2]) {
										if (list.indexOf(skill_list[index2]) >= 0) {
											pool.query('SELECT title, location_city, location_country, picture_card, description, public_id FROM projects WHERE id = ?', project_list[index],
												function(err, result2) {
													if (err) throw err;
													    uf.encodeUrl(result2[0].title, function(newTitle) {
															tempoArr.push({
																project_id 		: project_list[index],
																project_title 	: result2[0].title,
																project_newT 	: newTitle,
																project_city 	: result2[0].location_city || null,
																project_country : result2[0].location_country,
																project_desc 	: result2[0].description,
																project_picture : result2[0].picture_card,
																project_pubId 	: result2[0].public_id,
																skill 			: skill_list[index2]
															});
															skill_list.splice(index2, 1);
															return recursive(index + 1);
														});
												});
										} else
											return recursive2(index2 + 1);
									} else 
										return recursive(index + 1);
								};
								recursive2(0);
							});
						}						
					});
			} else {
				return callback(tempoArr);
			}
		};
		recursive(0);
	} else
		return callback(false);
};

exports.executeProjectSuggestion = function(req, res) {
	checkUserNotCreator(function(id_list) {
		pool.query('SELECT id, first_name, last_name, location_city, location_country FROM profiles WHERE id NOT IN ( ' + id_list + ' ) AND fake = 0',
			function(err, result) {
				if (err) throw err;
				else {
					function recursive(index) {
						if (result[index]) {
							retrieveUserSkills(result[index].id, function(skill_list) { 
								if (!skill_list[0])
									return recursive(index + 1);
								else {
									matchProjectToPeople(skill_list, function(array_project_id) {
										if (!array_project_id[0]) {
											return recursive(index + 1);
										}
										else {
											var unique = _.uniq(array_project_id);
											sortProjectMatchByLocation(unique, result[index].location_city, result[index].location_country, 
												function(final_list) {
													skillMatched(skill_list, final_list, function(projects) {
														if (!projects)
															return recursive(index + 1);
														else {
															mail.sendSuggestionMailForPeople(result[index].id, result[index].first_name, result[index].last_name, projects, function() {
																return recursive(index + 1);
															});
														}
													});
												});
										}
									});
								}
							});
						} else {
							console.log("DONE!");
						}
					};
					recursive(0);
				}
			});
	});
};
