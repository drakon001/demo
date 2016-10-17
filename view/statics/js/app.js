/**
 * Created by drakon on 02.08.16.
 */


$(function(){
    $Q.define('main',{
        extend:'View',
        el:$('body'),

        render: function () {
               console.log('Main View render',this);
               var view = this;
               this.$('[tpl]'  ).each(function () {    $Q.bind($(this),'tpl',  { parentBlock:view });   });
               $Q.bindRole(this.$el);

               this.$('[auth]').each(function () {
                   var el  =$(this),
                       keys = window['loginData'].authKey;
                   if (keys){
                      if (keys[el.attr('auth')])
                         el.removeClass('hidden');
                   }
                   else if (!window.location.href.match(/login$/)){
                       window.location.href = '/login';
                   }
               });
               this.$('[map-data]').each(function () {
                   var el  =$(this);
                   el.html($Q.path(window,el.attr('map-data')));
               });
            this.$('a').each(function () {
                var el = $(this),
                    url = el.attr('href');
                if (url && url.match(/^#.+/))  {
                    url = '!/'+url.replace('#','');
                    el.on('click',function(){
                        App.Router.navigate(url,{trigger: false});

                    });
                }

            });
        }

    });
    var App = $Q.create('main',{ }),
        Router = Backbone.Router.extend({
            routes: {
                    "!/:id": "nav"
            },
            nav:function(id){
               "use strict";
                var el = $('a[href="#'+id+'"]');
                console.log('route event id',id, el);
                el.trigger( "click" );

            }

        });
    App.Router = new Router();
    Backbone.history.start();

}); 
