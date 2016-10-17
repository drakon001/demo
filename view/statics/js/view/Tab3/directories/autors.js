$Q.define('View.Tab3.directories.autors', {
    extend: 'Grid',
    title: '<h3>Справочник авторов  </h3>',
    columns: [
        {   name: 'last_name', title: 'Фамилия'     },
        {   name: 'name', title: 'Имя'         },
        {   name: 'middle_name', title: 'Отчество'    },
        {   name: 'start', title: 'Год рождения'},
        {   name: 'ended', title: 'Год смерти'  }
    ],
    src: "/src/autors"
});

