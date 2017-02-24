// NEW SEARCH

'use strict';


const config = require('../database'),
    knex = require('knex')(config.database),
    _ = require('lodash');

// if (process.env.DEBUG === true)
// knex.on('query', (query) => console.log('SQL %s', query.sql));

const db = knex;

const TABLES = {
    ACCOUNT_VALIDATION: 'account_validation',
    USERS: 'users',
    USER_PROFILES: 'profiles',
    USER_SKILLS: 'user_skills',
    USER_EXPERIENCES: 'user_experiences',
    USER_LIKES: 'user_followers',
    USER_FOLLOWERS: 'user_followers',
    RESET: 'reset_passwords',
    RANK: 'rank_of_the_day',
    INVITATION: 'invitation',
    FIRST_LOG: 'first_log',
    PROJECTS: 'projects',
    PROJECT_LIKES: 'project_followers',
    PROJECT_NETWORK: 'project_network',
    PROJECT_REPLY_LIKES: 'project_reply_likes',
    PROJECT_DISCUSSION: 'project_discussion',
    PROJECT_DISCUSSION_LIKES: 'project_discussion_likes',
    PROJECT_DISCUSSION_REPLIES: 'project_discussion_replies',
    RANKS: 'rank_of_the_day',
    SKILLS: 'skills'
};

const h = {
    p_array: ['p.id', 'p.first_name', 'p.last_name', 'p.profile_picture', 'p.about', 'p.cover_picture', 'p.description'],
};
//prototype
h.up_array = h.p_array.concat('u.id as uid');
h.sub_user = db.select('id', 'profile_id').from(TABLES.USERS).as('u');
h.sub_profile = db.select(h.p_array).from(TABLES.USER_PROFILES + ' as p').as('p');
h.u_profile = db.select(h.up_array).from(h.sub_profile).join(h.sub_user, 'u.profile_id', 'p.id').groupBy('p.id').as('p');
h.ws_profile = (cond) => db.select(h.p_array).from(TABLES.USER_PROFILES + ' as p').where(cond).as('p');
h.exist = (table, id) => db(table).select('id').where({'id': id});
h.owner = (table, id, uid) => db(table).select('id').where({'id': id, 'user_id': uid});

const field_lookup = {
    'rank': 'sort.rank',
    'follower': 'follower',
    'id': 'sort.id',
    'skills': 'skills',
    'about': 'p.about',
    'location': 'location',
    'magic': 'RAND()'
};

function cardProfile(selector) {
    let exp = db.select('user_id')
        .from(TABLES.USER_EXPERIENCES).as('e');

    let skills;
    if (typeof selector.skills !== 'undefined')
        skills = db.select('*').from(TABLES.USER_SKILLS + ' as s').whereIn('s.skill_name', selector.skills).as('s');
    else
        skills = db.select('*').from(TABLES.USER_SKILLS + ' as s').as('s');


    const follower = db.select('user_id').count('user_id as total')
        .from(TABLES.USER_FOLLOWERS).groupBy('user_id').as('ssu');

    const following = db.select('follow_user_id').count('follow_user_id as MA')
        .from(TABLES.USER_FOLLOWERS).groupBy('follow_user_id').as('su');


    const sortCardProfile = db.select(['u.id', 'u.username', 'u.profile_id',
        's.user_id', 'r.rank as rank',
        db.raw('IFNULL(total, 0) as follower'), db.raw('IFNULL (MA, 0) as following'),
        db.raw('GROUP_CONCAT(DISTINCT skill_name) as skills')])
        .from(TABLES.USERS + ' as u')
        .join(skills, 'u.id', 's.user_id')
        .join(TABLES.RANK + ' as r', 'u.id', 'r.user_id')
        .leftOuterJoin(follower, 'ssu.user_id', 'u.id')
        .leftOuterJoin(following, 'su.follow_user_id', 'u.id')
        .groupBy('u.id').as('sort');

    const profileStuff = (location) => {
        let _query = db(TABLES.USER_PROFILES + ' as p')
            .select(_.concat(h.p_array, db.raw('CONCAT (p.location_city, ", ",  p.location_country) as location')))
            .where('p.description', '!=', 'NULL')
            .andWhere('p.profile_picture', '!=', 'NULL')
            .andWhere('p.fake', '=', '0');
        if (selector.about)
            _query.andWhere(selector.about);
        if (!_.isEmpty(location)) {
            const _location = _.words(location);
            _query.where('p.location_city', 'like', '%' + _location[0] + '%')
                .orWhere('p.location_state', 'like', '%' + _location[0] + '%')
                .orWhere('p.location_country', 'like', '%' + _location[1] + '%')
        }
        return _query.as('p')
    };

    return db.select(['sort.*', 'p.*'])
        .from(TABLES.USERS + ' as u')
        .join(profileStuff(selector.location), 'u.profile_id', 'p.id')
        .join(sortCardProfile, 'sort.id', 'u.id')
        .leftOuterJoin(exp, 'e.user_id', 'sort.user_id')
        .groupBy('u.id')
        .where(field_lookup['id'], '>', 0)
        .limit(100)
        .then(results => {
            if (!_.isEmpty(results))
            	console.log(results);
                // res.send(_.map(results, result => {
                //     result.skills = _.split(result.skills, ',');
                //     return result;
                // }));
            else
               return ;
        });
        // .catch(err, function(){
        // 	console.log(err);
        // });
    // .where('sort.rank', '>', '0') //todo remove
};
var hello = {
	skills: null,
	about : 'Discover new things',
	location : 'Paris, France'
}
cardProfile(hello);

