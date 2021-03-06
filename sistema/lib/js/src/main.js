function casMain(){
    window.svrtime = new Date();
    var cas = window.cas;
    var clockwork,updtime;
    var rszthread = null;

    function init(){
        updateTIME();
        if(cas.isIE()){
            $('body').html(
                "<div style='display:block;margin: 50px'>"+
                    "<p style='font-weight:bold;'>Obrigado por utilizar o Portal da Rede!</p>"+
                    "<p>Mas tenha em mente que este site não foi desenvolvido para suportar o Internet Explorer.<br>"+
                    "Aconselhamos que você baixe e utilize um dos seguintes browsers:</p>"+
                        "<ul style='margin-top:10px;'>"+
                            "<li><a class='browserlist' id='google-chrome' href='http://www.google.com/chrome/'><span>Google Chrome</span></a></li>"+
                            "<li><a class='browserlist' id='firefox' href='http://www.mozilla.org/'><span>Mozilla Firefox</span></a></li>"+
                        "</ul>"+
                        "<h6 style='margin-top:20px;text-align:right;font-style:italic'>É de graça.</h6>"+
                "</div>");
            return false;
        }
        $('#content').hide();
        cas.parseArgs();
        cas.ajaxer({
            method:'GET',
            sendto:'login/umenu',
            andthen:umenu_
        });

        cas.requestDesktopNotif();
    }

    function rePosNav(){
        $('.navlist').each(
            function(){
                var parent = $(this).prev('.navsubmenu');
                if(cas.toosmall)
                    $(this).css('right',0);
                else
                    $(this).css('right',$(window).width() - parent.offset().left - parent.outerWidth());
                $(this).css('top',parent.outerHeight());
            }
        );
    }
    function updateTIME(){
        $.getJSON('servertime.php',
            function(data){
                if(data.time){
                    var aux = new Date();
                    window.svroffset = ( ( aux.getTimezoneOffset() - data.offset ) * 1000 * 60 );
                    var real = data.time + window.svroffset;
                    window.svrtime = new Date(real);
                    
                    if(!clockwork)
                        putTIME();
                    clearInterval(updtime);
                    updtime = setInterval(updateTIME,1000 * 60);
                }
            }
        );
    }

    function putTIME(){
        window.svrtime = new Date(window.svrtime.getTime() + 1000);
        $('#servertime').html(window.svrtime.toLocaleString());
        clearInterval(clockwork);
        clockwork = setInterval(putTIME,1000);
    }
    
    

    $(window).resize(function(){
        clearTimeout(rszthread);
        rszthread = setTimeout(function(){
            
            rePosNav();
            for(var i in cas.resizer){
                if(typeof cas.resizer[i] === 'function')
                    cas.resizer[i].call(window);
            }
            TTRsz();
            
        },300);
    });

    function TTRsz(){
        if($(window).width() < 500){
            cas.toosmall = true;
            $('.navtxt').addClass('tooSmallToShow').removeClass('navtxt');
            $('#pagetitle').hide();
        }else{
            cas.toosmall = false;
            $('.tooSmallToShow').removeClass('tooSmallToShow').addClass('navtxt');
            $('#pagetitle').show();
        }
    }
    $(window).keydown(function(e){
        if(e.keyCode === 27){
            $(".navlist").hide();
            $(".submenuactive").removeClass("submenuactive");
        }
    });
    $("body").on("click",function(){
        $(".navsubmenu").removeClass("submenuactive");
        $(".navlist").hide();
    });
    
    function umenu_(x){
        cas.user = x.data.user;
        cas.permissora = x.data.pers;
        cas.sys_args = x.data.sys_args;
        cas.systemEnv = x.data.env;
        if(!cas.user.prefs)
            cas.user.prefs = {};
        var nav = $('#navmenu');
        if(cas.detectmob()){
            
            var ns = $("<div id='maxmenus'>").appendTo('body');
            $("<div id='maxmenuclose'>Menu<div id='maxmenucloseicon'></div></div>")
                .appendTo(ns).click(function(){
                    $('#maxmenus').animate({left:(0 - $('#maxmenus').width())},500,function(){
                        $('#maxmenus').hide();
                        $('body').css('height','');
                    });
                });
            for(var i in x.data.menu){
                var menu = x.data.menu[i];
                $("<div class='maxmenuslabel'>"+menu.descr+"</div>").appendTo(ns);
                for(var j in menu.pages)
                    $("<a href='"+menu.pages[j].name+"' class='maxmenusoption"+
                        ((window.location.pathname.substr(1) === menu.pages[j].name)
                            ?' selected':'')+"'>"+menu.pages[j].descr+"</a>").appendTo(ns);
            }

        }else{
            for(var i in x.data.menu){
                var menu = x.data.menu[i];
                
                $("<span class='navsubmenu nav"+i+
                        "'><span class='navico'>&zwnj;</span>"+"<span class='navtxt'>"+menu.descr+
                            "</span>"+"</span>")
                    .appendTo(nav).click(function(){
                        $('.navlist').hide();
                        if(!$(this).is('.submenuactive')){
                            $('.submenuactive').removeClass('submenuactive');
                            $(this).addClass('submenuactive');
                            $(this).next('.navlist').show();
                        }else{
                            $('.submenuactive').removeClass('submenuactive');
                        }
                        rePosNav();
                        return false;
                    }).hover(rePosNav);
                
                var subnav = $("<div class='navlist'></div>").appendTo(nav);
                for(var j in menu.pages){
                    subnav.append(
                        "<a href='"+menu.pages[j].name+"' class='navwrap'>"+
                            "<span class='navoption'>"+menu.pages[j].descr+"</span>"+
                            "<span class='navcheat'>&zwnj;</span>"+
                        "</a>"
                    );
                }
            }
        }
        
        $('#content').show();
        $(window).trigger('resize');

        if(typeof cas.controller === 'function'){
            cas.controller();
        }
        queryChat();
        //panicButton();
    }
    function panicButton(){
        if(cas.checkPerms('z') && cas.systemEnv === 'dev'){
            $('#panic-button').remove();
            $("<a id='panic-button'>Limpar cache</a>").click(function(){
                cas.ajaxer({
                    method:'GET',
                    sendto:'adm/clean_cache',
                    andthen:function(){
                        window.location.reload(true);
                    }
                });
            }).appendTo('#content');
        }
    }
    function queryChat(){
        if(cas.user.login && cas.sys_args.chat_ok){
            loadChat();
        }
    }
    function loadChat(){
        LazyLoad.js('/lib/js/' + cas.src + '/chat.js');
        LazyLoad.css('/lib/css/' + cas.src + '/chat.css');
    }
    $('#showmenu').click(function(){
        $('#maxmenus').height('auto');
        if($(document).height() > $('#maxmenus').height())
            $('#maxmenus').height($(document).height());
        else
            $('body').height($('#maxmenus').height());
        $('#maxmenus').show().animate({left:0},500);
    });
    $('#ajaxerrormsg').click(function(){
        $(this).hide();
    });

    $(window).on('hashchange', cas.parseArgs.bind(cas));
    
    if(typeof Highcharts !== 'undefined'){
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
    }
    
    $(window).scroll(function(){
        if($(this).scrollLeft() > 0)
            $(this).scrollLeft(0);
    });

    init();
}