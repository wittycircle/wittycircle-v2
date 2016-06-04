var request = require('request');

exports.addMember = function(data, callback) {
    if (data) {
	request({
            url: 'https://us12.api.mailchimp.com/3.0/lists/1d172e278a/members',
            json: data,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'apikey 34b83174e6d0447b04132f36ffbaa0da-us12'
            }
        }, function(error, response, body){
            if(error) {
                console.log(error);
		return ;
            } else {
		// console.log(response.statusCode, '>>>>> USER ADDED TO MAILCHIMP');
		return callback();
                // THEN log the user into the app
            }
        });
    } else {
        console.log("NO DATA");
        return callback();
    }
};

exports.addMemberIncomplete = function(value, data, callback) {
    if (data) {
        var key;
        if (value === "post")
            key = '20a97df4fc';
        if (value === "picture")
            key = '25af0151d9';
        if (value === "pp")
            key = '30fe367eee';
        if (value === "upvote")
            key = '9e01316060';
        if (value === "profile")
            key = 'de455a3cd1';

        request({
            url: 'https://us12.api.mailchimp.com/3.0/lists/' + key + '/members',
            json: data,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'apikey 34b83174e6d0447b04132f36ffbaa0da-us12'
            }
        }, function(error, response, body){
            if(error) {
                console.log(error);
        return ;
            } else {
        return callback();
                // THEN log the user into the app
            }
        });
    } else {
        console.log("NO DATA");
        return callback();
    }
};
