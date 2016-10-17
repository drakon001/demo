/**
 * Created by drakon on 05.09.16.
 */



const url      = require('url'),
    fs         = require('fs'),
    pug        = require('pug'),
    nodeStatics= require('node-static'),
    path       = require('path'),
    root       = '../view';


function pathGet(viewPath){
    "use strict";
    viewPath    = viewPath  || root;
    if (typeof viewPath =='string' )
        viewPath = viewPath.split('/');
    if (viewPath instanceof Array){
        if (viewPath[0] == '.'){
            var rootPath = root.split('/'),
                pop = (viewPath[0] = rootPath.pop());
            while((pop = rootPath.pop()))
                viewPath.unshift(pop);
            viewPath.unshift(__dirname);
        }
        viewPath   =   path.join.apply(path,viewPath);
    }
    return viewPath;
}

function pathInUrl(urls,root,prefix){
    "use strict";
    var pathInUrl = url.parse(urls).pathname.split('/');
    pathInUrl.unshift(prefix);
    pathInUrl.unshift(root);
    return  path.parse(path.join.apply(path,pathInUrl));
}

function page(view,statics){
    "use strict";

    var file;
    if (statics === void 0) {
        view    = view    || 'view/statics';
        file  = new nodeStatics.Server(pathGet(view));
        return function(request, response){
            return  file.serve(request, response);
        }
    }
    view    = pathGet(view    ||  'view');
    statics = pathGet(statics ||  'view/statics');
    file  = new nodeStatics.Server(pathGet(statics));
    return function Pug(request, response, next){
        "use strict";
        var filePath = pathInUrl( !request.sessionConfirmed ?'/login':request.url,view,'pug'),
            obj      = path.parse(path.join(filePath.dir,filePath.base));

        filePath = path.join(obj.dir,obj.name+'.pug');
        fs.readFile(filePath,'utf8', (err, data) => {
            if (err || !data)
                return  file.serve(request, response);
            var  body = pug.compile( data,{ filename:filePath })(request);
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(body);
            response.end();
        });
    }

}
exports.page   = page;
