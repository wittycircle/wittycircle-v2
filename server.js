/* Load Globals */
//require('./globals');
/* Load Server Modules */
var express		    = require('express.io');
var bodyParser		= require('body-parser');
var cookieParser	= require('cookie-parser');
var Validator		  = require('express-validator');
var app			      = express();
var _             = require('underscore');
var server		    = require('http').createServer(app);
var cors		      = require('cors');
var session		    = require('express-session');
//var RedisStore          = require('connect-redis')(session);
//var redis               = require("redis");
//var client              = redis.createClient();
var passport		  = require('passport');
var flash		      = require('connect-flash');
var cloudinary		= require('cloudinary');
var multer		    = require('multer');
var fs			      = require('fs');
var io			      = require('socket.io')(server);
var ensureAuth		= require('./controllers/auth').ensureAuthenticated;
var mandrill      = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');
var FileReader    = require('filereader')
  , fileReader    = new FileReader();

//var algoliaClient = require('./algo/algolia').algoliaClient;

app.http().io();
global.connectedUsers = [];

require('./passport')(passport);


var corsOptions = {
  origin: 'http://localhost:9000', //was localhost9000
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.io.route('ready', function(req){
    if(typeof req.session !== 'undefined'){
        connectedUsers[req.session.user_id] = {
            emit: function(event_tag, data){
                req.io.emit(event_tag, data);
            }
        };
    } else {
        req.io.emit('talk', {message: "User is not Logged in."});
    }
});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "http://localhost:9000"); //previously was localhost 9000
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header('Access-Control-Allow-Credentials', true);
    next();
};

app.configure(function(){
    app.use(allowCrossDomain);
});

//app.use(require('prerender-node').set('prerenderServiceUrl', 'http://www.wittycircle.com').set('prerenderToken', 'BzYfju05gGdTtLeibr1B'));

app.use(session({
    //store: new RedisStore({ host: '127.0.0.1', port: 80, client: client}),
    secret: 'wittycircle4ever',
    resave: true,
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
app.use(flash());

//app.use(express.static(__dirname + '/Public/app'));
//app.use(express.static(__dirname + '/Public/bower_components'));

//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

//app.use(express.static('Public/app'));


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
//require('./algolia')(app, algoliaClient);

/* Socket */
require('./io')(app, io, ensureAuth);

/* Start Server */
server.listen(80);
