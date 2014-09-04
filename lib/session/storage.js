/*
 * =============================================================
 * elliptical.providers.session.$storage
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-mvc'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-mvc'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.providers=root.elliptical.providers || {};
        root.elliptical.providers.session=root.elliptical.providers.session || {};
        root.elliptical.providers.session.$storage = factory(root.elliptical);
        root.returnExports = root.elliptical.providers.session.$storage;
    }
}(this, function (elliptical) {

    var $storage=elliptical.Provider.extend({
        key:'sessionStore',

        /**
         * @param params {Object}
         * @param callback {Function}
         * @returns {Object}
         */
        get:function(params,callback){
            var key=(params===undefined || params.key===undefined) ? this.key : params.key;
            var session=sessionStorage.getItem(key);
            try{
                session=JSON.parse(session);
            }catch(ex){
                session={};
            }

            if(callback){
                callback(null,session);
            }else{
                return session;
            }
        },

        /**
         * @param params {Object}
         * @param callback {Function}
         * @returns {Object}
         */
        put:function(params,callback){
            var key=(params===undefined || params.key===undefined) ? this.key : params.key;
            var session=(typeof params.session==='object') ? JSON.stringify(params.session) : params.session;
            sessionStorage.setItem(key,session);
            if(callback){
                callback(null,session);
            }else{
                return session;
            }
        },

        /**
         *
         * @param params {Object}
         * @param callback {String}
         * @returns {*}
         */
        delete:function(params,callback){
            var key=(params===undefined || params.key===undefined) ? this.key : params.key;
            sessionStorage.removeItem(key);
            if(callback){
                callback(null,null);
            }
        },

        $setKey:function(key){
            this.key=key;
        }


    },{});



    return $storage;

}));


