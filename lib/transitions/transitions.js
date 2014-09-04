/*
 * =============================================================
 * elliptical.providers.$transitions
 * =============================================================
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

