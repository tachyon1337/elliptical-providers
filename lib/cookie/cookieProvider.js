
/*
 * =============================================================
 * elliptical.providers.$cookie v0.9.0.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-mvc'),require('./cookie'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-mvc','./cookie'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.providers=root.elliptical.providers || {};
        root.elliptical.providers.$cookie = factory(root.elliptical);
        root.returnExports = root.elliptical.providers.$cookie;
    }
}(this, function (elliptical) {

    var $cookie=elliptical.Provider.extend({


        /**
         *
         * @param key {String}
         * @returns {Object}
         */

        get:function(key){
            return (typeof key==='undefined') ? $.cookie() : $.cookie(key);
        },

        /**
         *
         * @param params {Object}
         * @returns {Object}
         */
        post:function(params){
            var name=params.key;
            var value=params.value;
            var options=params.options;
            return $.cookie(name, value, options);
        },

        /**
         *
         * @param params {Object}
         * @returns {Object}
         */
        put:function(params){
            var name=params.key;
            var value=params.value;
            var options=params.options;
            return $.cookie(name, value, options);
        },

        /**
         *
         * @param key {String}
         * @returns {Object}
         */
        delete:function(key){
            return $.removeCookie(key);
        }

    },{});



    return $cookie;

}));

