cas.controller = function(){
    var myclock,clocker,uptime;
    var thread_crit;
    var isMobile = cas.detectmob();
    var tmp = cas.args.tselected;
    if(tmp && tmp.length)
        var tselected = tmp;
    else
        var tselected = ['sim'];
    
    var nselected = false;
    var up_time = 60;
    function gTree(x,open){
        
        if(typeof x !== 'undefined'){
            var phtm = '';
            var children =
                {
                    area:'nodes',
                    node:'ceps',
                    cep:'nopz'
                };
            var level = false;
            for(var a in x){
                if(!level){
                    if(typeof x[a].nodes !== 'undefined'){
                        level = 'area';
                    }else{
                        if(typeof x[a].ceps !== 'undefined'){
                            level = 'node';
                        }else{
                            level = 'cep';
                        }
                    }
                    phtm += "<ul class='ttree' level='"+level+"'>";
                }
                
                var calcDescr = ' - ';
                if(x[a].x){
                    calcDescr += 'Reclamações TV: ' + x[a].x.tv;
                    calcDescr += ', Reclamações CM: ' + x[a].x.cm;
                }
                
                if(level === 'cep'){
                    phtm += "<li class='tnode tnull"+((tselected.indexOf(x[a].id) > -1)?' tselected':'')+
                            "' id='"+x[a].id+"' "+((x[a].abbr)?"abbr='"+
                                x[a].abbr+"' ":'')+"name='"+x[a].name+"'>";
                    phtm += "<div class='thenode' title='"+x[a].name+' - '+x[a].descr + calcDescr+"'>";
                        phtm += "<span class='nodeico'>&zwnj;</span>"+
                            "<span class='nodescr'>["+x[a].count+"] "+x[a].name+"</span>";
                }else{
                    var alert = false;
                    if(x[a].avg){
                        alert = x[a].count > x[a].avg;
                        calcDescr += ', Média Histórica: ' + x[a].avg;
                    }
                    phtm += "<li class='tnode"+
                                ((alert)?' talert':'')+
                                ((open.indexOf(x[a].id) > -1)?' topen':'')+
                                ((tselected.indexOf(x[a].id) > -1)?' tselected':'')+
                                    "' id='"+x[a].id+"' "+((x[a].abbr)?"abbr='"+x[a].abbr+"' ":'')+"name='"+
                                        x[a].name+"'>";
                        phtm += "<div class='thenode' title='"+x[a].name+calcDescr+"'>";
                        phtm += "<span class='nodeico'>&zwnj;</span>"+
                            "<span class='nodescr'>["+x[a].count+"] "+x[a].name+"</span>"+
                            "<span class='mbtwrapper'>"+
                                ((cas.checkPerms('e'))
                                    ?"<a target='_blank' href='eventos#"+cas.hashbangify({filter:{l:[x[a].name]}})
                                        +"' class='onw' title='Abrir Eventos'>&zwnj;</a>"
                                    :'')+
                                ((cas.checkPerms('a') && x[a].dashboard)
                                    ?"<a target='_blank' href='"+x[a].dashboard+
                                        "' class='dashboardlink' title='Abrir Estatísticas'>&zwnj;</a>"
                                    :'')+
                            "</span>";
                }
                phtm += "</div>";
                phtm += gTree(x[a][children[level]],open) + "</li>";
            }
            if(level){
                return phtm + "</ul>";
            }else{
                return '';
            }
        }else{
            return '';
        }
    }
    
    $('#left').on('click','.onw,.dashboardlink',function(e){
        e.stopPropagation();
        //return false;
    });
    var ctrlPressed = false;
    var waitunctrl = false;
    $(window).keydown(function(evt) {
        if(!$('#left').is(':hover'))
            return true;
        if (evt.which === 17) { // ctrl
          ctrlPressed = true;
        }
    }).keyup(function(evt) {
        if(!$('#left').is(':hover'))
            return true;
      if (evt.which === 17) { // ctrl
        ctrlPressed = false;
        if(waitunctrl){
            waitunctrl = false;
            selectView();
        }
      }
    });

    $('#left').on('click','.thenode',function(e){
        var pid = $(this).parent().attr('id');
        var plvl = $(this).parent().parent().attr('level');
        if(plvl === 'area' && ctrlPressed){
            waitunctrl = true;
            if(tselected.indexOf(pid) === -1){
                if(tselected.length 
                    && $('#'+tselected[0]).parent().attr('level') !== 'area'
                ){
                    $('.tnode').removeClass('tselected');
                    tselected = [];
                }
                tselected.push(pid);
                $(this).parent().addClass('tselected');
            }else{
                $(this).parent().removeClass('tselected');
                cas.kill(pid,tselected);
                if(!$('.tselected').length ){
                    $('#sim>.thenode').trigger('click');
                }
            }
        }else{
            $('.tnode').removeClass('tselected');
            $(this).parent().addClass('tselected');
            tselected = [pid];
        }
        cas.args.tselected = tselected;
        cas.pushArgs();
        if(!waitunctrl){
            var olng = {
                "sProcessing":   "Processando...",
                "sLengthMenu":   "Mostrar _MENU_ registros",
                "sZeroRecords":  "Não foram encontrados resultados",
                "sInfo":         "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                "sInfoEmpty":    "Mostrando de 0 até 0 de 0 registros",
                "sInfoFiltered": "(filtrado de _MAX_ registros no total)",
                "sInfoPostFix":  "",
                "sSearch":       "Buscar:",
                "sUrl":          "",
                "oPaginate": {
                    "sFirst": "Primeiro",
                    "sPrevious": "Anterior",
                    "sNext": "Seguinte",
                    "sLast": "Último"
                }
            };
            selectView();
        }
        return false;
    });
    $('#left').on('click','.nodeico',function(){
        if(!$(this).parent().parent().is('.tnull'))
            $(this).parent().parent().toggleClass('topen');
        return false;
    });
    function lOpen(){
        var open = [];
        $('.topen').each(
            function(i){
                open.push($(this).attr('id'));
            }
        );
        return open;
    }

    function lTree(){
        var oo = lOpen();
        cas.ajaxer({
            'sendto':"mon/tree",
            method:'GET',
            'etc': {'open':oo},
            'andthen':
                function(x){
                    $('.tree_label').html(x.data.label);
                    $('.troot').empty();
                    $('.troot').html(
                    "<li class='tnode"+((x.data.total > 0)?' topen':' tnull')+"' id='sim' name='SIM'>"+
                        "<div class='thenode'  title='"+'SIM'+' - Reclamações TV: '+x.data.x.tv+', Reclamações CM: '+x.data.x.cm+"'>"+
                            "<span class='nodeico'>&zwnj;</span>"+
                            "<span class='nodescr'>["+x.data.total+"] SIM</span>"+
                            "<span class='mbtwrapper'>"+
                                ((cas.checkPerms('e'))
                                    ?"<a target='_blank' href='eventos' class='onw' title='Abrir Controle de Eventos'></a>"
                                    :''
                                )+
                            "</span>"+
                        "</div>"+
                    "</li>");
                    
                    $('#sim').append(gTree(x.data.areas,x.etc.open));
                    $('.talert').each(function(){
                        var me = $(this);
                        if(me.parent().attr('level') === 'node'){
                            var t = me.parent().parent();
                            if(!t.is('.talert')){
                                t.addClass('tsubalert');
                            }
                        }
                    });
                    if(!$('.tselected').length){
                        $('#sim>.thenode').trigger('click');
                    }
                    selectView();
                    rszThem();
                }
        });
    }
    function loadRP(){
        if(nselected)
            cas.ajaxer({
                'sendto':"mon/node_os_s",
                method:'GET',
                'sendme': {'node':nselected,filter:true},
                'andthen':
                    function(x){
                        mountRP(x.data.base);
                        gTB(x.data,'rptb');
                    }
            });
        else
            hideRP();
    }
    function loadCepView(){
        hideRP();
        cas.ajaxer({
            'sendto':"mon/cep_os_s",
            method:'GET',
            'sendme': {'cep':tselected[0]},
            'andthen':
                function(x){
                    gTB(x.data,'crit_view');
                }
        });
    }
    function loadNodeView(){
        hideRP();
        cas.ajaxer({
            'sendto':"mon/node_os_s",
            method:'GET',
            'sendme': {'node':tselected[0],filter:false},
            'andthen':
                function(x){
                    gTB(x.data,'crit_view');
                }
        });
    }
    
    function gTB(t,c){
        
        var doTB = function(){
            var data = new google.visualization.DataTable();
            for(var i in t.cols){
                data.addColumn(t.cols[i].type, t.cols[i].title);
            }
            data.addRows(t.rows);
            var table = new google.visualization.Table(document.getElementById(c));
            table.draw(data, {showRowNumber: false,allowHtml: true});
        };
        if(google && google.visualization && google.visualization.DataTable){
            doTB();
        }else{
            googleTbLoad(doTB);
        }
    }
    function openPath(me){
        if(!me.length)
            return false;
        if(me.is('.tnode')){
            me.addClass('topen');
        }
        if(!me.is('#sim')){
            openPath(me.parent());
        }
    }
    function selectView(){
        setUpClock();
        if(tselected.length > 1){
            crit_load();
        }else{
            var me = $('#'+tselected[0]);
            var lvl = me.parent().attr('level');
            if(lvl === 'sim' || lvl === 'area'){
                crit_load();
            }else if(lvl === 'node'){
                loadNodeView();
                openPath(me.parent());
            }else if(lvl === 'cep'){
                loadCepView();
                openPath(me.parent());
            }
        }
    }
    function crit_load(){
        cas.ajaxer({
            sendto:"mon/crit_nodes",
            method:'GET',
            sendme:{'area':tselected/*,date:$('#tdate').val()*/},
            andthen:_crit_load
        });
    }
    function _crit_load(x){
        var nodes = {crit:[],warn:[]};
        var kkk = 0,sla,threshold,slot,thenode,my_sla;
        $('#crit_view').empty();
        
        for(var n in x.data.nodes){
            kkk = 0;
            thenode = {
                id:x.data.nodes[n].node,
                per:x.data.nodes[n].per,
                abbr:x.data.nodes[n].abbr,
                pe:x.data.nodes[n].pe,
                ag:x.data.nodes[n].ag,
                cssClass: [],
                corp:x.data.nodes[n].corp,
                glow:false
            };
            
            if(x.data.nodes[n].node === nselected)
                thenode.cssClass.push('selected_node');
            
            sla = 'node_warn_sla';
            threshold = 'node_warn';
            slot = 'warn';

            if(x.data.nodes[n].critz){
                sla = 'node_crit_sla';
                threshold = 'node_crit';
                slot = 'crit';
            }

            if(x.data.nodes[n].corp){
                thenode.cssClass.push('icorp');
            }else if(x.data.nodes[n].ri){
                thenode.cssClass.push('iri');
            }else if(x.data.nodes[n].agz){
                thenode.cssClass.push('iagz');
            }else{
                thenode.cssClass.push('i'+slot);
            }

            //    Escolhe qual OS será utilizada para o cálculo do SLA
            //    caso exista mais ordens que o threshold selecionado (crit ou warn)
            //    pega a ordem que gerou o alarme, caso contrário seleciona a última
             
            if(x.data.nodes[n].times.length < x.data.nodes[n][threshold])
                kkk = x.data.nodes[n].times.length - 1;
            else
                kkk = x.data.nodes[n][threshold] - 1;
            
            thenode.diff = (x.data.timestamp - x.data.nodes[n].times[kkk]);
            
            //    Verifica se SLA foi ultrapassado
            my_sla = (1000 * 60 * x.data[sla]);
            if(thenode.diff > my_sla)
                thenode.glow = true;
            nodes[slot].push(thenode);
        }
        
        sortNodes(nodes);
        appendNodes(nodes);
        
        
        //    se node selecionado não existir, oculta tabela
        if( !$('.selected_node').length )
            hideRP();
        
        //    coleta nomes das cidades selecionadas
        var nms = [];
        for(var i in tselected)
            nms.push($('#'+tselected[i]).attr('name'));
        
        // atualiza contador
        $('#crit_count').html(nms.join(', ')+": "+nodes.crit.length+" nodes críticos (Geral: "+x.data.nodes.length+")");
        rszThem();
    }
    function appendNodes(nodes){
        for (var k in nodes){
            for(var i in nodes[k]){
                var n = 
                $("<div class='mon_item-wrapper'>"+
                    "<div class='mon_item "+nodes[k][i].cssClass.join(' ')+"' node='"+nodes[k][i].id+"' per='"+nodes[k][i].per+"'>"+
                        "<div class='item_tt'>"+
                            "<span class='itiming'>"+
                                cas.strpad(Math.floor(nodes[k][i].diff / (1000 * 60 * 60) ),'0',2,true)
                                +"h:"
                                +cas.strpad(
                                    Math.floor(
                                        Math.abs(nodes[k][i].diff)
                                        % (1000*60*60) / (1000 * 60))
                                    ,'0',2,true
                                )
                                +"m"
                            +"</span>"+
                            "<span class='iarea'>"+nodes[k][i].abbr+"</span>"+
                        "</div>"+
                        "<div class='item_name'>"+
                            nodes[k][i].id+
                        "</div>"+
                        "<div class='item_vals'>"+
                            "<span class='ival' style='left:3px;'>PE: "+nodes[k][i].pe+"</span>"+
                            "<span class='idivisor'></span>"+
                            "<span class='ival' style='left:65px;'>AG: "+nodes[k][i].ag+"</span>"+
                        "</div>"+
                    "</div>"+
                "</div>")
                    .appendTo('#crit_view')
                    .children('.mon_item')
                    .click(critNodeClick);
        
                if(nodes[k][i].glow)
                    n.attr('title','Fora do SLA.')
                        .addClass('wayTooOld')
                        .hover(hoverGlowIn, hoverGlowOut);
                    
            }
        }
    }
    function sortNodes(nodes){
        // ordena as listas de nodes individualmente
        var slots = ['crit','warn'],slot,n;
        for(n in slots){
            slot = slots[n];
            nodes[slot].sort(function(a,b){
                if(a.diff > b.diff){
                    return -1;
                }else if(a.diff < b.diff){
                    return 1;
                }else{
                    if(a.pe + a.ag > b.pe + b.ag){
                        return -1;
                    }else if(a.pe + a.ag < b.pe + b.ag){
                        return 1;
                    }else{
                        return 0;
                    }
                }
            });
        }
    }
    function critNodeClick(){
        if(!$('#right_window').is(':visible')){
            $('.mon_item').removeClass('selected_node');
            $(this).toggleClass('selected_node');
            nselected = $(this).attr('node');
            showRP();
            loadRP();
        }else{
            if($('.selected_node').attr('node') === $(this).attr('node')){
                hideRP();
            }else{
                $('.mon_item').removeClass('selected_node');
                $(this).toggleClass('selected_node');
                nselected = $(this).attr('node');
                loadRP();
            }
        }
    }
    
    function hoverGlowIn(){
        $(this).removeClass('wayTooOld');
    }
    function hoverGlowOut(){
        $(this).addClass('wayTooOld');
    }
    $('#tup').click(function(){
        lTree();
    });
    
    function rszThem(){
        if(!isMobile){
            $('#content').height(
                $(window).height()
                - ($('#head-wrapper').outerHeight()
                    + $('#foot').outerHeight()
                )
            );
            if($('#left').is(':visible')){
                $('#mover').css('left',$('#left').outerWidth());
                $('#right').width( $('#content').width() - 
                        ($('#mover').offset().left + 
                            $('#mover').outerWidth()) );
            }else{
                $('#mover').css('left',0);
                $('#right').width( ( $('#content').width() 
                        - $('#mover').outerWidth()) );
            }
        }
    }
    $('#mover').click(function(){
        if($('#left').is(':visible')){
            $('#left').hide();
            rszThem();
        }else{
            $('#left').show();
            rszThem();
        }
    });
    $('#content').show();
    function schedule(){
        lTree();
        clearInterval(thread_crit);
        thread_crit = setInterval(lTree,1000 * up_time);
    }
    function mountRP(base){
        $('#right_window').html(
            "<div id='rw_bar'>"+
                ((cas.checkPerms('e'))
                    ?"<a href='eventos#"+cas.hashbangify({filter:{l:[nselected]}})+"' target='_blank' style='font-weight:bold;"+
                            "margin-left:5px;font-size:10pt;text-decoration: underline;'>"+nselected+"</a>"
                    :'<span style="font-weight:bold;margin-left:5px;font-size:10pt;">'+nselected+'</span>'
                )+((base)?"<span style='margin-left:10px;font-style:italic'>"+
                        "Número de assinantes: "+base.c+", CM: "+base.cm+
                            ', TV: '+base.tv+"</span>":'')+
                "<span style='position:absolute;right:0;top:0;padding-top:1px;height:100%;'>"+
                        "<img id='zoom_me' src='lib/img/maximize.png' style='"+
                            "padding:2px 0 0 0;cursor:pointer;'/>"+
                        "<img id='rpclose' src='lib/img/minimize.png' style='padding:2px "+
                            "2px 0 0;cursor:pointer;'/>"+
                "</span>"+
            "</div>"+
            "<div id='rptb'></div>");

        $('#zoom_me').click(function(){
            $('#crit_view').hide();
            $('#right_window').height('100%');
        });
        $('#rpclose').click(hideRP);
    }
    setInterval(rszThem,1000);
    function showRP(){
        if(!$('#right_window').length){
            $('#right').append("<div id='right_window'></div>");
        }
        if(!isMobile){
            $('#crit_view').height('60%');
            $('#right_window').show().height('40%')
                .niceScroll({horizrailenabled:false});
        }
        
        rszThem();
        mountRP();
    }
    function hideRP(){
        $('.mon_item').removeClass('selected_node');
        if($('#right_window').length){
            $('#right_window').hide();
            $('#crit_view').show().height('100%');
            rszThem();
        }
        nselected = false;
    }
    $('#foot').append("<div id='monclock'></div>");
    function setUpClock(){
        uptime = 0;
        var tmp;
        tmp = $('<div>').addClass('grey clock').html(
                '<div class="display"></div>'+
                '<div class="front left"></div>'+
                '<div class="rotate left">'+
                        '<div class="bg left"></div>'+
                '</div>'+
                '<div class="rotate right">'+
                        '<div class="bg right"></div>'+
                '</div>'
        );
        $('#monclock').html(tmp);
        tmp.rotateLeft = tmp.find('.rotate.left');
        tmp.rotateRight = tmp.find('.rotate.right');
        tmp.display = tmp.find('.display');
        myclock = tmp;
        clearInterval(clocker);
        clocker = setInterval(function(){
            animation(myclock, uptime, up_time);
            if(uptime < (up_time - 1))
                uptime++;
            else{
                uptime = 0;
            }
        },1000);
    }
    function animation(clock, current, total){
    var angle = (360/total)*(current+1);
        var element;
        if(current == 0){
            clock.rotateRight.hide();
            rotateElement(clock.rotateLeft,0);
        }
        if(angle<=180){
            element = clock.rotateLeft;
        }else{
            clock.rotateRight.show();
            clock.rotateLeft.show();
            rotateElement(clock.rotateLeft,180);
            element = clock.rotateRight;
            angle = angle-180;
        }
        rotateElement(element,angle);
        clock.display.html(current<10?'0'+current:current);
    }
    function rotateElement(element,angle){
        var rotate = 'rotate('+angle+'deg)';
        if(typeof element.css('MozTransform') !== 'undefined')
            element.css('MozTransform',rotate);
        else if(typeof element.css('WebkitTransform') !== 'undefined')
            element.css('WebkitTransform',rotate);
        else if(typeof element.css("filter") !== 'undefined'){
            var cos = Math.cos(Math.PI * 2 / 360 * angle);
            var sin = Math.sin(Math.PI * 2 / 360 * angle);
            element.css("filter","progid:DXImageTransform.Microsoft.Matrix(M11="+cos+",M12=-"+sin+",M21="+
                    sin+",M22="+cos+",SizingMethod='auto expand',FilterType='nearest neighbor')");
            element.css("left",-Math.floor((element.width()-200)/2));
            element.css("top",-Math.floor((element.height()-200)/2));
        }
    }
    var legshowing = false,
        stdLegPos = function(){
            return (0 -($('#color_legend').width() - $('#clicktoshow').width()));
        };
    $('#color_legend').css('right',stdLegPos());
    $('#clicktoshow').click(function(){
        if(legshowing)
            $('#color_legend').animate({right: stdLegPos()},400);
        else
            $('#color_legend').animate({right:0},400);
        
        legshowing = !legshowing;
    });
    rszThem();
    cas.resizer.push(rszThem);
    schedule();
};
function googleTbLoad(callback){
    google.load('visualization', '1', {packages:['table'],callback:callback});
}