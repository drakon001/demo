/**
 * Created by drakon on 02.08.16.
 */
const pg     = require('pg'),
    swig     = require('swig'),
    url      = require('url'),
    crypto   = require('crypto'),
    DATABASE_URL = 'postgres://http:http@localhost:5432/web';


var debuggerMode = true,
    tplInited = false,
    TPL = {
        auth: swig.compile("INSERT INTO aaa.sessions( id, login, start, ended  ) " +
            "SELECT '{{ session.key }}',l.id,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + '1h'::interval  " + " FROM  aaa.login l " +
            'JOIN aaa.loginrole lr on l.id = lr.login ' +
            'JOIN aaa.roles r ON lr.roles = r.id      ' +
            ' WHERE {{ _("WHERE.isActual")("l","lr","r") }} AND l.name = \'{{ body.login }}\' ' + // AND l.pass = \'{{ body.password }}\' '),
            "LIMIT 1;" +
            "SELECT  r.role FROM  aaa.login l " +
            'JOIN aaa.loginrole lr on l.id = lr.login ' +
            'JOIN aaa.roles r ON lr.roles = r.id      ' +
            '\nWHERE {{ _("WHERE.isActual")("l","lr","r") }} AND l.name = \'{{ body.login }}\' '),// AND l.pass = \'{{ body.password }}\' '),
        authEnd: swig.compile("UPDATE aaa.sessions  SET ended=CURRENT_TIMESTAMP WHERE id = '{{ session.key }}'; "),
        authUser: swig.compile("SELECT  man.last_name ||' '||man.name||' '||man.middle_name AS username   FROM aaa.sessions s   JOIn aaa.login l ON s.login =l.id    JOIN global.man man ON  l.man = man.id WHERE s.id = '{{ session.key }}' and {{ _('WHERE.isActual')('s') }};"),

        session_READ: swig.compile("SELECT  id, login  FROM aaa.sessions a WHERE a.id = '{{ session.key }}' AND {{ _('WHERE.isActual')('a') }} LIMIT 1"),
        session_CREATE: swig.compile("INSERT INTO aaa.sessions( id, login, start, ended  ) " +
            "SELECT '{{ session.key }}',l.id,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + '1h'::interval  " + " FROM  aaa.login l " +
            'JOIN aaa.loginrole lr on l.id = lr.login ' +
            'JOIN aaa.roles r ON lr.roles = r.id      ' +
            ' WHERE {{ _("WHERE.isActual")("l","lr","r") }} AND l.name = \'{{ body.login }}\' ' + // AND l.pass = \'{{ body.password }}\' '),
            "LIMIT 1;" +
            "SELECT  r.role FROM  aaa.login l " +
            'JOIN aaa.loginrole lr on l.id = lr.login ' +
            'JOIN aaa.roles r ON lr.roles = r.id      ' +
            '\nWHERE {{ _("WHERE.isActual")("l","lr","r") }} AND l.name = \'{{ body.login }}\' '),// AND l.pass = \'{{ body.password }}\' '),
        session_DELETE: swig.compile("UPDATE aaa.sessions  SET  ended=CURRENT_TIMESTAMP  WHERE id = '{{ session.key }}'"),

        //admin auth
        roles_CREATE: swig.compile("INSERT INTO aaa.roles( name, role  )  SELECT \'{{ postBody.name }}\',\'{{ postBody.role }}\' WHERE {{ _('isAuth')('admin') }} ;" + "SELECT id, name, role, parent, start, ended,  changer, changed  FROM  aaa.roles WHERE id = LASTVAL();"),
        roles_UPDATE: swig.compile("UPDATE aaa.roles AS dst SET name = coalesce(\'{{ postBody.name }}\',src.name),  role = coalesce(\'{{ postBody.role }}\',src.role) FROM aaa.roles src  WHERE dst.id = src.id AND dst.id =  {{ restParams.roles }} AND {{ _('isAuth')('admin') }} ;" + "SELECT id, name, role, parent, start, ended,  changer, changed  FROM  aaa.roles WHERE id = {{ restParams.roles }};"),
        roles_DELETE: swig.compile("DELETE FROM aaa.roles WHERE id = {{ restParams.roles }} AND {{ _('isAuth')('admin') }};"),

        employee_CREATE: swig.compile("INSERT INTO global.man(  name, last_name, middle_name )   SELECT \'{{ postBody.name }}\',\'{{ postBody.last_name }}\',\'{{ postBody.middle_name }}\' WHERE {{ _('isAuth')('admin') }};" + "SELECT id, name, role, parent, start, ended,  changer, changed  FROM  aaa.roles WHERE id = LASTVAL();"),
        employee_UPDATE: swig.compile("UPDATE global.man AS dst SET name = coalesce(\'{{ postBody.name }}\',src.name)," + "   last_name   = coalesce(\'{{ postBody.last_name }}\',src.last_name)" + "   middle_name = coalesce(\'{{ postBody.middle_name }}\',src.middle_name)" + " FROM  global.man src  WHERE dst.id = src.id AND dst.id =  {{ restParams.roles }};" + "SELECT id, name, role, parent, start, ended,  changer, changed  FROM  aaa.roles WHERE id = {{ restParams.employee }} AND {{ _('isAuth')('admin') }};"),
        employee_DELETE: swig.compile("DELETE FROM  global.man WHERE id = {{ restParams.employee }} AND {{ _('isAuth')('admin') }};"),

        storesData_CREATE: swig.compile("INSERT INTO locale.\"bookstoreСontent\"(  store, book, count)  SELECT \'{{ postBody.store }}\',\'{{ postBody.book }}\',\'{{ postBody.count }}\' WHERE {{ _('isAuth')('admin') }};" + "SELECT id, name, role, parent, start, ended,  changer, changed  FROM  aaa.roles WHERE id = LASTVAL();"),
        storesData_DELETE: swig.compile("DELETE FROM locale.\"bookstoreСontent\" WHERE id = {{ restParams.storesData }} AND {{ _('isAuth')('admin') }};"),


        // all
        roles_READ: swig.compile("SELECT id, name, role, parent, start, ended,  changer, changed   FROM aaa.roles"),
        employee_READ: swig.compile("SELECT id, name, last_name, middle_name, birthday, gender,start, ended, changer, changed        FROM global.man WHERE id in (SELECT man  FROM aaa.login)  "),
        employeeRoles_READ: swig.compile("SELECT  l.id, man.last_name ||' '||man.name||' '||man.middle_name||' ('|| l.name||')' AS employee,r.name AS role, lr.values, lr.priority, lr.start,lr.ended  FROM  aaa.login l  JOIN global.man man ON man.id = l.man  JOIN aaa.loginrole lr on l.id = lr.login       JOIN aaa.roles r ON lr.roles = r.id     "),
        books_READ: swig.compile("SELECT b.id,b.name,ba.name AS autors,b.edition, b.publisher,b.issue,b.circulation   FROM locale.book b    LEFT JOIN (  SELECT  book, string_agg(' '||man.last_name ||' '||man.name||' '||man.middle_name,',') AS name    	FROM locale.bookautors ba    	JOIN global.man man ON ba.man = man.id    	GROUP BY book      ) AS ba ON ba.book = b.id"),    //employeeRoles_UPDATE:swig.compile("UPDATE global.man AS dst SET name = coalesce(\'{{ postBody.name }}\',src.name)," + "   last_name   = coalesce(\'{{ postBody.last_name }}\',src.last_name)" + "   middle_name = coalesce(\'{{ postBody.middle_name }}\',src.middle_name)" +  " FROM  global.man src  WHERE dst.id = src.id AND dst.id =  {{ restParams.roles }};" + "SELECT id, name, role, parent, start, ended,  changer, changed  FROM  aaa.roles WHERE id = {{ restParams.employee }};"),
        autors_READ: swig.compile("SELECT id, name, last_name, middle_name,  birthday, gender, start, ended FROM global.man  WHERE id in (SELECT  man FROM locale.bookautors)"),
        stores_READ: swig.compile("SELECT bs.id, bs.name,  man.last_name ||' '||man.name||' '||man.middle_name AS managerName, bs.manager   FROM locale.bookstore bs JOIN global.man man ON  bs.manager = man.id"),

        storesData_READ: swig.compile("SELECT data.id, data.store, bs.name AS storeName, data.book, b.name AS bookName, data.count, ba.name AS autors  FROM locale.\"bookstoreСontent\" data     JOIN locale.bookstore bs ON  data.store = bs.id     JOIN locale.book b  ON b.id = data.book    JOIN (  SELECT  book, string_agg(' '||man.last_name ||' '||man.name||' '||man.middle_name,',') AS name    	FROM locale.bookautors ba    	JOIN global.man man ON ba.man = man.id    	GROUP BY book      ) AS ba ON ba.book = data.book    "),
        //complex
        storesData_UPDATE: swig.compile("UPDATE locale.\"bookstoreСontent\" AS dst " +
            " SET count = coalesce({{ postBody.count }},src.count ), " +
            " FROM locale.\"bookstoreСontent\" src " +
            " WHERE dst.id = src.id AND dst.id =  {{ restParams.storesData }} " +
            "  AND " +
            "  (   {{ _('isAuth')('admin') }} " +
            "  OR " +
            "    ( {{ _('isAuth')('storeManager') }} AND src.count > {{ postBody.count }}  AND {{_('AuthMan')('src.manager')}} "),


        //common
        man_READ: swig.compile("SELECT id, name, last_name, middle_name, birthday, gender, start, ended, changer, changed  FROM global.man "),


        "WHERE.isActual": swig.compile("{% for item in arg -%} CURRENT_TIMESTAMP BETWEEN  coalesce({{ item }}.start,CURRENT_TIMESTAMP)  AND coalesce({{ item }}.ended,CURRENT_TIMESTAMP)\n {% if !loop.last %} AND {% endif %}{%- endfor %}"),

        "isAuth": swig.compile(" '{{ arg[0]}}' in (SELECT  r.role  FROM aaa.sessions s JOIn aaa.login l   ON s.login =l.id  JOIN aaa.loginrole lr on l.id = lr.login JOIN aaa.roles r ON lr.roles = r.id WHERE s.id = '{{ session.authorized }}' and {{ _('WHERE.isActual')('s','l','lr','r') }} )"),
        "AuthMan": swig.compile(" {{ arg[0]}} in (SELECT l.man   FROM aaa.sessions s JOIn aaa.login l   ON s.login =l.id  WHERE s.id = '{{ session.authorized }}') and {{ _('WHERE.isActual')('s','l') }}"),

        "CMD": swig.compile("{{ tpl(src)() }}"),
        "WHERE.like": swig.compile("{{ name }} like \"%{% filter replace(' ', '%', 'g') %}{{ value|escape }}{% endfilter %}%\""),
        "WHERE.eq": swig.compile("{{ name }} = {{ value }}"),
        "WHERE.gt": swig.compile("{{ name }} > {{ value }}"),
        "WHERE": swig.compile('{% if filters %} WHERE {% for item in filters -%}{{ tpl("WHERE."+item.type)(item) }} {% if !loop.last %}AND{% endif %}  {%- endfor %}{% endif %}')
    };
/*
 *  Temp function for fast code.
 *  TODO: Find or make default lib for often used function
 *  #DefaultLib
 */
function extend() {
    var target = arguments[0],
        objs = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : [],
        l = objs.length, key, obj;
    for (var i = 0; i < l; i++) {
        obj = objs[i] || {};
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                target[key] = obj[key];
            }
        }
    }
    return target;
}
/*
 *  Temp function for fast code.
 *  TODO: Find or make default lib for often used function
 *  #DefaultLib
 */
function DebuggerLog() {
    if (debuggerMode)
        console.log.apply(console, arguments);
}
/*
 *  Standart SQL query function
 *  Not optimized
 */
function query(sql, params, callback) {
    pg.connect(DATABASE_URL, (err, client, done) => {
        if (err) {
            DebuggerLog('pg.connect error', err);
            done();
            return callback(err);
        }
        DebuggerLog('pg.connect client.query', params);
        client.query(sql, params, function () {
            done();
            callback.apply(client, arguments);
        });
    });
}

/*
 *  Initial load command templates in TPL structure
 */
function init(TPL, callback) {
    "use strict";
    query('SELECT tpl, role, name  FROM sys.cmd ', [], (err, result) => {
        if (err)
            return DebuggerLog('db init err :', err);
        result.rows.forEach(tpl =>   TPL[tpl.name] = swig.compile(tpl.tpl));
        tplInited = true;
        callback();
    });
}

/*
 *  Base SQL function for tho project
 *  TODO: SQL escape
 *
 */

function cmd(params, success, fail) {
    "use strict";
    // DebuggerLog('db.cmd', params);
    if (!tplInited)
       return init(TPL, none => cmd(params, success, fail));
    if ( typeof success != "function") {
        console.trace("db.sql.query no callback")
        return   DebuggerLog('db.sql.query no callback for', params.url, success , fail);

    }

    var sql,
        data = extend({//For nested query
            _: function (name) {
                return  function (arg) {
                    return  TPL[name](extend({ arg: arguments }, data));
                };
            }
        }, params);

    DebuggerLog('db.body =>', params.url, params.src, params.body, params.restParams, params.postBody);

    sql = data._(params.src)(data);

    DebuggerLog('db.sql.query =>', sql);
    query(sql, [], (err, result) => {
        if (err) {
            DebuggerLog('query err: ', err);
            return fail(err);
        }
        DebuggerLog('query do: result.rows.length ', result.rows.length);
        success(result);
    });
}

/*
 *  From HTTP query to SQL function
 *  with used struct
 */
var crud = {
    POST: '_CREATE',
    GET: '_READ',
    PUT: '_UPDATE',
    DELETE: '_DELETE'
};

function mapping(request, response, next) {

    DebuggerLog('db.mapping begin ', request.url);

    if (response.finished)
        return  DebuggerLog('db.mapping finished before ', request.url, response.debug );

    var path = url.parse(request.url).pathname.split('/'),
        resultResponse = (text) => {

            return (result)=> {
                DebuggerLog(text);
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.write(JSON.stringify(result.rows));
                response.end();
            };
        };
    if (path[0] == '')     path.shift();

    DebuggerLog('db.mapping path ', path, path[0]);


    request.src = path[0];

    request.restParams = {};
    for (var i = 1; i < path.length; i += 2)
        request.restParams[path[i]] = path[i + 1];

    request.src += crud[request.method];

    if (typeof(request.postBody) == "string")
        request.postBody = JSON.parse(request.postBody);

    DebuggerLog('db.mapping src ', request.restParams, request.postBody);

    return cmd(request,
        resultResponse('db.mapping  success result.rows.length '),
        resultResponse('db.mapping  error')
    );

}



function checkSession( request, response, next) {
    "use strict";
    DebuggerLog('db.checkSession  url = ', request.url );
    request.sessionConfirmed = false;
    cmd(
        {
            src:'session_READ',
            session: request.session
        },
        result => {
            "use strict";
            if (result.rows.length > 0 )   {
                request.sessionConfirmed = {};
                result.rows.forEach(rule => request.sessionConfirmed [rule.role] = true );

            }
            return next();
        },
        next
    );
}

function login(request, response, next) {
    DebuggerLog('db.login  response.finished = ',response.finished, request.method);
    var toLogin = () => {
            response.writeHead(303, {'Location': '/' });
            response.end();
        };
    var session = request.session = request.session || {};

    if (request.method !== 'POST' )
        return next();

    DebuggerLog('db.login  response.body  ',request.body);

    if (!request.body || request.body.sys !== 'login'  )
        return next();



    DebuggerLog('db.login  session_CREATE POST ');
    request.src      = 'session_CREATE';
    session.key      = crypto.randomBytes(20).toString('hex');
    session.authKey  =  {};
    cmd(request,(result)=> {
        "use strict";
        DebuggerLog('aaa.createSession  DO ',result.rows,'response.finished = ' ,response.finished, request.method);
        if (result.rows.length > 0 ) {
            session.cookie          = session.cookie || {};
            session.cookie.maxAge   = 3600000;
            result.rows.forEach(rule => session.authKey [rule.role] = true );
            request.sessionConfirmed =   session.authKey;
            return toLogin();
        }
        response.session.msg = 'wrongPassword';
        return next();
    },toLogin);
}

function logout(request, response){
    DebuggerLog('aaa.logout',request.session);
    var toLogin = () => {
        response.redirect('/?_dc='+(new Date().getTime()));
    };
    request.src = 'authEnd';
    cmd(request,toLogin,toLogin);
};

exports.loginData  = function(request, response){
    var loginData = function(name){
        "use strict";
        if (response.finished)
            return  DebuggerLog('aaa.loginData finished before ', request.url, response.debug );
        response.writeHead(200, {'Content-Type': 'application/javascript'});
        response.write(" window['loginData'] = "+ JSON.stringify({
            username: name,
            authKey:  request.session && request.session.authKey
        }) + ";");
        response.end();
    };
    request.src =  'authUser';
    cmd(request,r => {
            loginData(r.rows[0] && r.rows[0].username )
        },
        loginData
    );
};


exports.query         = cmd;
exports.mapping       = mapping;
exports.checkSession  = checkSession;
exports.login         = login;
exports.logout        = logout;