/*!
 * jQuery Cookie Plugin v1.3.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */



(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    }else if (typeof module === 'object' && module.exports) {
        //CommonJS module

        if(typeof window!='undefined'){
            factory($);
        }

    } else {
        // Browser globals.
        factory($);
    }
}(function ($) {

    var pluses = /\+/g;

    function raw(s) {
        return s;
    }

    function decoded(s) {
        return decodeURIComponent(s.replace(pluses, ' '));
    }

    function converted(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }
        try {
            return config.json ? JSON.parse(s) : s;
        } catch(er) {}
    }

    var config = $.cookie = function (key, value, options) {

        // write
        if (value !== undefined) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = config.json ? JSON.stringify(value) : String(value);

            return (document.cookie = [
                config.raw ? key : encodeURIComponent(key),
                '=',
                config.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join(''));
        }

        // read
        var decode = config.raw ? raw : decoded;
        var cookies = document.cookie.split('; ');
        var result = key ? undefined : {};
        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = decode(parts.join('='));

            if (key && key === name) {
                result = converted(cookie);
                break;
            }

            if (!key) {
                result[name] = converted(cookie);
            }
        }

        return result;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        if ($.cookie(key) !== undefined) {
            // Must not alter options, thus extending a fresh object...
            $.cookie(key, '', $.extend({}, options, { expires: -1 }));
            return true;
        }
        return false;
    };

    return $;

}));



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



/*
 * =============================================================
 * elliptical.providers.$identity v0.9.0.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * elliptical-mvc
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
        root.elliptical.providers.$identity = factory(root.elliptical);
        root.returnExports = root.elliptical.providers.$identity;
    }
}(this, function (elliptical) {

    var $identity=elliptical.Provider.extend({
        tokenKey:'authToken',
        identityTokenKey:'authIdentity',

        on:function(token,profile,callback){
            var req=this.req,
                res=this.res,
                session=req.session,
                membership=session.membership;

            var err=null;
            if(!membership){
                err.statusCode=401;
                err.message='No membership object available';
                callback(err,null);
            }else{
                //store current profile in cookie
                var aI={};
                aI.authToken=req.cookies[this.tokenKey];
                aI.profile=membership.profile;
                aI.roles=membership.roles;
                console.log(aI);
                res.cookie(this.identityTokenKey,JSON.stringify(aI));
                console.log(this.tokenKey);
                console.log(token);
                //set impersonated profile
                res.cookie(this.tokenKey,token);
                membership.profile=profile;

                callback(err,null);
            }
        },

        off:function(callback){
            var req=this.req,
                res=this.res,
                session=req.session,
                membership=session.membership;
            var err=null;
            if(!membership){
                err.statusCode=401;
                err.message='No membership object available';
                callback.call(this,err,null);
            }else{
                //restore profile
                var identity=req.cookies[this.identityTokenKey];
                identity=JSON.parse(identity);
                var authToken=identity.authToken;
                res.cookie(this.tokenKey,authToken);

                //delete cookie reference
                res.clearCookie(this.identityTokenKey);

                callback(err,identity);
            }
        },

        setKeys:function(params){
            if(typeof params.tokenKey !=='undefined'){
                this.tokenKey=params.tokenKey;
            }
            if(typeof params.identityTokenKey !=='undefined'){
                this.identityTokenKey=params.identityTokenKey;
            }
        }


    },{});



    return $identity;

}));


/*
 * =============================================================
 * elliptical.providers.$memory v0.9.0.1
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
        module.exports = factory(require('elliptical-mvc'),require('elliptical-utils'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-mvc','elliptical-utils'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.providers=root.elliptical.providers || {};
        root.elliptical.providers.$memory = factory(root.elliptical,root.elliptical.utils);
        root.returnExports = root.elliptical.providers.$memory;
    }
}(this, function (elliptical,utils) {
    var async=elliptical.async;
    var _=utils._;

    var $memory=elliptical.Provider.extend({

        store: [],
        /* the memory store: an array of key/value pairs
         store=[obj1,obj2,...objN], where obj[i]={key:<key>,val:<val>}
         */

        index:[]
        /* array of index objects that contain the keys for each model type
         index=[obj1,obj2,...objN], where obj[i]={model:<model>,keys:<[key1,key2,...keyM]>}
         */


    },{
        /* prototype methods */

        /**
         *
         * @param params {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        get: function(params,model,callback){
            var id=params.id;
            if(typeof id==='undefined'){
                /* get all */
                this.getAll(model,function(err,data){
                    if(callback){
                        callback(err,data);
                    }
                });
            }else{
                /* get by id */
                this.getByKey(id,function(err,data){
                    if(callback){
                        callback(err,data);
                    }
                });
            }
        },



        /**
         *
         * @param key {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        getByKey: function (key, callback) {
            var store = this.constructor.store;
            var err = null;
            var val;

            try {
                for (var i = 0; i < store.length; i++) {
                    if (store[i].key === key) {
                        val = store[i].val;
                        break;
                    }
                }

                if (typeof val === 'undefined') {
                    err={
                        statusCode:404,
                        message:'key does not exist'
                    };

                    val = null;
                }

                if (callback) {

                    callback(err, val);

                }else{
                    return val;
                }
            } catch (ex) {
                if (callback) {
                    callback(ex, null);
                }
            }

        },

        /**
         *
         * @param keys {Array}
         * @param fn {Function}
         * @returns fn
         * @public
         */
        mget: function (keys, fn) {
            var err = null;
            var vals = [];
            var self = this;
            try {
                var length = keys.length;
                if (length > 0) {

                    async.forEach(keys, function (key, callback) {
                        self.getByKey(key, function (err, val) {
                            if (!err) {
                                vals.push(val);
                                callback(); //inform async that the iterator has completed
                            } else {
                                throw new Error(err);
                            }

                        });

                    }, function (err) {
                        if (!err) {
                            if (fn) {
                                fn(err, vals);
                            }
                        } else {
                            if (fn) {
                                fn(err, []);
                            }
                        }

                    });
                } else {
                    if (fn) {
                        err={
                            statusCode:400,
                            message:'invalid keys'
                        };
                        //err = 'invalid keys';
                        fn(err, []);
                    }
                }
            } catch (ex) {
                if (fn) {
                    fn(ex, []);
                }
            }
        },

        /**
         *
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        getAll:function(model,callback){
            var index=this.constructor.index;
            var modelIndex=_getModelIndex(model,index);
            var keyArray=modelIndex.keys;

            this.mget(keyArray,function(err,data){
                if(callback){
                    callback(err,data);
                }
            })

        },

        /**
         * returns the entire array store
         * @param callback {Function}
         * @public
         */
        list: function(callback){
            var store=this.constructor.store;
            if(callback){
                callback(null,store);
            }
        },

        /**
         *
         * @param params {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        post: function(params,model,callback){
            var id=utils.guid();
            params.id=id;
            this.set(id,params,model,function(err,data){
                if(callback){
                    callback(err,data);
                }
            });

        },

        /**
         *
         * @param params {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        put: function(params,model,callback){
            var id=params.id;
            this.set(id,params,model,function(err,data){
                if(callback){
                    callback(err,data);
                }
            });
        },




        /**
         *
         * @param key {String}
         * @param val {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        set: function (key, val, model, callback) {

            var store = this.constructor.store;
            var index = this.constructor.index;
            var err = null;
            //if object already exists, then we merge val with the old object to get a new object, delete the old object, insert the new object
            try {
                var obj=_validateKey(key,model, store,index);
                var oVal={};
                if(!obj){
                    oVal=val;
                }else{
                    oVal=_.extend(obj, val);

                }
                var cacheObj = {
                    key: key,
                    val: oVal
                };

                store.push(cacheObj);

                if (callback) {
                    callback(err, val);
                }
            } catch (ex) {
                if (callback) {
                    callback(ex, {});
                }
            }

        },

        /**
         *
         * @param pairArray {Array}
         * @param model {String}
         * @param fn {Function}
         * @returns fn
         * @public
         */
        mset: function (pairArray,model, fn) {
            var err = null;
            var vals = [];
            var self = this;
            try {
                var length = pairArray.length;
                if (length > 0 && length % 2 === 0) {
                    var list=_createObjectList(pairArray);
                    async.forEach(list, function (item, callback) {
                        self.set(item.key,item.val,model, function (err, val) {
                            if (!err) {
                                vals.push(val);
                                callback(); //inform async that the iterator has completed
                            } else {
                                throw new Error(err);
                            }

                        });

                    }, function (err) {
                        if (!err) {
                            if (fn) {
                                fn(err, vals);
                            }
                        } else {
                            if (fn) {
                                fn(err, []);
                            }
                        }

                    });
                } else {
                    if (fn) {
                        err={
                            statusCode:400,
                            message:'invalid keys'
                        };
                        fn(err, []);
                    }
                }
            } catch (ex) {
                if (fn) {
                    fn(ex, []);
                }
            }
        },

        /**
         *
         * @param key {String}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        remove: function (key,model, callback) {
            var store = this.constructor.store;
            var index=this.constructor.index;
            var err = null;

            try {
                _removeKeyFromIndex(key,model,index);
                _deleteKey(key, store);
                if (callback) {
                    callback(null);
                }
            } catch (ex) {
                if (callback) {
                    callback(ex);
                }
            }

        },



        /**
         *
         * @param params {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        delete: function(params,model,callback){
            var id=params.id;
            this.remove(id,model,function(err,data){
                if(callback){
                    callback(err,data);
                }
            });
        },



        flushModel:function(model,callback){
            var index = this.constructor.index;
            var modelIndex=_getModelIndex(model,index);
            try{
                if(!modelIndex){
                    if(callback){
                        return callback(null,null);
                    }
                }
                var keyArray=modelIndex.keys;
                for (var i = 0, max = keyArray.length; i < max; i++) {
                    var key=keyArray[i];
                    _deleteKey(key);
                }
                _removeModelIndex(model,index);
                if(callback){
                    callback(null,null);
                }
            }catch(ex){
                if(callback){
                    callback(err,null);
                }
            }


        },

        /**
         * clears the entire store and index
         * @param callback {Function}
         * @returns callback
         * @public
         */
        flushAll: function (callback) {
            var store = this.constructor.store;
            var index = this.constructor.index;
            var err = null;

            try {
                store.splice(0, store.length);
                index.splice(0, index.length);
                if (callback) {
                    callback(null);
                }
            } catch (ex) {
                if (callback) {
                    callback(ex);
                }
            }

        },

        /**
         *
         * @param callback {Function}
         * @returns callback
         * @public
         */
        length: function (callback) {
            var store = this.constructor.store;
            var err = null;

            try {
                var length = store.length;
                if (callback) {
                    callback(err, length);
                }
            } catch (ex) {
                if (callback) {
                    callback(ex, 0);
                }
            }

        },



        /**
         *
         * @param params {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        query: function(params,model,callback){
            throw new Error('query not implemented');
        },

        /**
         *
         * @param params {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        command: function(params,model,callback){
            throw new Error('command not implemented');
        }



    });

    /**
     *  validates a key against the store index
     *
     *  get model index
     *  if exists
     *    check if key exists,
     *    if key exists, delete object from store
     *     return obj
     *    else, insert key into index
     *     return null
     *  else
     *    create model index
     *    insert key
     *    return null
     *
     * @param key {String}
     * @param model {String}
     * @param store {Array}
     * @param index {Array}
     * @returns {Object}\null
     * @private
     */

    function _validateKey(key, model,store,index) {
        var obj=_getModelIndex(model,index);
        if(obj){
            if(_isModelIndexKey(key,obj)){
                return _deleteKey(key,store);
            }else{
                _insertModelIndexKey(key,obj);
                return null;
            }

        }else{
            _createModelIndex(key,model,index);
            return null;
        }

    }


    /**
     * get the model index
     * @param model {String}
     * @param index {Array}
     * @returns {Object}|null
     * @private
     */
    function _getModelIndex(model,index){
        var obj=null;
        for (var i = 0, max = index.length; i < max; i++) {
            if (index[i].model === model) {
                obj=index[i];
                break;
            }
        }
        return obj;
    }


    /**
     * is the key already indexed
     * @param key {String}
     * @param modelIndex {Object}
     * @returns {boolean}
     * @private
     */
    function _isModelIndexKey(key,modelIndex){
        var keyArray=modelIndex.keys;
        var exists=false;
        for (var i = 0, max = keyArray.length; i < max; i++) {
            if (keyArray[i] === key) {
                exists=true;
                break;
            }
        }
        return exists;
    }


    /**
     * insert a new modelIndex
     * @param key {String}
     * @param model {String}
     * @param index {Array}
     * @private
     */
    function _createModelIndex(key,model,index){
        var newModelIndex={};
        newModelIndex.model=model;
        newModelIndex.keys=[];
        newModelIndex.keys.push(key);
        index.push(newModelIndex);
    }


    /**
     * delete key/val pair object from the store
     * returns the deleted object
     * @param key {String}
     * @param store {Array}
     * @returns {Object}
     * @private
     */
    function _deleteKey(key, store) {
        var obj=null;
        for (var i = 0, max = store.length; i < max; i++) {
            if (store[i].key === key) {
                obj=store[i].val;
                store.splice(i, 1);
                break;
            }
        }

        return obj;
    }

    function _removeKeyFromIndex(key,model,index){
        var modelIndex=_getModelIndex(model,index);
        var keyArray=modelIndex.keys;
        for (var i = 0, max = keyArray.length; i < max; i++) {
            if (keyArray[i] === key) {
                keyArray.splice(i, 1);
                break;
            }
        }
    }

    /**
     * inserts key into the model index
     * @param key {String}
     * @param modelIndex {Object}
     * @private
     */
    function _insertModelIndexKey(key,modelIndex){
        var keyArray=modelIndex.keys;
        keyArray.push(key);
    }

    /**
     * remove the model index from the index
     * @param model {String}
     * @param index {Array}
     */
    function _removeModelIndex(model,index){
        for (var i = 0, max = index.length; i < max; i++) {
            if (index[i].model === model) {
                index.splice(i,1);
                break;
            }
        }
    }


    /**
     * create an array of objects from a pairArray
     * @param pairArray
     * @returns {Array}
     * @private
     */
    function _createObjectList(pairArray){
        var objArray=[];
        for (var i = 0, max = pairArray.length; i < max; i++) {
            if(i===0 || i%2===0){
                var obj={};
                obj.key=pairArray[i];
                var j=i+1;
                obj.val=pairArray[j];
                objArray.push(obj);
            }
        }

        return objArray;
    }



    return $memory;

}));



/*
 * =============================================================
 * elliptical.providers.$odata v0.9.1
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
        module.exports = factory(require('elliptical-mvc'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-mvc'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.providers=root.elliptical.providers || {};
        root.elliptical.providers.$odata = factory(root.elliptical);
        root.returnExports = root.elliptical.providers.$odata;
    }
}(this, function (elliptical) {

    var $odata=elliptical.Provider.extend({

        filter:function(endpoint,filter){
            var encodedFilter = '$filter=' + encodeURIComponent(filter);
            return (endpoint.indexOf('?') > -1) ? '&' + encodedFilter : '?' + encodedFilter;
        },

        orderBy:function(endpoint,orderBy){
            var encodedOrderBy = '$orderby=' + encodeURIComponent(orderBy);
            return (endpoint.indexOf('?') > -1) ? '&' + encodedOrderBy : '?' + encodedOrderBy;
        },

        top:function(endpoint,top){
            var encodedTop = '$top=' + top;
            return (endpoint.indexOf('?') > -1) ? '&' + encodedTop : '?' + encodedTop;
        },

        skip:function(endpoint,skip){
            var encodedSkip = '$skip=' + skip;
            return (endpoint.indexOf('?') > -1) ? '&' + encodedSkip : '?' + encodedSkip;
        },

        paginate:function(endpoint,params){
            var page=params.page,
                pageSize=params.pageSize,
                skip,
                encodedPaginate;

            if(typeof page==='undefined' || typeof pageSize==='undefined'){
                return endpoint;
            }else{
                page--;
                skip=page*pageSize;
                encodedPaginate=(skip > 0) ? '$skip=' + skip + '&$top=' + pageSize + '&$inlinecount=allpages' : '$top=' + pageSize + '&$inlinecount=allpages';
                return (endpoint.indexOf('?') > -1) ? '&' + encodedPaginate : '?' + encodedPaginate;
            }
        }

    },{});

    return $odata;


}));



/*
 * =============================================================
 * elliptical.providers.$pagination v0.9.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 *
 * returns a pagination ui context(object) for template binding
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
        root.elliptical.providers.$pagination=factory(root.elliptical);
        root.returnExports = root.elliptical.providers.$pagination;
    }
}(this, function (elliptical) {
    /**
     * @param paginate {Object}
     * @param pagination {Object}
     * @param data {Object}
     * @returns {Object}
     */

    var $pagination=elliptical.Provider.extend({
        count:'count',
        data:'data',
        spread:10,

         get:function(params,data){

             var count_=this.count;
             var data_=this.data;
             var spread_=this.spread;

             if(params.paginate){
                 var filter=params.filter;
                 var orderBy=params.orderBy;
                 params=params.paginate;
                 if(filter !== undefined){
                     params.filter=filter;
                 }
                 if(orderBy !== undefined){
                     params.orderBy=orderBy;
                 }
;             }

             return _pagination(params,data);

             /**
              *
              * @param params {Object}
              * @param result {Object}
              *
              * @returns {Object}
              * @qpi private
              */
             function _pagination(params,result) {
                 var baseUrl,page,count,pageSize,pageSpread,data;
                 baseUrl=params.baseUrl;
                 page=params.page;

                 count=result[count_];
                 data=result[data_];

                 pageSize=params.pageSize;
                 pageSpread=spread_;
                 try {
                     page = parseInt(page);
                 } catch (ex) {
                     page = 1;
                 }

                 var pageCount = parseInt(count / pageSize);
                 var remainder=count % pageSize;
                 if(pageCount < 1){
                     pageCount=1;
                 }else if(remainder > 0){
                     pageCount++;
                 }

                 //pagination object
                 var pagination = {
                     page: page,
                     pageCount: pageCount,
                     prevPage: baseUrl,
                     prevClass: 'hide',
                     nextPage: baseUrl,
                     nextClass: 'hide',
                     pages: [],
                     count:count

                 };
                 //assign pagination properties
                 //prev
                 if (page > 1) {
                     pagination.prevClass = '';
                     pagination.prevPage = assignUrl(baseUrl,parseInt(page - 1),params);
                 }
                 //next
                 if (page < pageCount) {
                     pagination.nextClass = '';
                     pagination.nextPage = assignUrl(baseUrl,parseInt(page + 1),params);
                 }

                 //get page links

                 if (pageCount > 1) {
                     pagination.pages = _pageLinks(baseUrl, page, pageCount,pageSpread,params);

                 }

                 return{
                     pagination:pagination,
                     data:data
                 };

             }


             /**
              *
              * @param baseUrl {String}
              * @param page {Number}
              * @param pageCount {Number}
              * @param pageSpread {Number}
              * @returns {Array}
              * @api private
              */
             function _pageLinks(baseUrl, page, pageCount,pageSpread,params) {
                 var pages = [];
                 if (pageSpread > pageCount) {
                     pageSpread = pageCount;
                 }

                 if (page <= pageSpread) {

                     for (var i = 0; i < pageSpread; i++) {
                         var obj = {
                             page: i + 1,
                             pageUrl:assignUrl(baseUrl,parseInt(i + 1),params)
                         };

                         if (i === parseInt(page - 1)) {
                             obj.activePage = 'active';
                         }
                         pages.push(obj);
                     }
                     return pages;
                 } else {
                     var halfSpread = parseInt(pageSpread / 2);
                     var beginPage, endPage;
                     if (pageCount < page + halfSpread) {
                         endPage = pageCount;
                         beginPage = endPage - pageSpread;
                     } else {
                         endPage = page + halfSpread;
                         beginPage = page - halfSpread;
                     }
                     for (var i = beginPage; i < endPage + 1; i++) {
                         var obj = {
                             page: i,
                             pageUrl:assignUrl(baseUrl,i,params)
                         };
                         if (i === page) {
                             obj.activePage = 'active';
                         }
                         pages.push(obj);
                     }
                     return pages;
                 }
             }

             function assignUrl(baseUrl,index,params){
                 var isFiltered=false;
                 var pageUrl=baseUrl + '/' + index;
                 if(params.filter){
                     isFiltered=true;
                     pageUrl+='?' + '$filter=' + encodeURIComponent(params.filter);
                 }
                 if(params.orderBy){
                     pageUrl+=(isFiltered) ? '&$orderby=' + encodeURIComponent(params.orderBy) : '?$orderby=' + encodeURIComponent(params.orderBy);
                 }

                 return pageUrl;
             }

         }


    },{});


    return $pagination;


}));


/*
 * =============================================================
 * elliptical.providers.$rest v0.9.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * elliptical-mvc
 * elliptical-http
 * $odata
 *
 * rest provider
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-mvc'),require('elliptical-http'),require('../odata/odata'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-mvc','elliptical-http','../odata/odata'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.providers=root.elliptical.providers || {};
        root.elliptical.providers.$rest = factory(root.elliptical,root.elliptical.http,root.elliptical.$odata);
        root.returnExports = root.elliptical.providers.$rest;
    }
}(this, function (elliptical,http,odata) {
    var factory=elliptical.factory;
    var async=elliptical.async;

    var $rest=elliptical.Provider.extend({
        _data:null,
        port: null,
        path: null,
        host: null,
        protocol:null,
        $queryProvider:odata,
        onSend: null,

        /**
         * constructor
         * @param opts {Object}
         * @param $queryProvider {Object}
         */
        init:function(opts,$queryProvider){
            this.host=opts.host || 'locahost';
            this.port = opts.port || 80;
            this.path = opts.path || '/api';
            this.protocol=opts.protocol || 'http';

            if($queryProvider !== undefined){
                this.$queryProvider=$queryProvider;
            }
        },

        /**
         * http get
         * @param params {Object}
         * @param model {String}
         * @param query {Object}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        get: function (params, model, query,callback) {
            if(typeof query ==='function'){
                callback=query;


            }

            var options=this._getOptions(model,'GET',undefined);

            var q = '';
            var i = 0;
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    var val = encodeURIComponent(params[key]);
                    if (i === 0) {
                        q+='?' + key + '=' + val;
                        i++;
                    } else {
                        q+='&' + key + '=' + val;
                    }
                }
            }
            if (q !== '') {
                options.path+='/' + q;
            }

            //test query options
            if(typeof query.filter !== 'undefined'){
                options.path += this.$queryProvider.filter(options.path,query.filter);
            }

            if(typeof query.orderBy !== 'undefined'){
                options.path += this.$queryProvider.orderBy(options.path,query.orderBy);
            }

            if(typeof query.paginate !== 'undefined'){
                options.path += this.$queryProvider.paginate(options.path,query.paginate);
            }else{
                //don't allow mixing of paginate with skip/top since paginate is more or less a convenience wrapper for skip & top
                if(typeof query.skip !== 'undefined'){
                    options.path += this.$queryProvider.skip(options.path,query.skip);
                }

                if(typeof query.top !== 'undefined'){
                    options.path += this.$queryProvider.top(options.path,query.top);
                }
            }

            //send
            this._send(options,model,callback);

        },

        /**
         * http post
         * @param params {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        post: function (params, model, callback) {
            var options = this._getOptions(model,'POST',params);
            this._send(options,model,callback);

        },

        /**
         * non-standard http implementation of a "merge"
         * @param params {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        patch: function (params, model, callback) {
            throw new Error('patch not implemented');
        },


        /**
         * http put
         * @param params {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        put: function (params, model,callback) {
            var options = this._getOptions(model,'PUT',params);
            this._send(options,model,callback);
        },


        /**
         * http delete
         * @param params {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        delete: function (params, model, callback) {
            var options=this._getOptions(model,'DELETE',undefined);
            var q = '';
            var i = 0;
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    var val = encodeURIComponent(params[key]);
                    if (i === 0) {
                        q+= '?' + key + '=' + val;
                        i++;
                    } else {
                        q+='&' + key + '=' + val;
                    }
                }
            }
            if (q != '') {
                options.path+= '/' + q;
            }
            //send
            this._send(options,model,callback);
        },



        /**
         * non-standard http implementation of a sql query
         * @param params {Object}
         * @param model {String}
         * @param opts {Object}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        query: function (params, model,opts, callback) {
            throw new Error('query not implemented');
        },


        /**
         * non-standard http implementation of a sql command
         * @param params {Object}
         * @param model {String}
         * @param opts {Object}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        command: function (params, model,opts, callback) {
            throw new Error('command not implemented');
        },


        /**
         * send the request
         * @param options {Object}
         * @param model {String}
         * @param callback {Function}
         * @returns callback
         * @private
         */
        _send:function(options,model,callback){

            /* we asynchronously pass through to _onAuthenticate and _onSend(if a callback has been defined)
               using the async waterfall pattern before passing off to http.
               Note: _onAuthenticate should be implemented by extending the $rest provider and overwriting the current
               method which does nothing but pass through. You can also implement authentication by relying on the _onSend
               callback, which does pass up the request object, if available.
               ex:
                  $myRestProvider.onSend=function(req, options, model,callback){
                      options.authorization=http.encodeSessionToken(req.cookies.authToken);
                      callback.call(this,null,options);
                  };

                  pass the options object back as the data param in the callback
             */
            var req=this.req || {};
            var funcArray=[];
            var onAuth=factory.partial(this._onAuthentication,options,model).bind(this);
            funcArray.push(onAuth);
            if(typeof this.onSend==='function'){
                var onSendCallback=this.onSend;
                var onSend=factory.partial(this._onSend,onSendCallback,req,model).bind(this);
                funcArray.push(onSend);
            }
            async.waterfall(funcArray,function(err,result){
                (err) ? callback(err,null) : http.send(result,callback);
            });

        },

        /**
         * set authorization/authentication on the request; implement by extending the $rest provider and class
         * and overwriting the method, returning options in the callback
         * @param options {Object}
         * @param model {String}
         * @param callback {Function}
         * @private
         */
        _onAuthentication:function(options,model,callback){
            if(callback){
                callback.call(this,null,options);
            }
        },


        /**
         * calls an onSend provided callback, if defined
         * @param fn {Function}
         * @param req {Object}
         * @param model {String}
         * @param options {Object}
         * @param callback {Function}
         * @private
         */
        _onSend: function (fn,req,model,options,callback) {
            fn.call(this,req, options, model, callback);
        },

        /**
         * constructs the request options object
         * @param method {String}
         * @param model {String}
         * @param data {Object}
         * @returns {Object}
         * @private
         */
        _getOptions:function(model,method,data){
            var options = {};
            options.host = this.host;
            options.port = this.port;
            options.method = method;
            options.path = this.path;
            options.path = options.path + '/' + model;
            options.protocol=this.protocol;
            if(data && data !==undefined){
                options.data=data;
            }
            return options;
        }


    });



    return $rest;

}));





/*
 * =============================================================
 * elliptical.providers.session.$cookie v0.9.0.1
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


/*
 * =============================================================
 * elliptical.providers.session.$local v0.9.0.1
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
        module.exports = factory(require('elliptical-mvc'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-mvc'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.providers=root.elliptical.providers || {};
        root.elliptical.providers.session=root.elliptical.providers.session || {};
        root.elliptical.providers.session.$local = factory(root.elliptical);
        root.returnExports = root.elliptical.providers.session.$local;
    }
}(this, function (elliptical) {

    var $local=elliptical.Provider.extend({
        key:'sessionStore',

        /**
         * @param params {Object}
         * @param callback {Function}
         * @returns {Object}
         */
        get:function(params,callback){
            var key=(params===undefined || params.key===undefined) ? this.key : params.key;
            var session=localStorage.getItem(key);
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
            localStorage.setItem(key,session);
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
            var key=(params===undefined || params.key===undefined) ? this.key : params.key;
            localStorage.removeItem(key);
            if(callback){
                callback(null,null);
            }
        },

        $setKey:function(key){
            this.key=key;
        }


    },{});



    return $local;

}));




/*
 * =============================================================
 * elliptical.providers.session.$storage v0.9.0.1
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



/*
 * =============================================================
 * elliptical.providers.$template v0.9.0.1
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
        module.exports = factory(require('elliptical-mvc'),require('elliptical-utils'),require('elliptical-dustjs'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-mvc','elliptical-utils','elliptical-dustjs'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.providers=root.elliptical.providers || {};
        root.elliptical.providers.$template = factory(root.elliptical,dust);
        root.returnExports = root.elliptical.providers.$template;
    }
}(this, function (elliptical,utils,dust) {

    var _=utils._;
    dust.optimizers.format = function (ctx, node) {
        return node;
    };

    var $template=elliptical.Provider.extend({
        _data: {},

        $store: null,

        base: {
            server: 'base',
            client: 'base-client'
        },

        $provider: dust,

        compile: dust.compile,

        cache: dust.cache,

        model: 'template',

        api: '/api/template',

        namespace:null,


        /**
         *
         * @returns {String}
         * @public
         */
        getBase: function () {
            return (utils.isBrowser()) ? this.base.client : this.base.server;

        },

        /**
         *
         * @param opts {Object}
         */
        $setOpts: function(opts){
            if(opts){
                if(typeof opts.model !== 'undefined'){
                    this.model=opts.model;
                }
                if(typeof opts.api !== 'undefined'){
                    this.api=opts.api;
                }
                if(typeof opts.base !== 'undefined'){
                    this.base=opts.base;
                }
            }
        },

        $setProvider:function($provider){
            this.$provider=$provider;

        },

        /**
         *
         * @param template {String}
         * @param context {Object}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        render: function (template, context, callback) {
            var $provider=this.$provider;
            var cache=$provider.cache;

            if (_.isEmpty(cache)){
                _loadTemplateCacheFromStore(this.model,this.$store,this.$provider,this.api,function(){
                    $provider.render(template,context,function(err,out){
                        if(callback){
                            callback(err,out);
                        }
                    });
                });
            }else{
                $provider.render(template,context,function(err,out){
                    if(callback){
                        callback(err,out);
                    }
                });
            }
        },

        /**
         * set the provider as a global to the window object
         * on the browser side, if compiled templates are referenced in script tag, you'll need to set
         * a reference to dust on the window object
         */
        setBrowserGlobal:function(){
            if(typeof window != 'undefined'){
                window.dust=this.$provider;
            }
        }

    },{
        /**
         * new instance init
         * @param base {boolean}
         */
        init: function (base) {
            if (base) {
                this.constructor._data.base = true;
            }
        },

        /**
         * renders with a context base
         * use render method on template provider's prototype to mixin a base context
         *
         * @param template {String}
         * @param context {Object}
         * @param callback {Function}
         * @returns callback
         * @public
         */
        render: function (template, context, callback) {

            if (this.constructor._data.base) {
                var baseRender = {
                    render: this.constructor.getBase()
                };
                var base = this.constructor.$provider.makeBase(baseRender);
                context=base.push(context);
            }

            this.constructor.render(template,context,function(err,out){
                if(callback){
                    callback(err,out);
                }
            });
        }
    });

    /**
     * if template cache is empty, load it from the store or client-side, load it from scripts
     * @param model {String}
     * @param $store {Object}
     * @param $provider {Object}
     * @param api {String}
     * @param callback {Function}
     * @private
     */
    function _loadTemplateCacheFromStore(model, $store, $provider, api, callback) {
        if(!utils.isBrowser()){
            $store.getAll(model,function(err,data){
                for(var i= 0, max=data.length;i<max;i++){
                    var obj=JSON.parse(data[i]);
                    dust.loadSource(obj);
                }
                callback();
            });


        }else{

            //continue to query at intervals for cache to load from script
            var iterations=0;
            var process=new elliptical.Interval({
                delay:10
            });
            process.run(function(){
                checkCache($provider,process,iterations,callback);
            })
        }
    }

    function checkCache($provider,process,iterations,callback){
        var cache=$provider.cache;
        if(!utils._.isEmpty(cache)){
            process.terminate();
            if(callback){
                callback();
            }
        }else{
            if(iterations > 1000){
                process.terminate();
                if(callback){
                    callback();
                }
            }else{
                iterations++;
            }
        }
    }


    return $template;

}));


/*
 * =============================================================
 * elliptical.providers.$transitions v0.9.1
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
        if(typeof window !=='undefined'){
            module.exports = factory(require('elliptical-mvc'),require('ellipsis-animation'));
        }

    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-mvc','ellipsis-animation'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.providers=root.elliptical.providers || {};
        root.elliptical.providers.$transitions=factory(root.elliptical);
        root.returnExports = root.elliptical.providers.$transitions;
    }
}(this, function (elliptical) {
    var _selector='[data-placeholder="content"]';
    if($('html').hasClass('customelements')){
        //_selector='ui-content-placeholder';
    }

    var Transitions=elliptical.Provider.extend({

        render:function(selector,html,transition,callback){
            var element=$(selector);

            if(transition !== 'none'){
                _transitionOut(function(){
                    element.html(html);
                    element.show();
                    _transitionIn(function(){

                    })
                });

            }else{
                element.html(html);
                if(callback){
                    callback.call(this);
                }
            }



            function _transitionOut(callback){
                var opts = {};
                opts.duration=300;
                opts.preset='fadeOut';

                element.transition(opts, function () {
                    callback.call(element[ 0 ]);

                });
            }

            function _transitionIn(callback){
                var opts = {};
                opts.duration=300;
                opts.preset=transition;
                var element_=$(_selector);
                element_.transition(opts, function () {
                    callback.call(element_[ 0 ]);

                });
            }
        }


    },{});

    return Transitions;
}));


/*
 * =============================================================
 * elliptical.providers.$validation v0.9.1
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
        module.exports = factory(require('elliptical-mvc'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-mvc'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.providers=root.elliptical.providers || {};
        root.elliptical.providers$validation=factory(root.elliptical);
        root.returnExports = root.elliptical.providers.$validation;
    }
}(this, function (elliptical) {

    var $validation=elliptical.Provider.extend({

        schemas:[],

        submitLabel:'submitLabel',

        successMessage:'Successfully Submitted...',

        post: function (form,name,callback) {
            var err = null;
            var schema = this.getSchema(name);
            for (var key in schema) {
                if (schema.hasOwnProperty(key)) {
                    if (schema[key].required && (typeof form[key] === 'undefined' || form[key] === '')) {
                        form[key + '_placeholder'] = 'Required...';
                        form[key + '_error'] = 'error';
                        if(!err){
                            err=this.error();
                        }
                    }else if(schema[key].confirm){
                        if(form[key] && form['confirm' + key]){
                            if(form[key] != form['confirm' + key]){
                                form[key + '_placeholder'] = 'Does Not Match...';
                                form[key + '_error'] = 'error';
                                form['confirm' + key + '_placeholder'] = 'Does Not Match...';
                                form['confirm' + key + '_error'] = 'error';
                                if(!err){
                                    err=this.error();
                                }
                            }
                        }
                    }else if(schema[key].validate && typeof schema[key].validate==='function' && form[key]){
                        var msg=schema[key].validate(form);
                        if(msg){
                            form[key + '_placeholder'] = msg;
                            form[key + '_error'] = 'error';
                            form[key]='';
                            if(!err){
                                err=this.error();
                            }
                        }
                    }
                }
            }
            if(err){
                form=this.addSubmitLabel(form,false);
                callback(err,form);
            }else{
                form=this.deleteProperties(form);
                callback(null,form);
            }


        },

        onError:function(form,msg){
            form=this.addSubmitLabel(form,msg,false);
            return form;
        },

        onSuccess:function(form){
            form=this.addEmptySubmitLabel(form);
            return form;
        },

        getSchema: function (name) {
            var schema = null;
            for (var i = 0; i < this.schemas.length; i++) {
                if (this.schemas[i].name.toLowerCase() === name.toLowerCase()) {
                    schema = this.schemas[i].schema;
                    break;
                }
            }
            return schema;
        },

        error:function(msg){
            if(typeof msg==='undefined'){
                msg='Form Submission Error';
            }
            var err={};
            err.message=msg;
            err.css='error';
            err.cssDisplay='visible';
            return err;
        },

        addSubmitLabel:function(form,msg,valid){
            if(typeof valid==='undefined'){
                valid=msg;
                msg=undefined;
            }
            var obj;
            if(valid){
                obj=this.success();
            }else{
                obj=this.error(msg);
            }
            form[this.submitLabel]=obj;
            return form;
        },

        addEmptySubmitLabel:function(form){
            form[this.submitLabel]=this.emptyLabelObject();
            return form;
        },

        success:function(){
            var msg={};
            msg.message=this.successMessage;
            msg.css='success';
            msg.cssDisplay='visible';
            return msg;
        },

        emptyLabelObject:function(){
            var msg={};
            msg.message='&nbsp;';
            msg.css='';
            msg.cssDisplay='';
            return msg;
        },

        deleteProperties:function(form){
            for (var key in form) {
                if (form.hasOwnProperty(key)) {
                    if(form['confirm' + key]){
                        delete form['confirm' + key];
                    }
                    if(form['confirm' + key + '_placeholder']){
                        delete form['confirm' + key + '_placeholder'];
                    }
                    if(form['confirm' + key + '_error']){
                        delete form['confirm' + key + '_error'];
                    }
                    if(form[key + '_placeholder']){
                        delete form[key + '_placeholder'];
                    }
                    if(form[key + '_error']){
                        delete form[key + '_error'];
                    }
                }
            }

            return form;
        }

    },{});

    return $validation;
}));

