$Q.define('View.Tab3.storesData',{
    extend:'Grid',
    title: '<h3>Книги</h3>',
    tbar:[
        { handler:"read",    text:'<span class="glyphicon glyphicon-refresh"></span>'},
        { handler:"create",  text:'<span class="glyphicon glyphicon-plus"></span>',        auth:"admin" },
        { handler:"update",  text:'<span class="glyphicon glyphicon-pencil"></span>',      auth:"admin" },
        { handler:"delete",  text:'<span class="glyphicon glyphicon-remove-sign"></span>', auth:"admin" }
    ],
    columns:[
        {   name:'storename',   title:'Магазин'     },
        {   name:'bookname',    title:'Книга'       },
        {   name:'autors',      title:'Автор(ы)'    },
        {   name:'count',       title:'Количество'  }
    ],
    src:"/src/storesData"
});

