$Q.define('View.Tab3.roles',{
    extend:'Grid',
    title: '<h3>Роли</h3>',
    columns:[
        {   name:'name',        title:'Название'                  },
        {   name:'role',        title:'Ключ'                      },
        {   name:'parent',      title:'Родитель'                  },
        {   name:'start',       title:'Начало действия'           },
        {   name:'ended',       title:'Заканчивает действие'      }
    ],
    src:"/src/roles"
});
