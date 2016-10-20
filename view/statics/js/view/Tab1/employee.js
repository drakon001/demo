$Q.define('View.Tab1.employee',{
    extend:'View.block',
    controller:'CRUD',
    controller_old:{
        create:function(){
            var view = this.getView();
            $Q.create(_.extend({},view.detail,{
                title:'ADD',
                container:view,
                ref:{},
                controller:{
                    save:function(){
                        var win = this.getView(),
                            form = win.ref.form;
                        view.ref.table.collection.add(form.getValues());
                        win.destroy();
                    },
                    close:function(){
                        this.getView().destroy();
                    }
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
                            var win = this.getView(),
                                form = win.ref.form;
                            form.updateModel();
                            win.destroy();
                        }//,
                       // close:function(){
                        //    this.getView().destroy();
                       // }
                    }
                }));
            win.show();
            win.ref.form.setModel(view.ref.table.selected);
            console.log('edit',view.ref.table.selected);
        },
        delete:function(){
            this.getView().ref.table.selected.destroy();
        }
    },
    ref:{},
    children:[
        {
            role:'View.block',
            children:[
                { role:'View.button', tagName:"button", className:"btn btn-default", handler:"create", text:'<span class="glyphicon glyphicon-plus"></span>' },
                { role:'View.button', tagName:"button", className:"btn btn-default", handler:"update", text:'<span class="glyphicon glyphicon-pencil"></span>' },
                { role:'View.button', tagName:"button", className:"btn btn-default", handler:"delete", text:'<span class="glyphicon glyphicon-remove-sign"></span>' }
            ]
        },
        {
            role:'View.table',
            ref:'table',
            columns:[
                {   name:'firstName',   title:'First  Name'    },
                {   name:'secondName',  title:'Second Name'    },
                {   name:'experience',  title:'Experience'     },
                {   name:'age',         title:'Age'            },
                {   name:'addres',      title:'Address'        }
            ],
            collection: 'store.employee'
        }
    ],
    detail:{
        role:'window',
        items:[
            {
                role:'form',
                tagName:"form",
                ref:'form',
                defaults:{        role: 'form.field.text'       },
                children:[
                    { name:'firstName',     label:'First&nbspName',     type:'text', placeholder:'First  Name'     },
                    { name:'secondName',    label:'Second&nbspName',    type:'text', placeholder:'Second Name'     },
                    { name:'experience',    label:'Experience',         type:'text', placeholder:'Experience'      },
                    { name:'age',           label:'Age',                type:'text', placeholder:'Age'             },
                    { name:'addres',        label:'Address',            type:'text', placeholder:'Address'         }
                ]
            }
        ]
    }
});
