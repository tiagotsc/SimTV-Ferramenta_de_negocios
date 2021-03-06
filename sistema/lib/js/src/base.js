(function (window) {

    window.cas = new (function () {
        this.src = window.casSrcFolder || 'build';
        this.roundNumber = function (number, digits) {
            var multiple = Math.pow(10, digits);
            var rndedNum = Math.round(number * multiple) / multiple;
            return rndedNum;
        };

        this.fKM = function(x){
            if (x > 1) {
                return this.roundNumber(x, 2) + 'Km';
            } else {
                return this.roundNumber(x * 1000, 2) +"m";
            }
        };

        this.isNumber = function (n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        };

        this.toggleFullScreen = function() {
            if (
                ( document.fullScreenElement && document.fullScreenElement !== null ) 
                    || ( !document.mozFullScreen && !document.webkitIsFullScreen )
            ) {
                if (document.documentElement.requestFullScreen) {
                    document.documentElement.requestFullScreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullScreen) {
                    document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                }
            } else {
                if(document.cancelFullScreen){
                    document.cancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
            }
        };

        this.dialogResize = function (){
            $('.popup').dialog("option", "width", $(window).width() - 30);
            $('.popup').dialog("option", "height",$(window).height() - 30);
            $('.popup').dialog( "option", "position", "center" );
        };

        this.currMonth = function(){
            var d = new Date();
            var m_names = new Array("Jan", "Feb", "Mar",
                                    "Apr", "May", "Jun", 
                                    "Jul", "Aug", "Sep",
                                    "Oct", "Nov", "Dec");
            //return m_names[d.getMonth()] + "-" + d.getFullYear();
            return "Sep" + "-" + "2012";

        };

        /*
         * x: original string
         * s: pad string
         * n: length
         * y: left pad
         *
         */
        this.strpad = function (x,s,n,y){
            var r = ""+x;
            while(r.length < n){
                if(y)
                    r = s + r;
                else
                    r = r + s;
            }
            return r;
        };

        this.getHrs = function(){
            var xxx = [];
            for(var i = 0;i<24;i++){
                for(var j = 0;j<60;j++){
                    xxx.push( this.strpad(i,'0',2,true) + ':' + this.strpad(j,'0',2,true) );
                }
            }
            return xxx;
        };

        this.toHHMMSS = function(d){
            return d.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
        };

        this.clearNotifs = function(){
            $('.floatingNotif').remove();
        };

        this.makeNotif = function(type,msg,onClick){

            var clickable = (typeof onClick === 'function');

            var n = 
                    $("<div class='floatingNotif "+type+"'>"+
                        "<div class='content'>"+
                            "<div class='text'>"+msg+"</div>"+
                        "</div>"+
                    "</div>");

            var clicker = function(){
                $(this).remove();
                if(clickable){
                    onClick();
                }
            };

            n.click(clicker).css('cursor','pointer').find(".title");

            var others = $('.floatingNotif');
            var t = 50, x, margin, nw = 50, margin = 25;

            if( others.length > 0 ){
                x = others.last();
                t = parseInt(x.attr('actual-top')) + 15;
                nw = Math.min(96,parseInt(x.attr('nw')) + 2);
                margin = (100 - nw)/2;
            }

            n.appendTo('body')
                .css('top',0)
                .css('width',nw+'%')
                .css('left',margin+'%')
                .attr('actual-top',t)
                .attr('nw',nw);
            n.animate({top: t}, 500);

            var me = this;
            this.notifTimeouts.push = setTimeout(function(){
                me.notifTimeouts.shift();
                $('.floatingNotif').first().remove();
            },1000 * 60);

            return n;
        };

        this.hidethis = function(hideme,txt){

            if(hideme !== false){
                this.showthis(hideme,true);

                $('<div class="loadFull'+((hideme === 'body')?' screen':'')+'" style="opacity:0">'+
                        "<div class='loadFullTxt'>"+((txt)?txt:'Carregando')+"</div>"+
                '</div>').prependTo(hideme).animate({opacity:1},1000);

                this.lockmobilescroll();
            }

        };

        this.showthis = function(hideme,now){
            if(hideme !== false){
                if(now){
                    $(hideme).find('.loadFull').remove();
                }else{
                    $(hideme).find('.loadFull')
                        .stop(true,true).animate({opacity:0},1000,function(){
                            $(this).remove();
                        });
                }
                this.unlockmobilescroll();
            }
        };

        this.lockmobilescroll = function(){
            $(document).on('touchstart', this.mobileloadinghack);
        };
        this.unlockmobilescroll = function(){
            $(document).off('touchstart', this.mobileloadinghack);

        };

        this.mobileloadinghack = function(e){
            e.preventDefault();
        };

        this.scrollkilla = function(){
            $('body').addClass('stop-scrolling');
        };

        this.scrollplease = function(){
            $('body').removeClass('stop-scrolling');
        };

        this.cropArray = function(x,n){
            var nn = ( (n < x.length) ? n : x.length);
            var r = [];
            for(var i = 0;i < nn;i++){
                r.push(x[i]);
            }
            return r;
        };

        this.formatMoney = function(n,decPlaces, thouSeparator, decSeparator) {
            var 
                decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
                decSeparator = (decSeparator === undefined) ? "." : decSeparator,
                thouSeparator = (thouSeparator === undefined) ? "," : thouSeparator,
                sign = n < 0 ? "-" : "",
                i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
                j = (j = i.length) > 3 ? j % 3 : 0;
            return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
        };

        // Returns the version of Internet Explorer or a -1
        // (indicating the use of another browser).
        this.getInternetExplorerVersion = function(){
            var rv = -1; // Return value assumes failure.
            if (navigator.appName === 'Microsoft Internet Explorer'){

                var ua = navigator.userAgent;
                var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");

                if (re.exec(ua) !== null){
                    rv = parseFloat( RegExp.$1 );
                }

            }
            return rv;
        };
        this.isIE = function(){
            var ver = this.getInternetExplorerVersion();
            if ( ver > -1 ){
                return true;
            }else{
                return false;
            }
        };

        this.get_pref = function(pref){
            if(typeof this.user.prefs[pref] !== 'undefined'){
                return this.user.prefs[pref];
            }
            return null;
        };

        this.set_pref = function(pref,value){
            this.user.prefs[pref] = value;
            this.ajaxer({
                sendme:{pref:pref,value:value},
                sendto:'login/set_user_pref'
            });
        };



        this.ajaxer = function(ajaxOpts){

            if(typeof ajaxOpts.sendto === 'undefined'){
                return;
            }

            ajaxOpts.sendme = $.extend({js_build:js_build},
                ((typeof ajaxOpts.sendme !== 'object')
                    ?{}
                    :ajaxOpts.sendme
                )
            );

            if(typeof ajaxOpts.silent_load === 'undefined'){
                ajaxOpts.silent_load = false;
            }

            var commons = this;

            $.ajax({
                type: ((ajaxOpts.method)?ajaxOpts.method:'POST'),
                dataType: ((ajaxOpts.dataType)?ajaxOpts.dataType:'json'),
                cache:false,
                data: ((typeof ajaxOpts.sendme !== 'undefined')?ajaxOpts.sendme:null),
                url: ajaxOpts.sendto,
                beforeSend: function(){
                    if(commons.ajaxcount < 0){
                        commons.ajaxcount = 0;
                    }
                    if(!ajaxOpts.silent_load){
                        commons.ajaxcount++;
                        clearTimeout(commons.ajxt);
                    }
                    if( !commons.detectmob() && !ajaxOpts.silent_load && !$('#ajaxindicator').is(':visible') ){
                        $('#ajaxindicator').show();
                    }
                    if(typeof ajaxOpts.before === 'function')
                        ajaxOpts.before();
                },
                complete: function (jqXHR,textStatus){

                    if(!ajaxOpts.silent_load)
                        commons.ajaxcount--;

                    if(commons.ajaxcount <= 0 && !commons.detectmob() && !ajaxOpts.silent_load){
                        clearTimeout(commons.ajxt);
                        commons.ajxt = setTimeout(function(){
                            $('#ajaxindicator').hide();
                        },300);
                    }

                    if(typeof ajaxOpts.complete === 'function'){
                        ajaxOpts.complete({etc: ajaxOpts.etc});
                    }
                },
                error: function(jqXHR, st, errorThrown){
                    
                    console.log(st+': '+errorThrown);

                    switch (st) {
                        case 'abort':
                            console.log('nope');
                            break;

                        default:
                            if (!commons.detectmob() && errorThrown && commons.checkPerms('z')) {

                                if (!$('#ajaxerrormsg').is(':visible')) {
                                    $('#ajaxerrormsg').show();
                                }

                                $('#ajaxerrormsg>.txt').html('Erro: '+
                                        ((st)?st.toUpperCase()+' - ':'')+
                                        ((errorThrown)?errorThrown:'desconhecido'));
                            }
                            break;
                    }

                    if(typeof ajaxOpts.error === 'function'){
                        
                        ajaxOpts.error({etc: ajaxOpts.etc});

                    } else {
                        setTimeout(function(){
                            commons.ajaxer(ajaxOpts);
                        },1000);
                    }
                },
                success: function (data){
                    if (data.status === 'success'){


                        if(typeof data.msg !== 'undefined'){
                            commons.makeNotif('success', data.msg);
                        }

                        if (typeof ajaxOpts.andthen === 'function'){
                            ajaxOpts.andthen({data: data, etc: ajaxOpts.etc});
                        }

                    }else if (data.status === 'permission_error'){

                        window.location.replace("login");

                    }else{

                        commons.showthis('body');
                        commons.makeNotif('error',
                            ((typeof data.msg !== 'undefined')
                                ?data.msg
                                :'Ops... Algo inesperado aconteceu.'
                            ),7000);

                    }
                }
            });
        };

        this.scrollToMe = function(elem,direction){
            if(direction === 'x'){

                elem.parent().stop(true,true).animate({
                    scrollLeft: elem.parent().scrollLeft() + (elem.offset().left - elem.parent().offset().left) - 50
                }, 1500);

            }else if(direction === 'y'){

                elem.parent().stop(true,true).animate({
                    scrollTop: elem.parent().scrollTop() + (elem.offset().top - elem.parent().offset().top) - 50
                }, 1500);

            }
        };

        this.checkPerms = function(x){
            return ( this.user.perms.indexOf(x) > -1 );
        };

        this.niceResizer = function(elem){
            elem.getNiceScroll().resize();
        };

        this.osSigaLink = function(os){
            if(os.svc.toLowerCase() === 'cm'){
                return "http://192.168.140.97:8080/gxvision/servlet/haccioniordenes2?"+os.per+","+os.os;
            }else{
                return "http://192.168.140.97:8080/gxvision/servlet/haccionrepara?"+((os.grpper)?os.grpper:os.per)+","+os.os;        
            }
        };

        this.inArray = function(x,a){
            var i = a.indexOf(x);

            if(i > -1){
                return a[i];
            }else{
                return null;
            }

        };

        this.kill = function(x, a){
            var i = a.indexOf(x);
            if(i > -1){
                a.splice(i,1);
            }
            return a;
        };

        this.detectmob = function() {
            if(this.isMobile === null){
                if(
                    navigator.userAgent.match(/Android/i)
                    || navigator.userAgent.match(/webOS/i)
                    || navigator.userAgent.match(/iPhone/i)
                    || navigator.userAgent.match(/iPad/i)
                    || navigator.userAgent.match(/iPod/i)
                    || navigator.userAgent.match(/BlackBerry/i)
                    || navigator.userAgent.match(/Windows Phone/i)
                ){
                    this.isMobile = true;
                }else{
                    this.isMobile = false;
                }
            }
            return this.isMobile;
        };

        this.parseArgs = function(){
            
            if( window.location.hash.length > 2 && window.location.hash.substr(0,2) === '#!' ){
                var j = window.location.hash.substr(2);

                this.args = JSON.parse(decodeURIComponent(j));
                if( this.args && this.args.msg ){
                    this.makeNotif(this.args.msg.type, this.args.msg.content);
                    delete this.args.msg;
                    this.pushArgs();
                }
            }else{
                this.args = {};
            }
            
        };

        this.hashbangify = function(x){
            var json = JSON.stringify(x);
            
            return "!"+(this.isOldAndroid() ? encodeURIComponent(json) : json);
        };

        this.pushArgs = function(){

            if(Object.keys(this.args).length){
                window.location.hash = this.hashbangify(this.args);
            }else{
                window.location.hash = '';
            }

        };
        this.isOldAndroid = function(){
            var navU = navigator.userAgent;
            // Android Mobile
            var isAndroidMobile = navU.indexOf('Android') > -1 && navU.indexOf('Mozilla/5.0') > -1 && navU.indexOf('AppleWebKit') > -1;

            // Android Browser (not Chrome)
            var regExAppleWebKit = new RegExp(/AppleWebKit\/([\d.]+)/);
            var resultAppleWebKitRegEx = regExAppleWebKit.exec(navU);
            var appleWebKitVersion = ( (resultAppleWebKitRegEx === null) ? null : parseFloat(regExAppleWebKit.exec(navU)[1]) );
            var isAndroidBrowser = isAndroidMobile && appleWebKitVersion !== null && appleWebKitVersion < 537;
            return isAndroidBrowser;
        };
        this.isString = function (obj){
            var toString = Object.prototype.toString;
            return toString.call(obj) === '[object String]';
        };

        this.weirdDialogSpawn = function(coords,content,me,nice){
            if(!me 
                || !me.length 
                    || !$.contains(document.documentElement, me[0])
            ){
                me = 
                    $("<div class='weird-dialog' style='opacity:0'>"+
                        "<div class='weird-dialog-handler' "+
                            ((nice)?" title='Arraste para mover' ":'')+
                        ">&zwnj;</div>"+
                        "<div class='weird-dialog-content'></div>"+
                        "<div class='weird-dialog-close' title='Fechar'>&zwnj;</div>"+
                    "</div>")
                        .appendTo('body');

                me.css('left',0).css('top',0);

                if (typeof jQuery.ui !== 'undefined') {
                    var opts = {containment:'body', handle:'.weird-dialog-handler'};
                    if(nice){
                        opts.drag = function(){
                            $(this).find('.weird-dialog-content').getNiceScroll().resize();
                        };
                    }
                    me.draggable(opts);
                }

                me.children('.weird-dialog-close').click(function(){
                    $(this).parent().remove();
                });

                if(nice){
                    me.children('.weird-dialog-content').niceScroll({horizrailenabled:false});
                }

                me.animate({
                    opacity:1
                },500);
            }

            me.children('.weird-dialog-content').empty().append(content);

            if(coords){
                me.css('left', coords.left).css('top', coords.top);
            }else{
                setTimeout(function(){
                    var mc = $('.weird-dialog').length - 1;
                    me
                        .css('left',
                            $(window).width() 
                            - me.outerWidth() 
                            - (((mc > 0)?mc:0) * 40)
                        )
                        .css('top',
                            ( $(window).height() + $(window).scrollTop() )
                            - me.outerHeight() 
                            - (((mc > 0)?mc:0) * 40)
                        );
                },100);
            }
            if( !this.triggedAlready ){
                $(document).on('keydown',function(e){
                    if( e.keyCode === 27 ){
                        $('.weird-dialog').last().remove();
                    }
                });
                this.triggedAlready = true;
            }
            return me;
        };

        this.weirdDialogClose = function(){
            $('.weird-dialog').remove();
        };

        this.getScrollbarWidth = function(){

            var outer = document.createElement("div");
            outer.style.visibility = "hidden";
            outer.style.width = "100px";
            document.body.appendChild(outer);

            var widthNoScroll = outer.offsetWidth;
            // force scrollbars
            outer.style.overflow = "scroll";

            // add innerdiv
            var inner = document.createElement("div");
            inner.style.width = "100%";
            outer.appendChild(inner);        

            var widthWithScroll = inner.offsetWidth;
            // remove divs
            outer.parentNode.removeChild(outer);
            return widthNoScroll - widthWithScroll;
        };

        this.requestDesktopNotif = function(){
            if( this.checkDesktopNotif() === 'default' )
                this.makeNotif('information',

                    'Este navegador suporta notificações globais, '+
                        'se voce trabalha com várias abas e janelas abertas ao mesmo tempo, é uma boa idéia ativá-las. '+
                    'Clique nesta mensagem para configurar.',

                    function(){
                        Notification.requestPermission();
                    }
                );
        };

        this.createDesktopNotification = function(title,options){
            if(!window.Notification){
                return false;
            }
            var callback = null;

            if(typeof options.callback !== 'undefined'){
                callback = options.callback;
                delete options.callback;
            }
            var onclick = function(){
                window.focus();
                if(typeof callback === 'function')
                    callback();
            };
            if(typeof options.onclick !== 'undefined'){
                onclick = options.onclick;
                delete options.onclick;
            }
            var defaults = {
                icon: '/lib/img/new_sim_logo-thumb.png'
            };

            var n = new Notification(title,$.extend({},defaults,options));
            n.onclick = onclick;
        };

        this.checkDesktopNotif = function(){
            if(!window.Notification){
                return 'denied';
            }

            if(typeof Notification.permission !== 'undefined'){
                return Notification.permission;
            }

            var p = parseInt(webkitNotifications.checkPermission());

            if(p === 0){
                return 'granted';
            }

            if(p === 1){
                return 'default';
            }

            return 'denied';
        };

        this.forceClock = false;
        this.controller = null;
        this.toosmall = false;
        this.isMobile = null;
        this.args = {};
        this.triggedAlready = false;
        this.ajaxcount = 0;
        this.ajxtimeout = null;
        this.ajxt = null;
        this.resizer = [];
        this.user = null;
        this.notifTimeouts = [];
        
        return this;
    })();

    window.openUserChat = function(){
        if(typeof window.actuallyOpenChat === 'function'){
            actuallyOpenChat.call(this);
        }else{
            alert('Chat não definido');
        }
        return false;
    };

    window.previousTITLE = window.document.title;
    window.alerts = {
        baixa:[],
        status:[]
    };
    window.alertstatus = false;
    window.countAlerts = function(){
        var c = 0;
        for(var i in alerts)
            c += alerts[i].length;
        return c;
    }
    window.alertToggle = function(){
        var c = countAlerts();
        if( c > 0 && !alertstatus){
            var s = ((c>1)?'s':''),b = c+" Novo"+s+" Alerta"+s;
            previousTITLE = window.document.title;
            window.document.title = b;
            alertstatus = true;
        }else{
            if(alertstatus){
                window.document.title = previousTITLE;
                alertstatus = false;
            }
        }
        setTimeout(alertToggle,700);
    }
    window.alertToggle();
}(window));