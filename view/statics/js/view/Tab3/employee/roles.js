$Q.define("View.Tab3.employee.roles",{
    extend:'Grid',
    title:'<h3>Роли сотрудников    </h3>',
    columns:[
        {   name:'employee',    title:'Сотрудник'     },
        {   name:'role',        title:'Роль'          },
        {   name:'values',      title:'Значение'      },
        {   name:'start',       title:'Начало действия'           },
        {   name:'ended',       title:'Заканчивает действие'      }
    ],
    src:"/src/employeeRoles"
});


