var mysql = require('mysql');
global.pool  = mysql.createPool({
  connectionLimit : 100,
  host            : 'localhost',
  database        : 'wittydb',
  user            : 'root',
  password        : 'mwitty4!',
});

global.crypto = require('crypto');

global.checkSession = function(req){
    if (!req.isAuthenticated()) {
	return false;
    } else {
	return true;
    }
};

global.checkLogin = function(req){
    if(typeof req.session.user !== 'undefined'){
        var obj = {
            "error": true,
            "msg": "Already Logged In."
        };
        return obj;
    } else {
        return false;
    }
};
