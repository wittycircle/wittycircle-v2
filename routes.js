var ensureAuth = require('./controllers/auth').ensureAuthenticated;
var hasAccess = require('./controllers/auth').hasAccess;


module.exports = function(app, passport){

/* Users */
var users = require('./controllers/users');
app.get('/user/checkLog', ensureAuth, users.checkFirstLog);
app.get('/userId/:profile_id', users.getUserIdByProfileId);
app.get('/users', hasAccess, users.getUsers);
app.get('/profiles', hasAccess, users.getProfiles);
app.get('/user/:id', hasAccess, users.getUser);
app.get('/user/card/profiles', users.getCardProfile);
app.get('/user/card/profiles/home', users.getCardProfileHome);
app.get('/user_email/:email', users.getUserbyEmail);
app.get('/username/:username', users.getUserbyUsername);
app.get('/users/search/:search', users.searchUser);
app.post('/profiles/:profile_id', users.getProfilesByProfileId);
app.post('/profileId/:user_id', users.getProfileIdByUserId);
app.post('/users', users.createUser);
app.put('/user/:id', ensureAuth, users.updateUser);
app.put('/profiles/view/:username', users.updateProfileView);
app.put('/user/:id/credentials', ensureAuth, users.updateUserCredentials);
app.put('/user/checkLog/update', ensureAuth, users.updateFirstLog);
app.delete('/user/:id', users.deleteUser);
app.get('/user/valid/:token', users.getUsersValidateMail);
app.post('/user/valid/:token', users.ValidateAccount)
/* Social share */
app.get('/share/:user_id', ensureAuth, users.getUserShare);
app.put('/share/:user_id', ensureAuth, users.updateUserShare);

/* Profile */
var profile = require('./controllers/profile');
app.put('/profile/picture', ensureAuth, profile.updateProfilePicture);
app.put('/profile/location', ensureAuth, profile.updateProfileLocation);

/* signUp */
var signUp = require('./controllers/signup');
app.put('/signup/basic/:id', ensureAuth, signUp.updateBasic);
app.put('/signup/about', ensureAuth, signUp.updateAbout);

/* Social info */
app.get('/profile', ensureAuth, function(req, res) {
    pool.query('SELECT profile_id FROM users WHERE id = ?', [req.user.id],
	       function(err, result) {
                   if (err) throw err;
                   pool.query('SELECT * FROM profiles WHERE id = ?', [result[0].profile_id],
			      function(err, data) {
                                  res.send({user_info: data[0], user: req.user});
			      });
	       });
});

/* AUTHENTICATION API PUBLIC */
/* Facebook Users && Google Users */
// app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email'}));
// app.get('/auth/facebook/callback', 
//  	passport.authenticate('facebook', {
//  	    successRedirect : 'https://www.wittycircle.com',
//  	    failureRedirect : 'https://www.wittycircle.com'
//  	}));

//  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));
//  app.get('/auth/google/callback',
//  	passport.authenticate('google', {
//  	    successRedirect : 'https://www.wittycircle.com',
//  	    failureRedirect : 'https://www.wittycircle.com'
//  	}));

/* AUTHENTICATION API DEV */
/* Facebook Users && Google Users */
app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email'}));
app.get('/auth/facebook/callback',
	passport.authenticate('facebook', {
	    successRedirect : 'http://localhost',
	    failureRedirect : 'http://localhost'
	}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));
app.get('/auth/google/callback',
	passport.authenticate('google', {
	    successRedirect : 'http://localhost',
	    failureRedirect : 'http://localhost'
	}));

/* Schedule */
var schedule = require('./dateConvert');
app.get('/schedule', schedule.getSchedule);

/* View */
var view = require('./controllers/view');
// app.get('/view', ensureAuth, view.getView);
app.put('/view', ensureAuth, view.updateView);

/* Message */
var messages = require('./controllers/messages');
app.get('/messages/get/all', ensureAuth, messages.getAllConversation);
app.get('/messages/:id', ensureAuth, messages.getSpecificConversation);
app.post('/messages', ensureAuth, messages.createMessage);
app.put('/messages/', ensureAuth, messages.updateConversation);
app.put('/messages', ensureAuth, messages.deleteConversation);

/* Notification */
var notification = require('./notifications');
app.get('/notification', ensureAuth, notification.getNotifications);
//app.post('/notification/savelist', ensureAuth, notification.getNotificationList);
//app.get('/notification/getlist', ensureAuth, notification.getAllNotificationList);
app.put('/notification/update/all', ensureAuth, notification.updateAllNotif);
app.put('/notification/update/view', ensureAuth, notification.updateViewNotification);
app.put('/notification/update/user-follow', ensureAuth, notification.updateUserFollowNotif);
app.put('/notification/update/user-follow-by', ensureAuth, notification.updateUserFollowBy);
app.put('/notification/update/project-follow', ensureAuth, notification.updateProjectFollowNotif);
app.put('/notification/update/project-follow-by', ensureAuth, notification.updateProjectFollowBy);
app.put('/notification/update/project-involve', ensureAuth, notification.updateProjectInvolve);

/* Users Specifications */
var users_specification = require('./controllers/users_specification');
app.get('/user/:id/profile', users_specification.getUserProfile);
app.get('/user/:id/skills', users_specification.getUserSkills);
app.get('/user/:id/followers', users_specification.getUserFollowers);
app.get('/user/:id/projects', users_specification.getUserProjects);
app.get('/user/:id/messages', users_specification.getUserMessages);
app.get('/user/:id/portfolios', users_specification.getUserPortfolios);
app.get('/user/:id/interests', users_specification.getUserInterests);
app.get('/user/:id/experiences', users_specification.getUserExperiences);

// Aggregation of every user specific info above
app.get('/user/:id/extended', users_specification.getUserExtendedInformations);

/* Skills */
var skills = require('./controllers/skills');
app.get('/skills', hasAccess, skills.getSkills);
app.get('/skill/:id', ensureAuth, skills.getSkill);
app.get('/skills/:username', skills.getSkillsByUsername);
app.get('/skills/search/:search', skills.searchSkills);
app.post('/skills/add', ensureAuth,  skills.addSkillsToUser);
app.post('/skills', skills.createSkill);
app.put('/skill/:id', skills.updateSkill);
app.delete('/skill/:id', skills.deleteSkill);
app.delete('/skills/delete/:id', ensureAuth, skills.deleteUserSkill);

/* Interests */
var interests = require('./controllers/interests');
app.get('/interests', hasAccess, interests.getInterests);
app.get('/interests/:id', interests.getInterest);
app.get('/interest/:username', interests.getInterestsByUsername);
app.get('/interests/search/:search', interests.searchInterests);
app.post('/interests/add', ensureAuth, interests.addInterestsToUser);
app.post('/interests', interests.createInterest);
app.put('/interest/:id', interests.updateInterest);
app.delete('/interest/:id', interests.deleteInterest);
app.delete('/interest/delete/:id', ensureAuth, interests.deleteUserInterest);

/* Categories */
var categories = require('./controllers/categories');
app.get('/categories', hasAccess, categories.getCategories);
app.get('/category/:id', categories.getCategory);
app.get('/categories/search/:search', categories.searchCategories);
app.post('/categories', categories.createCategory);
app.put('/category/:id', categories.updateCategory);
app.delete('/category/:id', categories.deleteCategory);

/* Projects*/
var projects = require('./controllers/projects');
app.get('/projects', hasAccess, projects.getProjects);
app.get('/projects/discover', hasAccess, projects.getProjectsDiscover);
app.get('/project/:id', projects.getProject);
app.get('/project/public_id/:public_id', projects.getProjectByPublicId);
app.get('/projects/search/:search', projects.searchProjects);
app.post('/projects', projects.createProject);
app.put('/project/:id', projects.updateProject);
app.get('/project/:id/openings', projects.getProjectOpenings);
app.get('/project/:project_id/feedbacks', projects.getProjectFeedbacks);
app.get('/project/:public_id/feedbacks/public', projects.getProjectFeedbacksPublic);
app.get('/projects/category/:category_id', projects.getProjectsFromCategory);
app.get('/projects/user/:user_id', projects.getProjectsCreatedByUser);
app.get('/projects/user/:user_id/involved', projects.getProjectsInvolvedByUser);
app.delete('/project/:id', projects.deleteProject);
app.put('/project/increment/:id', projects.incrementViewProject);
//app.post('/project/involve', projects.involveUserInProject);
app.get('/project/:project_id/involved', projects.getInvolvedUserOfProject);
app.get('/project/involved_users/:public_id', projects.getAllUsersInvolvedByPublicId)
app.post('/project/involvment/accepted/:project_id/:user_id', projects.acceptInvolvment);
app.post('/project/involvment/declined/:project_id/:user_id', projects.declineInvolvment);
app.delete('/project/:project_id/involved/:user_id', projects.deleteUserInvolved);
app.get('/project/:public_id/auth', projects.getAllProjectMembers);
app.post('/project/video/poster/:public_id', projects.updateVideoPoster);

/* Project follow Maxence */
var project_followers = require('./controllers/project_followers.js');
app.get('/project_followers/:project_id', project_followers.getProjectFollowers);
app.get('/project_followers/public/:public_id', project_followers.getProjectFollowersByPublicId);

/* Project Openings */
var openings = require('./controllers/openings');
app.post('/openings', openings.createProjectOpening);
app.get('/openings/project/:project_id', openings.getOpeningsOfProject);
app.put('/opening/:id', openings.updateProjectOpening);
app.delete('/opening/:id', openings.deleteProjectOpening);

/* Feedbacks */
var feedbacks = require('./controllers/feedbacks');
app.post('/feedbacks', feedbacks.createProjectFeedback);
app.put('/feedback/:id', feedbacks.updateProjectFeedback);
app.delete('/feedback/:id', feedbacks.deleteProjectFeedback);

/* Feedback Replies */
var feedback_replies = require('./controllers/feedback_replies');
app.post('/feedback_replies', feedback_replies.createFeedbackReplies);
app.get('/feedback_replies/:id', feedback_replies.getFeedbackReplies);
app.delete('/feedback_replies/:id', feedback_replies.deleteFeedbackReplies);

/* Asks */
var asks = require('./controllers/asks');
app.get('/asks/:project_id', asks.getAsksofProject);
app.post('/asks', asks.createAsk);
app.delete('/ask/:ask_id', asks.deleteAsk);
app.get('/ask/public_id/:project_public_id', asks.getAsksofProjectByPublicId);
app.post('/ask_reply/add', asks.addAskReply);
app.get('/ask_replies/:ask_id', asks.getAskReplies);
app.delete('/ask_reply/delete/:id', asks.deleteAskReplies);

/* Polls */
var polls = require('./controllers/polls');
app.post('/polls/create/:project_id/:project_creator_id', polls.createPoll);
app.get('/polls/project/:project_id', polls.getPollsOfProject);

/* Experiences */
var experiences = require('./controllers/experiences');
app.get('/experiences', ensureAuth, experiences.getUserExperiences);
app.get('/experiences/:username', experiences.getUserExperiencesByUsername);
app.post('/experiences', ensureAuth, experiences.createUserExperience);
app.put('/experience/:id', ensureAuth, experiences.updateUserExperience);
app.delete('/experience/:id', ensureAuth, experiences.deleteUserExperience);

/* Portfolios */
var portfolios = require('./controllers/portfolios');
app.post('/portfolios', portfolios.createUserPortfolio);
app.put('/portfolio/:id', portfolios.updateUserPortfolio);
app.delete('/portfolio/:id', portfolios.deleteUserPortfolio);
app.get('/portfolio/:id/like', portfolios.likeUserPortfolio);
app.get('/portfolio/:id/dislike', portfolios.dislikeUserPortfolio);

/* Matching */
var matching = require('./controllers/matching');
app.get('/match/users/:id', matching.matchUsers);
app.get('/match/projects/:id', matching.matchProjects);

/* Follow */
var follow = require('./controllers/follow');
app.get('/follow/user/:username', ensureAuth, follow.getFollowUser);
//app.get('/follow/list', ensureAuth, follow.getFollowList);
app.get('/follow/project/check/:id', ensureAuth, follow.checkFollowProject);
app.get('/follow/projects/:username', follow.getProjectsFollowedByUsername);
app.get('/follow/projects/number/:username', follow.getNumberProjectFollowed)
app.get('/follow/users/:username', follow.getFollowing);
app.get('/follow/followUsers/:username', follow.getFollowers);
//*** Attention! the function to get follow project is in io.js file.
//app.get('/follow_notification/project', ensureAuth, follow.getMyProjectFollowedBy);
app.get('/user_followed/:id', ensureAuth, follow.getUserFollowed);
app.get('/user_followed', ensureAuth, follow.getAllUserFollowed);
app.post('/user_followed/get/list', ensureAuth, follow.getListFollowedUser);
//app.get('/user_followed/projectByUserId/byDate', ensureAuth, follow.getProjectFollowedBy);
//app.get('/follow/user/user-follow', ensureAuth, follow.getUserFollowBy);

/* Auth */
var auth = require('./controllers/auth');
app.get('/api', auth.checkLog);
app.post('/api/login', auth.login);
app.get('/api/logout', auth.logout);
app.post('/api/resetpassword', auth.ResetPassword);
app.get('/api/resetpassword/:token', auth.getUserForResetPassword);
app.post('/api/updatepasswordreset', auth.updatePasswordReset);

/* Upload */
var upload = require('./controllers/upload');
// app.post('/upload', ensureAuth, upload.uploadPhoto);
app.post('/upload/project/cover', ensureAuth, upload.uploadProjectCover);
app.post('/upload/project/cover_card', ensureAuth, upload.uploadProjectCard);
app.post('/upload/videos', upload.uploadVideoProject);
app.post('/upload/profile/cover', ensureAuth, upload.uploadProfileCover);
app.post('/upload/profile_pic_icon', ensureAuth, upload.uploadPhotoIcon);
app.post('/upload/profile/cover_card', ensureAuth, upload.uploadProfileCard);
app.post('/upload/delete/videos', ensureAuth, upload.deleteVideoProject);
app.get('/image/transformation/resize/:public_id/:width/:height/:crop', upload.resizePhoto);
/* Redactor */
app.post('/upload/redactor', upload.redactorImage);

/* History */
var history = require('./controllers/history');
app.post('/history/project/:id', history.addProjectToUserHistory);
app.get('/history/project/:id', history.getUserProjectHistory);

/* Picture */
var picture = require('./controllers/picture');
app.get('/picture/profile', ensureAuth, picture.getRandomProfilePicture);
app.get('/picture/cover', ensureAuth, picture.getRandomCoverPicture);
app.get('/picture/check/profile/:profileId', ensureAuth, picture.checkExistProfilePicture);
app.post('/picture/get/cover', picture.getCoverPicture);

/* Search */
var search = require('./controllers/search');
app.post('/search/projects/help/:help', search.getProjectByHelp);
app.post('/search/projects/skills', search.getProjectsBySkill);
app.put('/search/projects/skills', search.getProjectBySkillScl);
app.post('/search/projects/scl', search.getProjectsByStatusAndSkill);
app.post('/search/users', search.getUsersBySkill);
app.post('/search/users/al', search.getUsersByAl);
app.put('/search/users', search.getUsersBySkillAl);

app.get('*', function(req, res) {
    res.sendFile(__dirname + '/Public/app/index.html');
    //res.cookie('name', 'tobi');
});

};
