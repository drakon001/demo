$Q.define('store.employee',{
    extend:'Backbone.Collection',
    model: $Q.role('models.employee'),
    localStorage: new Backbone.LocalStorage("employee-backbone"), 
    initialize: function() {
      var sync =function(model){          model.save();              };
       this.on("add",     sync);
       this.on("change",  sync);
       this.fetch();
    }
  });
  
