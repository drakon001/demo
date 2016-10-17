/**
 * Created by APetrunkov on 29.09.2016.
 */
Backbone.Model.extend()
$Q.define('controller.CRUD',{
    extend:'controller',
    read:function(){
        "use strict";
        this.reference('table').refresh();
    },
    create:function(){
        var view = this.getView();
        $Q.create(_.extend({},view.detail,{
            title:'ADD',
            container:view,
            ref:{},
            controller:{
                save:function(){
                    var win = this.getView();
                    view.reference('table.collection').add(win.reference('form').getValues());
                    win.destroy();
                },
                close:function(){ this.getView().destroy(); }
            }
        })).show();
    },
    update:function(){
        var view = this.getView(),
            win = $Q.create(_.extend({},view.detail,{
                title:'EDIT',
                container:view,
                ref:{},
                controller:{
                    save:function(){
                        var win = this.getView();
                        win.reference('form').updateModel();
                        win.destroy();
                    }
                }
            }));
        win.show();
        win.reference('form').setModel(view.reference('table.selected'));
    },
    delete:function(){
        this.getView().reference('table.selected').destroy();
    }

});
