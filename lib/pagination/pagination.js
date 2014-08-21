
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
