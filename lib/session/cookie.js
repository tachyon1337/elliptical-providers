/*
 * =============================================================
 * elliptical.providers.session.$cookie
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-mvc'),require('../cookie/cookie'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-mvc','../cookie/cookie'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.providers=root.elliptical.providers || {};
        root.elliptical.providers.$session=root.elliptical.providers.$session || {};
        root.elliptical.providers.$session.$cookie = factory(root.elliptical);
        root.returnExports = root.elliptical.providers.$session.$cookie;
    }
}(this, function (elliptical) {

    var $cookie=elliptical.Provider.extend({
        key:'sessionStore',

        /**
         * @param params {Object}
         * @param callback {Function}
         * @returns {Object}
         */

        get:function(params,callback){
            var key=(params.key===undefined) ? this.key : params.key;
            var session=$.cookie(key);
            session=(typeof session !== 'undefined') ? JSON.parse(session) : {};
            if(callback){
                return callback(null,session);
            }else{
                return session;
            }
        },

        /**
         *
         * @param params {Object}
         * @param callback {Function}
         * @returns {Object}
         */
        put:function(params,callback){
            var key=(params.key===undefined) ? this.key : params.key;
            var session=(typeof params.session==='object') ? JSON.stringify(params.session) : params.session;
            $.cookie(key, session, {path:'/'});
            if(callback){
                callback(null,session);
            }else{
                return session;
            }
        },

        /**
         *
         * @param params {Object}
         * @param callback {Function}
         * @returns {*}
         */
        delete:function(params,callback){
            var key=(params.key===undefined) ? this.key : params.key;
            $.removeCookie(key);
            if(callback){
                callback(null,null);
            }
        },

        $setKey:function(key){
            this.key=key;
        }

    },{});



    return $cookie;

}));

