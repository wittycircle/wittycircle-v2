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

// exports.addMemberIncomplete = function(data, callback) {
//     if (data) {
//     request({
//             url: 'https://us12.api.mailchimp.com/3.0/lists/9eb7f2f948/members',
//             json: data,
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': 'apikey 34b83174e6d0447b04132f36ffbaa0da-us12'
//             }
//         }, function(error, response, body){
//             if(error) {
//                 console.log(error);
//         return ;
//             } else {
//         return callback();
//                 // THEN log the user into the app
//             }
//         });
//     } else {
//         console.log("NO DATA");
//         return callback();
//     }
// };
