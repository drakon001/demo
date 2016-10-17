$Q.define("View.Tab3.employee",{
    extend:'Grid',
    title:   '<h3>Сотрудники</h3>',
    columns:[
        {   name:'last_name',    title:'Фамилия'     },
        {   name:'name',         title:'Имя'         },
        {   name:'middle_name',  title:'Отчество'    }
        //   {   name:'age',          title:'Age'           },
        //    {   name:'addres',       title:'Address'        }
    ],
    src:"/src/employee"
});
