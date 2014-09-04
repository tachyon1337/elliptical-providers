var $rest = require('./lib/rest/rest');
var session = {};
session.$storage = require('./lib/session/storage');
session.$cookie = require('./lib/session/cookie');
session.$local=require('./lib/session/local');
var $memory = require('./lib/memory/memory');
var $store = new $memory();
var $template = require('./lib/template/template');
$template.$store = $store;
var $cookie = require('./lib/cookie/cookieProvider');
var $transitions = require('./lib/transitions/transitions');
var $validation = require('./lib/validation/validation');
var $pagination = require('./lib/pagination/pagination');
var $identity = require('./lib/identity/identity');

module.exports = {
    $cookie: $cookie,
    $store: $store,
    $memory: $memory,
    $template: $template,
    $rest: $rest,
    session: session,
    $transitions: $transitions,
    $validation: $validation,
    $pagination: $pagination,
    $identity:$identity
};



