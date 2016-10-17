$Q.define('View.Tab3.directories.stores', {
    extend: 'Grid',
    title: '<h3>Справочник магазинов</h3>',
    columns: [
        {   name: 'name', title: 'Название магазина'     },
        // {   name:'secondName',  title:'Адрес'                 },
        {   name: 'managername', title: 'Управляющий'           }
    ],
    src: "/src/stores"
});
