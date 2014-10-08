/*
 * =============================================================
 * elliptical.providers.$validation
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
        root.elliptical.providers.$validation=factory(root.elliptical);
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

