
var mailchimp = require('./mailchimpRequest');

module.exports = function(app, request) {
   /* pool.query('SELECT profile_id, email FROM users ORDER BY id ASC', function(err, result) {
	if (err) throw err;
	else {
	    function recursive(index) {
		if (result[index]) {
		    pool.query('SELECT first_name, last_name FROM profiles WHERE id = ?', result[index].profile_id,
			       function(err, result2) {
				   if (err) throw err;
				   else {
				       var data = {
					   'email_address': result[index].email,
					   'status': 'subscribed',
					   'merge_fields': {
					       'FNAME': result2[0].first_name,
					       'LNAME': result2[0].last_name
					   }
				       };
				       mailchimp.addMemberToMailchimp(request, data, function() {
					   recursive(index + 1);
				       });
				   }
			       });
		} else {
		    console.log("All Mail is added");
		    return ;
		}
	    };
	    recursive(0);
	}
    });*/
};
