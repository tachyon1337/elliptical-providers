
/*
 * =============================================================
 * elliptical.providers.$rest
 * =============================================================
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




