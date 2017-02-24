/*** Section Search Users ***/
var tf = require('../tools/project_functions');
var search = require('./prototype');
var pf = require('../tools/profile_functions');
var _  = require('underscore');
/*** Prototype ***/
// function SpeedTest(testImplement, testParams, repititions) {
//     this.testImplement = testImplement;
//     this.testParams = testParams;
//     this.repititions = repetitions || 10000;
//     this.average = 0;
// }

// SpeedTest.prototype = {
//     startTest: function() {
//         var beginTime, endTime, sumTimes = 0;
//         for (var i = 0; x = this.repetitions; i < x; i++) {
//             beginTime = +new Date();
//             this.testImplement( this.testParams );
//             endTime = +new Date();
//             sumTimes += endTime - beginTime;
//         }
//         this.average = sumTimes / this.repetitions;
//         return console.log("Average execution across " +
//                             this.repetitions + ": " +   
//                             this.average);
//     }
// };
function getVotedProject(list, req, callback) {
    if (req.isAuthenticated()) {
	pool.query('SELECT follow_project_public_id FROM project_followers WHERE user_id = ?', req.user.id,
		   function(err, result) {
		       if (err) throw err;
		       if (result[0]) {
			   function recursive(index) {
			       if (result[index]) {
				   function recursive2(index2) {
				       if (list[index2]) {
					   if (list[index2].public_id == result[index].follow_project_public_id) {
					       list[index2].check_vote = 1;
					       recursive(index + 1);
					   } 
					   else {
					       recursive2(index2 + 1);
					   }
				       } else
					   recursive(index + 1);
				       
				   };
				   recursive2(0);
			       } else {
				   callback(list);
			       }
			       
			   };
			   recursive(0);
		       } else
			   callback(list);
		   });
    } else
	callback(list);
};

// Check if the element is already in the list
function checkElement(elem, list, callback) {
    if (list[0] && elem) {
        for(var i = 0; i < list.length; i++) {
            if (elem === list[i])
                return callback(false);
        }
	if (i === list.length)
	    return callback(true);
    } 
};

// Remove same element in array
function removeSameElem(data, callback) {

    if (typeof data[0] === "object") {
        for (var i = 0; i < data.length; i++) {
            data[i] = data[i].project_id;
        };
    }
    if (!data[1])
        return callback(data);

    var newData = [];

    data.sort();
    for(var i = 0; i < data.length; i++){
        if (data[i] === data[i + 1]) {continue}
            newData[newData.length] = data[i];
    }
    return callback(newData);
};

// sort and check duplicate user in list
function sortListUser(data, sortList, callback) {
    var list = [];

    if (data[0]) {
        if (!sortList) {
            for(var i = 0; i < data.length; i++) {
                if (data.indexOf(data[i].user_id) < 0)
                    list.push(data[i].user_id);
            };
            return callback({success: true, list: list});
        } else {
            list = sortList;
            function recursive(index) {
                if (data[index]) {
                    checkElement(data[index].user_id, sortList, function(res) {
                        if (res)
                            list.push(data[index].user_id);
                        recursive(index + 1);
                    });
                } else
                    return callback({success: true, list: list});
            };
            recursive(0); 
        }
    } else
        return callback({success: false, msg: "No data !"});
};

// Sort list by checking helps and skills of projects;
function sortProjectByHS(list, listId, callback) {
    var newList = [];

    function recursive(index) {
        if (list[index]) {
            for(var i = 0; i < list; i++) {
                if (list[index].id === listId[i]) {
                    newList.unshift(list[index]);
                    recursive(index + 1);
                    break ;
                }
            }
            newList.push(list[index]);
            recursive(index + 1);
        } else
            return callback(newList);
    };
    recursive(0);
};

//**** Union two array without duplicate
function unionArray(data1, object, listId, callback) {
    if (!object.list) {
        return callback(data1);
    } else {
        sortProjectByHS(object.list, listId, function(newList) {
            var newData = [];

            function recursive(index) {
                if (data1[index]) {
                    arrayObjectIndexOf(newList, data1[index].id, function(res) {
                        if (res)
                            newData.push(data1[index]);
                        recursive(index + 1);
                    });
                } else {
                    newData = newList.concat(newData);
                    return callback(newData);
                }
            };
            recursive(0);
        });
    }
};

function arrayObjectIndexOf(newList, id, callback) {
    function recursive(index) {
        if(newList[index]) {
            if (newList[index].id === id)
                return callback(false);
            recursive(index + 1);
        } else
            return callback(true);
    };
    recursive(0);
};
//*****

// check skill present in project
function checkSkill(elem, data, callback) {
    var list = [];
    function recursive(index) {
        if (data[index]) {
            if (elem === data[index].skill || data[index].taggs.indexOf(elem) >= 0) {
                list.push(data[index].project_id);
            }
            recursive(index + 1);
        } else
            return list ? callback(list) : callback(false);
    }; 
    recursive(0);
}

// get all data from available project
function getProjectTitle(list, callback) {
    if(list && list[0]) {
        var array = [];

        function recursive(index) {
            if (list[index]) {
                pool.query('SELECT * FROM projects WHERE id = ? && project_visibility = 1', list[index],
                    function(err, data) {
                        if (err) return console.log(err, new Date());
                        if (data && data[0] && data[0].picture_card) {
                            array.push(data[0]);
                        }
                        recursive(index + 1);
                    });
            } else
                return callback(array);
        };
        recursive(0);
    } else
        return callback(false);
};

//*** Get all projects by skill in discover search
exports.getProjectsBySkill = function(req, res) {
    if (Object.keys(req.body).length === 0)
        return res.send({success: false});
    else {
        pool.query('SELECT project_id, skill, taggs FROM project_openings', function(err, results) {
            if (err) throw err;
            if (results[0]) {
                var sortList = [];
                function recursive(index) {
                    if (req.body[index]) {
                        var name = req.body[index].sName;
                        checkSkill(name, results, function(list) {
                            if (list)
                                sortList = sortList.concat(list);
                            recursive(index + 1);
                        });
                    } else {
                        if (sortList) { 
                            removeSameElem(sortList, function(list) {
                                getProjectTitle(list, function(object) {
                                    tf.sortProjectCard(object, function(content) {
                                        getVotedProject(content, req, function(newData) {
                                            return newData ? res.send({success: true, data: newData}) : res.send({success: false});
                                        });     
                                    });
                                });
                            });
                        } else
                            return res.send({success: false});
                    }
                };
                recursive(0);
            } else
                return res.send({success: false});
        });
    }
};

//*** Get all projects by skill according to location, status, category in discover search
exports.getProjectBySkillScl = function(req, res) {
    if (req.body.list) {
        var scl = new search(req.body.list, req.body);
        getVotedProject(scl.getSCL(), req, function(newData) {
            return res.send({success: true, data: newData});
        });
    } else
        return res.send({success: false});
};

//*** Get all projects by help in discover search
exports.getProjectByHelp = function(req, res) {
    if (typeof req.params.help === "string") {
        //console.time("Time to run :");
        pool.query('SELECT project_id FROM project_openings WHERE status = ?', req.params.help,
            function(err, data) {
                if (err) throw err;
                if (data && data[0]) {
                    removeSameElem(data, function(listId) {
                        getProjectTitle(listId, function(object) {
                            if (object && object[0]) {
                                tf.sortProjectCard(object, function(content) {
                                    if (content) {
                                        unionArray(content, req.body, listId, function(finalData) {
                                            getVotedProject(finalData, req, function(newData){
                                                if (!req.body.status && !req.body.ctg && !req.body.geo) {
                                                    //console.timeEnd("Time to run :");
                                                    return res.send({success: true, data: newData});
                                                }
                                                else {
                                                    var scl = new search(newData, req.body);
                                                    //console.timeEnd("Time to run :");
                                                    return res.send({success: true, data: scl.getSCL()});
                                                }
                                            });
                                        });
                                    }
                                    else
                                        return res.send({success: false});
                                });
                            }
                            else
                                return res.send({success: false});
                        });
                    });
                } else
                    return res.send({success: false});
            });
    } else
        return res.status(404).send("Error params");
};

//*** Get all project by status or sill in discover search
exports.getProjectsByStatusAndSkill = function(req, res) { 
    //console.time("Time to run :");
    if (req.body) {
        
        pool.query('SELECT * FROM projects WHERE picture_card IS NOT NULL AND project_visibility = 1 ORDER BY view DESC',
            function(err, results) {
                if (err) throw err;
                if (results[0]) {
                    tf.sortProjectCard(results, function(content) {
                        var scl = new search(content, req.body);
                        //console.timeEnd("Time to run :");
                        getVotedProject(scl.getSCL(), req, function(newData){
                            return res.send({success: true, data: newData});
                        });
                    });
                } else
                    return res.send({success: false});
            });
    } else
        return res.status(404).send("Error params");
};

//*** Get all users by skill in meet search
// exports.getUsersBySkill = function(req, res) {
//     var arrayId, sortList;
//     arrayId = [];
//     console.time('Time to find: ');
//     function recursive(index) {
//         if (req.body[index]) {
//             pool.query('SELECT user_id FROM user_skills WHERE skill_name = ?', req.body[index].sName,
//                 function(err, data) {
//                     if (err) throw err;
//                     if (data[0]) {
//                         sortListUser(data, sortList, function(res) {
//                             if (res.success)
//                                 sortList = res.list;
//                             recursive(index + 1);
//                         });
//                     } else
//                         recursive(index + 1);
//                 });
//         } else {
// 	    console.timeEnd('Time to find: ')
//             return sortList ? res.send({success: true, data: sortList}) : res.send({success: false});
//         }
//     };
//     recursive(0);
// };

//*** MEET SEARCH FUNCTION

function autoRunQuery(id, skills, callback) {
    pool.query("SELECT skill_name FROM user_skills WHERE user_id = ?", id, 
        function(err, result) {
            if (err) throw err;
            var arr = result.map(function(el) { return el.skill_name });
            var count = 0;
            var temp = [];
            function recursive(index) {
                if (skills[index]) {
                    if (arr.indexOf(skills[index]) >= 0) {
                        count++;
                        temp.push(skills[index]);
                        return recursive(index + 1);
                    } else {
                        return recursive(index + 1);
                    }
                } else {
                    if (count === 5)
                        callback({num: 5, skill: temp, user_id: id});
                    else if (count === 4)
                        callback({num: 4, skill: temp, user_id: id});
                    else if (count === 3)
                        callback({num: 3, skill: temp, user_id: id});
                    else if (count === 2)
                        callback({num: 2, skill: temp, user_id: id});
                    else if (count === 1)
                        callback({num: 1, skill: temp, user_id: id});
                    else
                        callback(false);
                }
            };
            return recursive(0);
        });
};

function sortUserSkillArray(data, callback) {
    var newData1 = [],
        newData2 = [],
        tempo   = data;
    if (data[0]) {
        function recursive(index) {
            if (tempo[index]) {
                if (_.isEqual(data[0].skill, tempo[index].skill)) {
                    newData1.push(tempo[index]);
                    return recursive(index + 1);
                } else {
                    newData2.push(tempo[index]);
                    return recursive(index + 1);
                }
            } else {
                return callback(newData1, newData2);
            }
        };
        return recursive(0);
    }
};


function getListUserSearch(data, callback) {
    if (data[0]) {
        function recursive(index) {
            if (data[index]) {
                function recursive2(index2) {
                    if (data[index][index2]) {
                        pool.query('SELECT id, first_name, last_name, description, network, location_city, location_state, location_country, profile_picture, about, cover_picture_cards FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)',
                            data[index][index2].user_id,
                            function(err, result) {
                                if (err) throw err;
                                if (result[0])
                                    data[index][index2].profiles = result[0];
                                else
                                    data[index].splice(index2, 1);
                                return recursive2(index2 + 1);
                            });
                    } else
                        return recursive(index + 1);
                };
                return recursive2(0);
            } else
                return callback(data);
        };
        return recursive(0);
    }
};

exports.getUserBySkills = function(req, res) {
    console.time('Time to find skills: ');
    pool.query('SELECT * FROM user_skills GROUP BY user_id', function(err, result) {
        if (err) throw err;
        if (result[0]) {
            var arr = req.body.map( function(el) { return el.sName});
            var data = [];

            function recursive(index) {
                if (result[index]) {
                    autoRunQuery(result[index].user_id, arr, function(newData) {
                        if (newData)
                            data.push(newData);
                        return recursive(index + 1);
                    });
                } else {
                    var bigData = [];
                    var bigData2 = [];
                    function recursive2(reData) {
                        sortUserSkillArray(reData, function(arr1, arr2) {
                            if (!arr2[0]) {
                                if (arr1[0].skill.length === 3)
                                    bigData.push(arr1);
                                else if (arr1[0].skill.length === 2)
                                    bigData2.unshift(arr1);
                                else
                                    bigData2.push(arr1);
                                bigData = bigData.concat(bigData2);
                                console.timeEnd('Time to find skills: ');
                                return res.send({success: true, newList: bigData});
                            } else {
                                if (arr1[0].skill.length === 3)
                                    bigData.push(arr1);
                                else if (arr1[0].skill.length === 2)
                                    bigData2.unshift(arr1);
                                else
                                    bigData2.push(arr1);
                                return recursive2(arr2);
                            }
                        });
                    };
                    return recursive2(data);
                }
            };
            return recursive(0);
        } else {
            return res.send({success: false});
            // return res.send({success: false});
            // function recursive(index) {
            //     if (req.body[index]) {
            //         pool.query('SELECT category FROM skills WHERE name = ?', req.body[index].sName,
            //             function(err, result) {
            //                 if (err) throw err;
            //                 if (result[0])
            //                     pool.query('SELECT user_id FROM user_skills WHERE skill_name IN (SELECT name FROM skills WHERE category = ?) GROUP BY user_id', result[0].category,
            //                         function(err, result2) {})
            //                 else
            //                     recursive(index + 1);

            //             });
            //     }
            // };
            // recursive(0);
        }
    });
};

// exports.getUsersBySkillAl = function(req, res) {
//     if (req.body.list[0]) {
//         var list = req.body.list;
//         var array = [];
//         function recursive(index) {
//             if (list[index]) {
//                 pool.query('SELECT id, first_name, last_name, profession, description, location_city, location_state, location_country, profile_picture, about, genre, creation_date, cover_picture, views, profile_picture_icon, cover_picture_cards FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?) ORDER BY views DESC', list[index], 
//                     function(err, results) {
//                         if (err) throw err;
//                         if (results[0])
//                             array.push(results[0]);
//                         recursive(index + 1);
//                 });
//             } else {
//                 if (array[0]) {
//                     if (!req.body.about && !req.body.geo) {
//                         pf.sortCardProfile(array, function(data) {
//                             return res.send({success: true, data: array});
//                         });
//                     } else {
//                         var al = new search(array, req.body);
//                         pf.sortCardProfile(al.getAL(), function(data) {
//                             return res.send({success: true, data: al.getAL()});
//                         });
//                     }
//                 } else
//                     return res.send({success: false});
//             }
//         };
//         recursive(0);
//     } else
//         return res.send({success: false});
// };

exports.getUserBySkillsOnly = function(req, res) {
    console.time('Time to find: ');
    if (req.body.list[0]) {
        var list = req.body.list;
        getListUserSearch(list, function(data) {
            var array = [];
            function recursive(index) {
                if (data[index]) {
                    pf.sortCardProfileNew(data[index], function(newData) {
                        if (data[index][0].skill[0])
                            newData.unshift(data[index][0].skill);
                        array.push(newData);
                        return recursive(index + 1)
                    });
                } else {
                    console.timeEnd('Time to find: ');
                    return res.send({success: true, data: array});
                }
            };
            recursive(0);
        });
    }
};

exports.getUsersBySkillAl = function(req, res) {
    console.time('Time to find: ');
    if (req.body.list[0]) {
        var list = req.body.list;
        getListUserSearch(list, function(data) {
            var array = [];
            var bigArray = [];
            function recursive(index) {
                array = [];
                if (data[index]) {
                    var al = new search(data[index], req.body).getALNew();
                    function recursive2(index2) {
                        if (al[index2]) {
                            pf.sortCardProfileNew(al[index2], function(newData) {
                                array.push(newData);
                                return recursive2(index2 + 1)
                            });
                        } else {
                            array.unshift({skills: data[index][0].skill})
                            bigArray.push(array);
                            return recursive(index + 1);
                        }
                    };
                    recursive2(0);
                } else {
                    console.timeEnd('Time to find: ');
                    return res.send({success: true, data: bigArray})
                }
            };
            recursive(0);
        });
    } else
        return res.send({ success: false });
};

exports.getUsersByAl = function(req, res) {
    if (req.body.about || req.body.geo) {
        console.log("OK");
        pool.query('SELECT id, first_name, last_name, description, location_city, network, location_state, location_country, profile_picture, about, cover_picture_cards FROM `profiles` WHERE fake = 0 ORDER BY views DESC', 
            function (err, results) {
            if (err) throw (err);
            if (results[0]) {
                var al = new search(results, req.body).getAL();
                var array = [];
                function recursive(index) {
                    if (al[index]) {
                        pf.sortCardProfile(al[index], function(data) {
                            array.push(data);
                            return recursive(index + 1);
                        });
                    } else
                        return res.send({success: true, data: array});
                };
                recursive(0);
            }
            // if (results[0]) {
            //     var al = new search(results, req.body);
            //     pf.sortCardProfile(al.getAL(), function(data) {
            //         return res.send({success: true, data: al.getAL()});
            //     });
            // }
        });
    }
    else 
        return res.send({success: false});
};
