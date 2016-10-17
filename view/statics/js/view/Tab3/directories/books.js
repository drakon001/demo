$Q.define('View.Tab3.directories.books', {
    extend: 'Grid',
    title: '<h3>Справочник книг     </h3>',
    columns: [
        {   name: 'name', title: 'Название'       },
        {   name: 'autors', title: 'Автор(ы)'       },
        {   name: 'issue', title: 'Год издания'    },
        {   name: 'publisher', title: 'Издательство'   },
        {   name: 'edition', title: 'Редакция'       },
        {   name: 'circulation', title: 'Тираж'       }
    ],
    src: "/src/books"
});
