/*
 * =============================================================
 * elliptical.providers.$memory
 * =============================================================
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

