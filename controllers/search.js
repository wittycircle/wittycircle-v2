/*** Section Search Users ***/
var tf = require('../tools/project_functions');
var search = require('./prototype');
var pf = require('../tools/profile_functions');
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
                                        return content ? res.send({success: true, data: content}) : res.send({success: false});     
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
        return res.send({success: true, data: scl.getSCL()});
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
                                            if (!req.body.status && !req.body.ctg && !req.body.geo) {
                                                //console.timeEnd("Time to run :");
                                                return res.send({success: true, data: finalData});
                                            }
                                            else {
                                                var scl = new search(finalData, req.body);
                                                //console.timeEnd("Time to run :");
                                                return res.send({success: true, data: scl.getSCL()});
                                            }
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
                        return res.send({success: true, data: scl.getSCL()});
                    });
                } else
                    return res.send({success: false});
            });
    } else
        return res.send(404).send("Error params");
};

//*** Get all users by skill in meet search
exports.getUsersBySkill = function(req, res) {
    var arrayId, sortList;
    arrayId = [];
    console.time('Time to find: ');
    function recursive(index) {
        if (req.body[index]) {
            pool.query('SELECT user_id FROM user_skills WHERE skill_name = ?', req.body[index].sName,
                function(err, data) {
                    if (err) throw err;
                    if (data[0]) {
                        sortListUser(data, sortList, function(res) {
                            if (res.success)
                                sortList = res.list;
                            recursive(index + 1);
                        });
                    } else
                        recursive(index + 1);
                });
        } else {
	    console.timeEnd('Time to find: ')
            return sortList ? res.send({success: true, data: sortList}) : res.send({success: false});
        }
    };
    recursive(0);
};

exports.getUsersBySkillAl = function(req, res) {
    if (req.body.list[0]) {
        var list = req.body.list;
        var array = [];
        function recursive(index) {
            if (list[index]) {
                pool.query('SELECT id, first_name, last_name, profession, description, location_city, location_state, location_country, profile_picture, about, genre, creation_date, cover_picture, views, profile_picture_icon, cover_picture_cards FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?) ORDER BY views DESC', list[index], 
                    function(err, results) {
                        if (err) throw err;
                        if (results[0])
                            array.push(results[0]);
                        recursive(index + 1);
                });
            } else {
                if (array[0]) {
                    if (!req.body.about && !req.body.geo) {
                        pf.sortCardProfile(array, function(data) {
                            return res.send({success: true, data: array});
                        });
                    } else {
                        var al = new search(array, req.body);
                        pf.sortCardProfile(al.getAL(), function(data) {
                            return res.send({success: true, data: al.getAL()});
                        });
                    }
                } else
                    return res.send({success: false});
            }
        };
        recursive(0);
    } else
        return res.send({success: false});
};

exports.getUsersByAl = function(req, res) {
    if (req.body.about || req.body.geo) {
        pool.query('SELECT id, first_name, last_name, profession, description, location_city, location_state, location_country, profile_picture, about, genre, creation_date, cover_picture, views, profile_picture_icon, cover_picture_cards FROM `profiles` ORDER BY views DESC', 
            function (err, results) {
            if (err) throw (err);
            // if (results[0]) {
            //     var al = new search(results, req.body).getAL();
            //     var array = [];
            //     function recursive(index) {
            //         if (al[index]) {
            //             pf.sortCardProfile(al[index], function(data) {
            //                 array.push(data);
            //                 return recursive(index + 1);
            //             });
            //         } else
            //             return res.send({success: true, data: array});
            //     };
            //     recursive(0);
            // }
            if (results[0]) {
                var al = new search(results, req.body);
                pf.sortCardProfile(al.getAL(), function(data) {
                    return res.send({success: true, data: al.getAL()});
                });
            }
        });
    }
    else 
        return res.send({success: false});
};
