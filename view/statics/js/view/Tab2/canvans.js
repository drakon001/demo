"use strict";
$Q.define('View.Tab2.canvans',{
    extend:'View',
    tagName:'div',
    className:'span12 pagination-centered',
    viewTpl:'<canvas height="800" width="800" >Обновите браузер</canvas>',
    data:[
    {
        "category": "Sector",
        "metrics": [
            {"name":"Accom.&Food","value":147},
            {"name":"Educ.&HH","value":227},
            {"name":"Manufacturing","value":7},
            {"name":"Other","value":73},
            {"name":"Real Est. & Con.","value":402},
            {"name":"Services","value":20},
            {"name":"Whols. & Retail","value":36}
        ]
    },
    {
        "category": "Region",
        "metrics": [
            {"name":"CENTRAL TEAMS","value":225},
            {"name":"LONDON & SE","value":135},
            {"name":"MIDLANDS & WALES","value":111},
            {"name":"NORTH","value":151},
            {"name":"OTHER","value":232},
            {"name":"SCOTLAND, NI & NE ENGLAND","value":28},
            {"name":"THAMES VALLEY & SW","value":31}
        ]
    },
    {
        "category": "Rating",
        "metrics": [
            {"name":"1 to 3","value":600},
            {"name":"4 to 6","value":166},
            {"name":"7 to 9","value":0},
            {"name":"Unrated","value":148}
        ]
    },
    {
        "category": "Performance",
        "metrics": [
            {"name":"FEVE Monitor","value":0},
            {"name":"FEVE Seriour","value":0},
            {"name":"NPL","value":913},
            {"name":"UTD","value":0}
        ]
    }],
    degrees:0,
    toRad:function(degree){
        return (degree*Math.PI / 180);
    },
    anglePoint:function(center,point){  //\return rad
        var dX       = point.x - center.x,
            dY       = point.y - center.y,
            angle    = Math.atan(dY/dX);
        if      (dX < 0)        angle +=   Math.PI;
        else if (dY < 0)        angle += 2*Math.PI;
        return angle;
    },
    getCenter:function(canvas){
        canvas = canvas ||  this.canvas;
        return {
            x:canvas.width/2,
            y:canvas.height/2
        };
    },
    draw:function(fn){
        var ctx = this.ctx;
        ctx.beginPath()
        var result = fn(ctx);
        ctx.closePath();
        return result;
    },
    animate:function animate(conf) {
            var opts ={},
                ext  = {
                    next: function(conf){
                        this.nextConf = {};
                        _.extend(this.nextConf,ext,conf);
                        return this.nextConf;
                    },
                    promise:function(fun){  this.promiseFn = fun; }
             };
            _.extend(opts,ext,conf);


            var start = new Date,
                id = setInterval(function() {
                    var progress = (new Date - start) / opts.duration;
                    if (progress > 1) progress = 1
                        opts.step(progress);
                    if (progress == 1) {
                        clearInterval(id);
                        opts.nextConf && animate(opts.nextConf);
                        opts.promiseFn && opts.promiseFn();
                    }
                }, opts.delay || 10);
            opts.stop=function(){ clearInterval(id); };
            return opts;
        },
    background:function(color){
        var width =  this.canvas.width,
            height = this.canvas.height;
        return this.draw(function(ctx){
            ctx.fillStyle = color;
            ctx.fillRect(0, 0,width, height);
        });
    },
    ring:function (point,rIn,rOut,color, angle, delta){
        var width  = (rOut - rIn),
            radius = rIn + width/ 2,
            deltaR = this.toRad(angle + delta) ||  2*Math.PI,
            angleR = this.toRad(angle)         ||  0;
        return this.draw(function(ctx){
            ctx.arc(point.x,point.y, radius, angleR, deltaR);
            ctx.lineWidth   = width;
            ctx.strokeStyle = color;
            ctx.stroke();
        });
    },
    radius:function (point, inR, outR, degrees, linewidth, color) {
        var radians = this.toRad(degrees),
            cos = Math.cos(radians),
            sin = Math.sin(radians);
        return this.draw(function(ctx){
            ctx.moveTo(point.x + inR * cos,  point.y + inR * sin);
            ctx.lineTo(point.x + outR * cos, point.y + outR * sin);
            ctx.strokeStyle = color;
            ctx.lineWidth   = linewidth;
            ctx.stroke();
        });
    },
    rotate:function drawRotated(image,point,degrees,doOnImage){
        var degreesR = this.toRad(degrees);

        return this.draw(function(ctx){
           ctx.save();
           ctx.translate(point.x,point.y);
           ctx.rotate(degreesR);
           ctx.drawImage(image,-image.width/2,-image.width/2);
           ctx.translate(-point.x,-point.y);
           doOnImage && doOnImage(ctx);
           ctx.restore();
        });
     },
    arcText:function ( str, point, radius, angleC ,sectorC,color,font, k1) {

        var len = str.length,s,letterAngle, k =1, arr=[],ctx = this.ctx,
            getStrAngle = function(str,radius,arr){
                var  strAngle=0,
                    len = str.length;
                for (var n = 0; n < len; n++)
                    strAngle += (arr[n] = Math.asin(ctx.measureText(str[n]).width / (2*radius)));
                return 2*strAngle;
            },
            angle   = this.toRad(angleC),
            sector  = this.toRad(sectorC),
            strAngle= (k1 ||1)*getStrAngle(str,radius,arr);
        k1 = k1 ||1;
        if (strAngle < sector ) angle = angle + (sector - strAngle)/2;
        else                    k = sector/strAngle;

        if ( k < 0.70){
            var e = arr.length -1,l = k;
            while ( l < 0.5){
                strAngle -= k1*2*arr[e];
                l = sector/strAngle;
                e--;
            }
            str = str.slice(0,e)+'..';
            strAngle = k1*getStrAngle(str,radius,arr);
            k = sector/strAngle;
            len = str.length;
        }
        return this.draw(function(ctx){
            ctx.save();
            ctx.textAlign = 'center';
            ctx.translate(point.x, point.y);
            ctx.rotate(angle + Math.PI / 2);

            for (var n = 0; n < len; n++) {
                s = str[n];
                letterAngle = k*arr[n]*k1;

                ctx.rotate(letterAngle);
                ctx.save();

                ctx.translate(0, -radius);
                ctx.font        = font;
                ctx.fillStyle   = color;
                ctx.fillText(s, 0, 0);
                ctx.restore();

                ctx.rotate(letterAngle);
            }
            ctx.restore();
        });
    },
    imageSave:function(canvas,begin,end,image){
        image = image || document.createElement("canvas");
        var ctx = image.getContext("2d");
        if (!begin)
            begin ={x:0,y:0};
        if (!end)
            end ={x:canvas.width,y:canvas.height};
        image.width  = end.x-begin.x;
        image.height = end.y-begin.y;
        ctx.drawImage(canvas, 0, 0, image.width, image.height);
        return  image;
    },
    createRadialGradient:function(ctx,point0,r0,point1,r1,color){
        var grd = ctx.createRadialGradient(point0.x, point0.y, r0, point1.x, point1.y, r1);
        for (var i=0;i < color.length; i++)
            grd.addColorStop(i, color[i]);
        return grd;
    },
    getCurrent:function(){ return this.current; },
    setCurrent:function(value){
        this.current = value;
        this.markCurrent();
    },
    markCurrent: function(){
        var current =  this.getCurrent(),
            delta   = this.getDelta();
        this.ring(this.getCenter(),310,310+30, '#222222', current*delta, delta );
        this.arcText( this.getDataFromPosition(current).name, this.getCenter(), 320, current*delta, delta, '#FFFFFF', '10px sans-serif',0.7) ;
    },

    drawRotated:function drawRotated(image,degrees){
        this.degrees = degrees;
        this.background('#176179');
        this.rotate(image,this.getCenter(this.canvas),degrees,this.markCurrent.bind(this));
        this.mdlText(1);

    },


    getDelta:function(){
        this.secNum = [];
        var count =0;
        for (var i =0; i < this.data.length ; i++){
            this.secNum.push(count);
            count +=  this.data[i].metrics.length;
        }     
        return 360/count;
    },
    isSectorBorder:function(i){
        return this.secNum.indexOf(i) !== -1;
    },
    drowAngle:function(point, outerRadius ){
        var delta = this.getDelta();
        for (var i = 0; i*delta < 360; i++)
            if (this.isSectorBorder(i))  this.radius(point, 85,  outerRadius, i*delta,  1, '#000000');
            else                         this.radius(point, 120, outerRadius, i*delta, 0.5, '#FFFFFF');

    },
    percent:function(array,n){
        var sum =0;
        for (var i = 0; i < array.length; i++)
            sum += array[i].value;
        return (array[n].value/sum)*100;
    },

    mdlText:function(p){
        var ctx    = this.ctx,
            cw     = this.canvas.width/2,
            ch     = this.canvas.height/2;
        ctx.beginPath();
        ctx.font      = "30px Comic Sans MS";
        ctx.fillStyle = "rgba(88,94,105,"+p+")";
        ctx.textAlign = "center";
        ctx.fillText("Hello World", cw, ch); 
        ctx.closePath();             
    },
    getDataFromPosition:function(n){
        var data = this.data,
            count = 0;
        for (var i =0; i < data.length ; i++){
            for (var j =0; j < data[i].metrics.length;  j++){
                if ((count+j) == n ){
                    return  data[i].metrics[j];
                }
            }
            count +=  data[i].metrics.length;
        }

    },
    click:function(x,y){
        var me     = this,
            center = {
                x:me.canvas.width/2,
                y:me.canvas.height/2
            },
            degrees = me.degrees,
            degreesR= me.toRad(me.degrees) || 0,
            delta   = me.getDelta(),
            deltaR  = me.toRad(delta),
            count   = ((2*Math.PI/deltaR)+ 0.5) | 0,
            curAngle= this.anglePoint(center,{x:x,y:y}),
            n = (((curAngle - degreesR)/deltaR))|0;

        if (n >= count)    n -= count;
        if (n < 0)         n += count;

        if (degrees > 180)       this.degrees = degrees = ( degrees -360);
        if (degrees < -180)      this.degrees = degrees = ( degrees +360);

        this.setCurrent(n);
        this.currentMove && this.currentMove.stop();
        this.drawRotated(this.Image,this.degrees);
        if (Math.abs(degrees + n*delta) > 180 )
           n = n-count;
        this.currentMove =  this.animate({
            duration:3000,
            step:function(p){
                me.drawRotated(me.Image,(1-p)*degrees-p*n*delta);
            }
        });

            

    },
    initialize: function(data) {
        this.$el.addClass('span12 pagination-centered');
        this.callParent(arguments) ;

        var canvas = this.canvas = this.$('*')[0],
            ctx    = this.ctx = this.canvas.getContext('2d'),
            center = this.getCenter();

        this.background('#176179');
        var me =this;
        canvas.onclick = function(e) { 
              me.click((e.pageX - canvas.offsetLeft) || 0, (e.pageY - canvas.offsetTop)  || 0); 
        };

        ctx.scale(1,1);
        this
        .animate({ duration:1000,step:function(p){    me.ring(      center,  0,     85*p, '#2e3643');     }  })
        .next({ duration:500,    step:function(p){    me.mdlText(p);                                      }  })
        .next({ duration:500,    step:function(p){    me.ring(      center, 85,  85+35*p, '#585e69');     }  })
        .next({ duration:500,    step:function(p){    me.ring(      center,120,120+155*p,  me.createRadialGradient(ctx,center, 120, center, 265,["#e1e6e8","#bcc7cb"]));     }  })
        .next({ duration:500,    step:function(p){    me.ring(      center,265, 265+45*p, '#ffffff');     }  })
        .next({ duration:500,    step:function(p){    me.ring(      center,310, 310+30*p, '#788e96');     }  })
        .next({ duration:500,    step:function(p){    me.drowAngle( center,120+(340-120)*p );             }  })
        .promise(function(){
            var count = 0, 
                delta = me.getDelta();
            for (var i =0; i < me.data.length ; i++){
                me.arcText( me.data[i].category, center, 97, count*delta,me.data[i].metrics.length*delta, '#FFFFFF', '20px Verdana') ;
                
                for (var j =0; j < me.data[i].metrics.length;  j++){
                    var  p = me.percent(me.data[i].metrics,j);
                    me.arcText( me.data[i].metrics[j].name,     center, 320, (count+j)*delta, delta, '#222222', '10px sans-serif',0.7) ;
                    me.arcText(' '+(count+j),                   center, 280, (count+j)*delta, delta, '#222222', '30px sans-serif');
                    me.arcText( (Math.round(p * 10) / 10 )+'%', center, 240, (count+j)*delta, delta, '#222222', '18px sans-serif',0.7);
                    if (p > 0)
                        me.ring(center,119,120 + p, me.createRadialGradient(ctx,center, 120, center, 265,["#873d7a","#662b5b"]), (count+j)*delta, delta);
                }
                count +=  me.data[i].metrics.length;
            }
            me.ring(center,0,85,'#2e3643');
            me.Image = me.imageSave(canvas);
            me.mdlText(1);

        });
    },
    getView:function(){   return this.$el;          }

});
