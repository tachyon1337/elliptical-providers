
/*
 * =============================================================
 * elliptical.providers.$odata
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

