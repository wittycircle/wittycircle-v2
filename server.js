/* Load Globals */
//require('./globals');
/* Load Server Modules */
var express		= require('express')
, bodyParser		= require('body-parser')
, cookieParser	= require('cookie-parser')
, Validator		= require('express-validator')
, app			= express()
, morgan		= require('morgan')
, _			= require('underscore')
, server		= require('http').createServer(app)
, https		= require('https')
// , reload		= require('reload')
, session		= require('express-session')
, RedisStore          = require('connect-redis')(session)
, redis               = require("redis")
, client              = redis.createClient()
, passport		= require('passport')
, cloudinary		= require('cloudinary')
, multer		= require('multer')
, fs			= require('fs')
, ensureAuth		= require('./controllers/auth').ensureAuthenticated
, mandrill		= require('mandrill-api/mandrill')
, mandrill_client	= new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA')
, algoliaClient	= require('./algo/algolia').algoliaClient
, compression = require('compression');
var httpsOption		= {
    key: fs.readFileSync('./ssl_key/wittycircle-key.pem'),
    cert: fs.readFileSync('./ssl_key/secure_key/2_www.wittycircle.com.crt'),
    ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
    honorCipherOrder: true,
};

app.use(compression());
require('./passport')(passport);
//app.use(morgan('combined'));
app.use(cookieParser());
app.use(require('express-force-domain')('https://www.wittycircle.com') );
app.use(require('prerender-node').set('prerenderToken', 'BzYfju05gGdTtLeibr1B'));

app.use(session({
    store: new RedisStore({ host: '127.0.0.1', port: 80, client: client, ttl: 86400000}),
    secret: 'wittycircle4ever',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 86400000, httpOnly: false },
}));

cloudinary.config({
  cloud_name: 'dqpkpmrgk',
  api_key: '638126979695427',
  api_secret: 'FC29M50mu-5ekjXXGaHtay7yNFk'
});

app.use(passport.initialize());
app.use(passport.session());

// app.use(express.static(__dirname + '/Public/'));
//app.use(express.static(__dirname + '/Public/dist/styles/'));
// app.use(express.static(__dirname + '/Public/dist/scripts/'));
app.use(express.static(__dirname + '/Public/dist/'));
app.use(express.static(__dirname + '/Public/app/'));
// app.use(express.static(__dirname + '/Public/app/styles/css'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.use(Validator({
    customValidators: {
        isArray: function(value) {
            return Array.isArray(value);
        },
        isString: function(value) {
            return typeof value === 'string';
        },
        min: function(param, num) {
            if(typeof param === 'string'){
                return param.length >= num;
            } else {
                return param >= num;
            }
        },
        max: function(param, num) {
            if(typeof param === 'string'){
                return param.length <= num;
            } else {
                return param <= num;
            }
        },
        isEmail: function(email) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        },
        isUnique: function(value, collum, table){
            return true;
            pool.query('SELECT `id` FROM `' + table + '` WHERE `' + collum + '` = ?', [value],
                function(err, rows, fields) {
                if (err) throw err;
                return rows.length === 0;
            });
        },
        isLoggedUser: function(value, elem){
            return value === elem.session.user_id;
        }
    },
    customSanitizers: {
        Clean: function(value, nice){
            if(typeof value === 'string'){
                if(typeof nice !== 'undefined' && nice === true){
                    return value.trim().replace(/(<([^>]+)>)/ig, "").Nice();
                } else {
                    return value.trim().replace(/(<([^>]+)>)/ig, "");
                }
            } else {
                return value;
            }
        },
        Nice: function(value){
            return value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
        }
    }
}));

String.prototype.Nice = function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
};

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

/* REST API */
require('./routes')(app, passport);

/* Algolia Search Engine */
require('./algolia')(app, algoliaClient);

/* Socket */
var ps = https.createServer(httpsOption, app);
// var io = require('socket.io')(server);
var io = require('socket.io').listen(ps);

require('./io')(app, io, ensureAuth);

/* Start Server */
//reload(server, app);
// server.listen(80);
ps.listen(443);
