// /* SENDGRID TEST */

// /* BABSON UNIVERSITY INVITATION MAILS */
// pool.query('SELECT first_name, last_name, description, profile_picture FROM profiles WHERE id = 1864',
// 	function(err, result) {
// 		if (err) throw err;

// 		pool.query('SELECT first_name, email FROM invite_university',
// 			function(err, list) {
// 				if (err) throw err;
// 				function recursive(index) {
// 					if (list[index]) {
// 						/* FROM PROFILE SETTING */
// 						var ffname = result[0].first_name + " " + result[0].last_name;

// 						/* HELPER SETTING */
// 						var helper = require('sendgrid').mail;
// 						var from_email = new helper.Email('campuses@wittycircle.info', 'Sarah Nichols via Wittycircle');
// 						var to_email = new helper.Email(list[index].email);
// 						var subject = 'Wittycircle is now open for the Babson community';
// 						var category = new helper.Category('Babson University 1');
// 						var content = new helper.Content(
// 							'text/html', 'Hello, Mail');
// 						var mail = new helper.Mail(from_email, subject, to_email, content);

// 						mail.addCategory(category);
// 						mail.personalizations[0].addSubstitution(
// 							new helper.Substitution('-tname-', list[index].first_name));
// 						mail.personalizations[0].addSubstitution(
// 							new helper.Substitution('-fname-', result[0].first_name));
// 						mail.personalizations[0].addSubstitution(
// 							new helper.Substitution('-ffname-', ffname));
// 						mail.personalizations[0].addSubstitution(
// 							new helper.Substitution('-fdesc-', result[0].description));
// 						mail.personalizations[0].addSubstitution(
// 							new helper.Substitution('-fpicture-', result[0].profile_picture));

// 						mail.setTemplateId('9ed77865-aba3-401f-b1c8-2aa4ce7934ee');

// 						/* API CREDENTIAL */
// 						var sg = require('sendgrid')('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');
// 						var request = sg.emptyRequest({
// 							method: 'POST',
// 							path: '/v3/mail/send',
// 							body: mail.toJSON(),
// 						});

// 						/* SEND MAIL */
// 						sg.API(request, function(error, response) {
// 							if (response.statusCode === 202) {
// 								console.log("SEND!");
// 								return recursive(index + 1);
// 							} else {
// 								console.log(error);
// 								return ;
// 							}
// 						});
// 					} else {
// 						console.log("DONE!");
// 						return ;
// 					}
// 				};
// 				recursive(0);
// 			});

// });
