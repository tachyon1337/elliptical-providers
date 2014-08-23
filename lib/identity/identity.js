
/*
 * =============================================================
 * elliptical.providers.$identity
 * =============================================================
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

