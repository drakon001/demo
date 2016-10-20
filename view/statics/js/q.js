/*
 Owned By Andrey Petrunkov
 */
/*
 Use sample:
 js:

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
 })


 html:
 <div class="container-fluid tab-content">
 <div id="roles"         class="tab-pane fade "            ><div role="View.Tab3.roles"              ></div></div>
 </div>

 */

$(window).on('shown.bs.tab', function (e) {
    var target = $(e.target).attr("href");
    $(target).find('[id]:visible').each(function () {  $(this).trigger('show', e ); });
});
$(window).on('hidde.bs.tab', function (e) {
    var target = $(e.target).attr("href");
    $(target).find('[id]').each(function () {  $(this).trigger('hide', e ); });
});



var $Q = function () {
    return $Q.create.apply(this.arguments);
};
//Extend Beckbone
(function (defined) {
    $Q.prototype = {
        path: function (obj, path, value) {
            if (!obj || !path)
                return;
            var cursor = obj,
                list = path.split('.'),
                i = 0,
                len = list.length - 1, d;
            for (; i <= len; i++) {
                d = list[i];
                if (cursor[d] === void 0) {
                    if (value === void 0)  return void 0;
                    else if (i == len)     cursor[d] = value;
                    else                   cursor[d] = {};
                }
                cursor = cursor[d];
            }
            return cursor;
        },
        getDefined: function (name) {
            return this.path(defined, name)
        },
        setDefined: function (name, value) {
            return this.path(defined, name, value)
        },
        chain: Object.create || function (object) {
            var chain = function () {};
            chain.prototype = object;
            var result = new chain();
            chain.prototype = null;
            return result;
        },
        construct: function (role, args) {
            function classObject() {
                return role.apply(this, args);
            }

            classObject.prototype = role.prototype;
            return new classObject();
        },
        define: function (name, obj) {
            if (typeof(name) === 'object') {
                obj = name;
                name = obj.role;
            }
            else
                obj.role = name;
            //constructor exist, just set it
            if (typeof(obj) == 'function')
                return this.setDefined(name, obj);

            if (obj && obj.extend) {

                var parent = typeof(obj.extend) == 'string' ? this.role(obj.extend) : obj.extend,
                    cl;
                
                if (typeof(parent.extend) != 'function' )
                    parent.extend = Backbone.Model.extend;

                cl = this.setDefined(name, parent.extend(obj));


                    
                    
                //mark method
                for (var a in cl.prototype)
                    if (typeof(cl.prototype[a]) == 'function' && cl.prototype.hasOwnProperty(a)) {
                        cl.prototype[a].owner = cl.prototype;
                        cl.prototype[a].method = a;
                    }

                return cl;
            }
            throw new Error("Неправильный формат данных при определении класса!");
        },
        create: function (name) {
            if (typeof(name) == "string")
                return this.construct(this.role(name), ([]).slice.apply(arguments, [1]));
            return this.construct(this.role(name.role || name.role), arguments);
        },
        role: function (name) {
            var role = this.getDefined(name) || this.path(window, name);
            if (!role)
                throw new Error('role not found:' + name);
            return role
        },
        bind: function (dom, attribute, option) {
            var data = dom.attr(attribute), conf;
            //try {
            if ($(dom).attr('view'))
                return $(dom).attr('view');
            if (attribute == 'role') {

                if (this.getDefined(data)) {

                    return this.create(data, _.extend(option || {}, { el: dom }));
                }
                conf = data.match(/^([^\{|^:]+):(.+)/);
                if (conf) {
                    option = _.extend(option || {}, JSON.parse(conf[2]) || {}, { el: dom });
                    return this.create(conf[1], option);
                }
                try {
                    conf = JSON.parse(data);
                } catch (e) {};
                if (conf) {
                    return this.create(_.extend(option || {}, conf, { el: dom }));
                }
                //throw new Error('Wrong item format:'+data);
            }
            if (attribute == 'tpl') {
                var tpl = _.template(data)(option);
                return $(dom).append(tpl);
            }
            //} catch (e){
            //   return e;
            //}
        },
        bindrole:function(root){
            "use strict";
            var view = this;
            view.registred = view.registred || [];
            root.find('*').filter(function(){ return $(this).parent()[0] === root[0]; }).each(function (){
                var el = $(this);
                if (el.attr('role') && !el.attr('view') )
                    view.registred.push($Q.bind(el,'role',{ parentBlock:view }));
                view.bindrole(el);
            });
        },
        clearObj: function (obj) {
            for (var a in obj)
                if (obj.hasOwnProperty(a))
                    delete  obj[a];
        },
        clone: function (obj) {
            return this.parse(this.stringify(obj));
        },
        extend: function (dst, src) {
            return _.extend(dst, src);
        },
        parse:function(text,reviver,root){
            "use strict";
            var base = JSON.parse(text, reviver),
                self = this,
                reg;
            function findPath(obj) {
                for (var a in obj) {
                    if (typeof(obj[a]) == 'string' && (obj[a]).match(reg) )
                        obj[a] =  self.path(base,obj[a].replace(root+'.',''));
                    if (typeof(obj[a]) == 'object')
                        findPath(obj[a]);
                }
            }
            if (root){
                reg = new RegExp('^'+root);
                findPath(base);
            }
            return  base;
        },
        stringify: function (value, spacer, root) {
            var obj = {};
            root = root || '$';
            function findPath(key, value) {
                for (var a in obj) {
                    if (obj[a] === value)
                        return a;
                    if (obj[a][key] === value)
                        return [a, key];
                }
            }

            function replacer(key, value) {
                if (typeof(value) == 'object') {
                    if (value instanceof Date)
                        return value;
                    if (key === "" && !obj[root])
                        return ( obj[root] = value);
                    var path = findPath(key, value);
                    if (typeof(path) == 'string')
                        return path;
                    if (path instanceof Array)
                        obj[path[0] + '.' + key] = value;
                }
                return value;
            }
            function unCircle(obj) {
                var result;
                if (typeof(obj) == 'object'){
                    if ( obj instanceof  Date )
                        return new Date(obj);
                    result = ( obj instanceof  Array?[]:{});
                    for (var a in obj){
                        result[a] = replacer(obj,a);
                        if (typeof(result[a]) == 'object')
                            unCircle(result[a]);
                    }
                }
                else
                    result = obj;
                return result;
            }
            try {
                return JSON.stringify(value, replacer, spacer);
            } catch(e){
                return JSON.stringify(unCircle(value), replacer, spacer);
            }
        }
    };
    _.extend($Q, $Q.prototype);
})({});

$Q.define('View', {
    extend: 'Backbone.View',
    viewTpl: '',
    registred: [],
    prefix: 'View_',
    parentrole: function (role) {     return  role ? role.constructor.__super__ : this.constructor.__super__;   },
    callParent: function (arg) {
        arg = arg || [];
        var caller,name,owner,parent;
        function getCallerName(error){
            "use strict";
            var list = error.split("\n"),
                i=0,
                l = list.length;
            for (;i< l;i++){
                if (list[i].match(/callParent/))
                    return list[i+1].match(/(\w+) \(/g)[0].match(/\w+/)[0];
            }
        }
        try {
            caller = arguments.callee.caller;
            name = caller.method;
        }
        catch (e) {
            callerName = getCallerName(e.stack);
            caller = this[callerName];
            name = caller.method;
        }
        owner = caller.owner;
        parent = this.parentrole(owner);
        while (parent) {
            if (typeof(parent[name]) == 'function')
                return parent[name].apply(this, arg);
            parent = this.parentrole(parent);
        }
    },
    getParentBlock: function () {      return this.parentBlock;   },
    reference: function (name, node) {
         
        //init block
        if (typeof(this.ref) == "string" && !name ) { //This is src ref => link to dst
            name = this.ref;
            node = node || this;
        }

        if (!_.isObject(this.ref))        //This is undefined ref =>  parent ref  if parent exist
            this.ref = (this.parentBlock && this.parentBlock.reference ? this.parentBlock.reference() : { id:this.id });

        if (!this.ref.id )
            this.ref = { id:this.id };

        if (!name)
            return this.ref;

        if (node)
            $Q.path(this.ref,name,node);

        return $Q.path(this.ref,name);

    },
    getHtmlAttributes:function( $node ) {
        if(  !$node ||  !$node[0] || !$node[0].attributes)
            return null;
        if ($node.length > 1) {
            result = [];
            for (var i =0;i < $node.length;i++)
                result.push(this.getAttributes($($node[i])));
            return result;
        }

        var attrs  = {};
        $.each($node[0].attributes, function(att, attribute) {
            if(!attribute.specified)
                return;
            var value = attribute.value;
            if (typeof(value) == 'string'){
                if (value.match(/^\{.*\}$/) )
                    value = eval('('+value+')');
            }
            attrs [attribute.name] = value;
        });
        var children = $node.find('*').filter(function(){ return $(this).parent()[0] === $node[0]; });
        for (var i =0;i < children.length;i++){
            var tagName = (children[i].prop?children[i].prop("tagName"):children[i].tagName).toLowerCase();
            //if (!('opt' in children[i]) || !('opt' in children[i].attributes) || ({ span:true, a:true, ul:true, h:true , h1:true, h4:true })[tagName] ){
            if (!('opt' in children[i].attributes)){
                if (!attrs.children)
                    attrs.children = [];
                attrs.children.push($(children[i])[0].outerHTML);
            }
            else if (tagName == 'div'){
                if (!attrs.children)
                    attrs.children = [];
                attrs.children.push(this.getHtmlAttributes($(children[i])));
            }
            else{

                if (!attrs[tagName])
                    attrs[tagName] = this.getHtmlAttributes($(children[i]));
                else if (attrs[tagName] instanceof  Array )
                    attrs[tagName].push(this.getHtmlAttributes($(children[i])));
                else
                    (attrs[tagName] = [attrs[tagName]]).push(this.getHtmlAttributes($(children[i])));
            }
        }
        return attrs;
    },
    initialize: function (options) {
        options && options.el && this.setElement(options.el);

        _.extend(options,this.getHtmlAttributes(this.$el) || {});
        if ( typeof(options.conf) == 'string' ){
            _.extend(options,$Q.path(options.parentBlock,options.conf));
        }
        if (options.test || this.test || this.el.test) {
            debugger;
        }
        this['.configure']      = options;

        _.extend(this, options);

        this.$el.attr("id", (this.id = _.uniqueId(this.prefix)));

        this.setController();

        this.initItems && this.initItems();

        this.reference();

        this.render();
    },
    setController: function (contoller, view) {
        var vw    = view || this,
            ctrl  = contoller || $Q.path(vw, 'controller') || {};

        if ( typeof (ctrl) == 'string' )
             ctrl = $Q.create('controller.'+ctrl);


        vw.controller  = $Q.chain($Q.path(vw, 'parentBlock.controller') || new function begin() {});
        ctrl.getView   = function () {   return vw;     };
        ctrl.reference = function () { return vw.reference.apply(vw, arguments);     };

        for (var a in ctrl)
            if (typeof(ctrl[a]) == 'function' ) // && ctrl.hasOwnProperty(a))
                vw.controller[a] = ctrl[a].bind(vw.controller);
    },
    getAuthKey: function (key) {
        var data = (window['loginData'] && window['loginData'].authKey) || {};
        if (key in data)
            return data[key];
        return data;
    },
    createChild: function () {
        var vw = this,
            childs = [],
            bindView = function (name) {
                return function () {
                    var child = $Q.bind($(this), name, { parentBlock: vw });
                    childs.push(child);
                };
            };

        vw.$('[tpl]').each(bindView('tpl'));
        vw.$('[role]').each(bindView('role'));
        return childs;
    },
    render: function () {
        var vw = this,
            $el = vw.$el;
        //Set ID


        //Hide
        if (vw.auth) {
            //$el.attr( "auth", vw.auth); //??  TODO future think about
            $el[vw.getAuthKey(vw.auth) ? 'removeClass' : 'addClass']('hidden');
        }

        $el.html(_.template(typeof (vw.viewTpl) == 'function'?vw.viewTpl(vw):vw.viewTpl )(vw));
        vw.className && $el.addClass(vw.className);
        $el.attr("view", this);


        vw.children = vw.createChild();

    },
    bind: function (obj, ctrl) {
        for (var event in ctrl)
            if (obj.on)
                obj.on(event, $Q.path(this, ctrl[event]), this);
            else
                throw new Error('Wrong bind object:' + this.stringify(obj));
    }
});
$Q.define('View.block', {
    extend: 'View',
    tagName: 'div',
    blockTpl: '<% if (typeof(el) == "string" ) { %>' +
                '<%=el%>' +
            '<% } else { %>' +
                '<<%=el.tagname|| el.tagName || "div"%>' +
                '  role="<%=el.role|| el.role || el%>"     ' +
                '  conf="<%=blockName%>.<%=num%>"  >' +
                '</<%=el.tagname|| el.tagName ||"div"%>>' +
            '<%  } %>',
    viewTpl: function(option){
        var blockName = (this.blockName  = (option && (option.blockname || option.blockName ) ) ||  this.blockname || this.blockName || 'children');

        $Q.path(this,blockName,$Q.path(this,blockName)|| []);
        if (blockName == 'parentBlock.columns'){
            return '<%_.each('+blockName+', function(el,num) { %>' + (this.blocktpl || this.blockTpl )+ '<% }); %>';
        }
        return '<% _.each('+blockName+', function(el,num) { %>' + (this.blocktpl || this.blockTpl )+ '<% }); %>';
    },
    defaults: {},
    initItems: function (options) {
        this.setDefaults();
    },
    setDefaults: function (obj, def) {
        obj = obj || $Q.path(this,this.blockName || this.blockname)                || this.children;
        def = def || $Q.path(this,(this.blockName || this.blockname)+ 'Defaults' ) || this.defaults;
        if (!obj)
            return;

        if (_.isArray(obj) && _.isObject(def)) {
            _.each(obj, function (el) {
                _.isElement(el) || _.defaults(el, def);
            });
            return;
        }

        if (_.isObject(obj) && _.isObject(def))
            return _.defaults(obj, def);

    },
    /*
     create Child with additional conf options
     */
    createChild: function () {
        var vw = this,
            childs = [],
            bindView = function (name) {
                return function () {
                    child = $Q.bind($(this), name,{  parentBlock: vw });
                    childs.push(child);
                };
            };

        vw.$('[tpl]').each(bindView('tpl'));
        vw.$('[role]').each(bindView('role'));
        return childs;
    }
});
$Q.define('block', { extend: 'View.block' });

$Q.define('View.cellModel', {
    extend: 'View.block',
    tagName: 'td',
    viewTpl: '<%=value%>',
    value:'-',
    getModel: function () {
        return this.model;
    },
    getValue: function () {
        return this.value;
    },
    initItems: function () {
        if (!this.getParentBlock().getModel)
            return;
        this.value = (this.model = this.getParentBlock().getModel()).get(this.name);
        this.bind(this.model, {
            'change': 'render',
            'destroy': 'remove'
        });
    }
});
$Q.define('View.rowModel', {
    extend: 'View.block',
    tagName: 'tr',
    blockName:'cells',
    blockTpl: '<td  role="<%= el.role || el.role %>"  conf="<%=blockName%>.<%=num%>" ></td>',
    getModel: function () {
        return this.model;
    },
    initItems: function () {
        var tBody  =  this.getParentBlock(),
            table  =  tBody.getParentBlock();
        this.model = table.collection.get(this.$el.attr("data-model"));
        this.cells = table.columns;
        this.bind(this.model, {
            'change': 'render',
            'destroy': 'remove'
        });
    }
});

$Q.define('View.collection', {
    extend: 'View.block',
    className: 'table-responsive',
    refresh: function () {
        this.collection.fetch();
    },
    linkSrc: function (src) {
        if (!src)
            return;
        var model = 'models.' + _.uniqueId('auto_');
        $Q.define(model, {
            extend: 'Backbone.Model',
            urlRoot: src,
            defaults: function () {
                return {};
            }
        });
        return $Q.role(model);
    },
    linkModel: function (model) {
        if (!model)
            return;

        if (_.isString(model))
            model = $Q.role(model);

        var store = 'store.' + _.uniqueId('auto_');
        $Q.define(store, {
            extend: 'Backbone.Collection',
            model: model,
            url: (new model).urlRoot,
            defaultErrorHandler: function (model, error) {
                if (error.status == 401 || error.status == 403) {
                    window.location.href = window.location.href+'';
                }
            },
            initialize: function () {
                this.bind("error", this.defaultErrorHandler);

                //if (this.autoLoad == 'visible')


            }
        });
        return store;
    },
    initItems: function (conf) {

        if (this.src)
            this.model = this.model || this.linkSrc(this.src);

        if (this.model)
            this.collection = this.collection || this.linkModel(this.model);

        if (typeof(this.collection) == "string")
            this.collection = $Q.create(this.collection);

        this.bind(this.collection, {
            'add': 'render',
            'remove': 'render'
        });

        this.callParent(arguments);
        var vw=this;

        if (this.autoLoad === true)
            this.collection.fetch();

        this.$el.on('show', function(e){
            "use strict";
            if (e.target != this )
               return;
            vw.collection.fetch();
        });
        if (this.$el.is(':visible'))
            vw.collection.fetch();
    }
});

$Q.define('View.table', {
    extend: 'View.collection',
    className: 'table-responsive',
    headrsTpl:'<%= el.title   %>',
    rowTpl:"<%= el.id %>",
    viewTpl: '<table class="table table-striped  table-hover">' +
         '<thead><tr role="block"  blockTpl="<th><%= headrsTpl %></th>"                                     blockName="parentBlock.columns"  </tr></thead>' +
         '<tbody     role="block"  blockTpl="<tr role=\'View.rowModel\' data-model=<%= rowTpl %> ></tr>"    blockName="parentBlock.collection.models"  ></tbody>' +
    '</table>',
    defaults: {
        role: 'View.cellModel'
    },
    columns: [],
    selectedRowClass: 'selected',
    selectRow: function (model, flag) {
        var me = this;
        if (!model)
            return;
        this.$('tr[data-model=' + model.id + ']').each(function () {
            $(this)[flag ? 'addClass' : 'removeClass'](me.selectedRowClass);
        });
    },
    select: function (event) {
        this.selectRow(this.selected, false);
        this.selectRow((this.selected = this.collection.get($(event.currentTarget).attr('data-model'))), true);
        console.log('select', this.selected);
    },
    events: {
        "click tr": "select"
    },
    initItems: function (conf) {
        if (typeof(this.columns) == 'string')
            this.columns = $Q.clone($Q.path(this,this.columns)) || [];
        this.setDefaults(this.columns);
        this.callParent(arguments);
    }
});
$Q.define('View.button', {
    extend: 'View.block',
    tagName: 'button',
    className: 'btn btn-default',
    viewTplShort: '<%=text%>',
    viewTplFull: '<button type="button" class="btn btn-default" handler="<%=handler%>" ><%=text%></button>',
    text: '',
    events: {
        "click": "onClick"
    },
    initialize: function (options) {
        var el = this.$el.get(0);
        this.viewTpl =  this.viewTplFull;
        if (el.tagName == "BUTTON"){
            this.viewTpl = this.viewTplShort;
        }
        this.callParent(arguments);
    },
    initItems:function(options){
        "use strict";
        var children = (options && options.children) || this.children;
        this.text    =  this.$el.get(0).innerHTML ||(children && children.join('') )||this.text;
    },
    onClick: function (event) {
        console.log('button click', this.handler, this.controller);
        if (typeof(this.handler) == "function")
            return  this.handler(event);

        if (typeof(this.handler) == "string") {
            var fn = $Q.path(this.controller, this.handler);
            if (typeof(fn) == "function")
                return  fn(event, this);
        }
    }
});

$Q.define('window', {
    extend: 'View.block',
    tagName: 'div',
    controller: {},
    viewTpl: '<div class="modal fade in" role="dialog" style="display: block;">' +
        '<div class="modal-dialog">' +
            '<div class="modal-content"  >' +
                '<div class="modal-header"  role="block"  blockName="parentBlock.header"  ></div>' +
                '<div class="modal-body"    role="block"  blockName="parentBlock.items"   ></div>' +
                '<div class="modal-footer"  role="block"  blockName="parentBlock.footer"  ></div>' +
            '</div>' +
        '</div>' +
    '</div>',
    title: '',
    header: [
        { role: 'View.button', tagName: "button", className: "close", handler: "close", text: '×' },
        { role: 'View.block', tagName: "h4", className: "modal-title", viewTpl: '<%=parentBlock.parentBlock.title%>' }
    ],
    items: [],
    footer:[
        { role: 'View.button', tagName: "button", className: "btn btn-default", handler: "save", text: 'Save'  },
        { role: 'View.button', tagName: "button", className: "btn btn-default", handler: "close", text: 'Close' }
    ],
    destroy: function (missDestroy) {
        var me = this,
            destroy = function (el) {
                if (el.destroy && me !== el)
                    return el.destroy();
                el.$el && el.remove();
                $Q.clearObj(el.controller);
                $Q.clearObj(el);
            };
        this.header.forEach(destroy);
        this.items.forEach(destroy);
        this.footer.forEach(destroy);
        destroy(this);
    },
    show: function () {
        if (!this.el.parentNode)
            return $('body').append(this.$el);
        this.$('.fade').show().addClass('in');
    },
    hide: function () {
        this.$('.fade').removeClass('in').hide();
    },
    initialize: function (conf) {

        var controller = {
            show: function () { this.getView().show();   },
            hide: function () { this.getView().hide();   },
            close:function () { this.getView().destroy() }
        };
        conf.controller = this.controller = _.extend(controller, conf.controller);
        console.log('win init', this.controller);
        this.callParent(arguments);
    },
    initItems:function(){
        "use strict";
        if (!(this.items instanceof  Array))
            this.items = [this.items];

        this.header = $Q.clone(this.header);
        this.items  = $Q.clone(this.items);
        this.footer = $Q.clone(this.footer);

    }
});
$Q.define('form', {
    extend: 'View.block',
    tagName: 'form',
    getValues: function () {
        var values = {};
        this.$('input[name]').each(function () {
            values[$(this).attr('name')] = $(this).val();
        });
        return values;
    },
    setValues: function (values) {
        this.$('input[name]').each(function () {
            $(this).val(values[$(this).attr('name')]);
        });
    },
    setModel: function (Model) {
        this.record = Model;
        this.setValues(Model && Model.attributes || {});
    },
    getModel: function () {
        return this.record;
    },
    updateModel: function () {
        console.log('update', this.getModel());
        this.getModel().set(this.getValues());
        this.getModel().save();
    },
    initialize: function (conf) {
        this.callParent(arguments);
        if (this.record)
            this.setModel(this.record);
    }
});
$Q.define('form.field.text', {
    extend: 'View',
    tagName: 'div',
    className: ' row form-group form-horizontal ',
    placeholder: '',
    label: '',
    name: 'name',
    type: 'text',
    title: '',
    viewTpl: '<label class="control-label col-sm-2" ><%=label || title %></label><div class="col-sm-10"><input type="<%=type%>" class="form-control" name=<%=name%>  placeholder="<%=placeholder%>"></div>'
});
$Q.define('form.field.combo', {
    extend: 'View.collection',
    tagName: 'div',
    className: 'row form-group form-horizontal',
    placeholder: '',
    label: '',
    name: 'name',
    displayField:'name',
    valueField:'name',
    title: '',
    blockName:'collection.models',
    autoLoad:true,
    events: {
           "change select": "select"
    },
    select:function(e){
        this.value =   this.collection.get($(e.target).val());
    },
    getSelection:function(){
       return this.value instanceof Array?this.value:[this.value];
    },
    inputTpl:'<%= getSelection().join(",") %>',
    getDisplayValue:function(){
        var vw=this;
        return _.template(typeof (vw.inputTpl) == 'function'?vw.inputTpl(vw):vw.inputTpl )(vw);
    },
    value:null,
    blockTpl: '<option value="<%= el.id %>"  ><%= el.get( displayField ) %></option>',
    viewTpl:function(){
        return '<label class="control-label col-sm-2" ><%= title %></label>'+
            '<div class="col-sm-10" >'+
                '<select   test="true"  name="<%= name %>" class="form-control ">'+
                this.callParent(arguments)+
                '<option  style="display: none" selected data-model="<%= value %>"  ><%= getDisplayValue() %></option>'+
                '</select>' +
            '</div>';
    }
});

$Q.define('Grid', {
    extend: 'View',
    controller: 'CRUD',
    ref: {},
   // src:'*',
    viewTpl:'<h3><%=title %></h3>'+
        '<div opt role="block"  blockName="parentBlock.tbar"    defaults="<%=$Q.stringify(parentBlock.tbarDefaults)%>"   ></div>'+
        '<div opt role="View.table" src="<%=src%>"  ref="table"  columns="parentBlock.columns"></div>',
    detail: {
        role: 'window',
        ref: {},
        items: [
            {
                role: 'form',
                tagName: "form",
                ref: 'form',
                defaults: {        role: 'form.field.text', type: 'text'       },
                children: []
            }
        ]
    },
    tbarDefaults:{role:'View.button',tagName:'button',className:'btn btn-default'},
    tbar: [
        { handler: "read",   text: '<span class="glyphicon glyphicon-refresh"></span>'},
        { handler: "create", text: '<span class="glyphicon glyphicon-plus"></span>' },
        { handler: "update", text: '<span class="glyphicon glyphicon-pencil"></span>' },
        { handler: "delete", text: '<span class="glyphicon glyphicon-remove-sign"></span>' }
    ]
});