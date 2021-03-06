cas.controller = function(){
    var pers = {},
        per,
        container = $('#container'),
        tp = $('<div id="type_container">').appendTo('#right'),
        okper = [],stselector,open,action,adm,T = {},pendingInterval,pending,returned;
    
    function split( val ) {
      return val.split( /,\s*/ );
    }
    function resizer(){
        container.height(
            $(window).height()
            - ($('#head-wrapper').outerHeight() + $('#foot').outerHeight())
            - $('#topbar').outerHeight()
        );
        $('#actualstuff').height(container.height() - $('#topbar').outerHeight());
    }
    function boot(){
        open = ((cas.args.almox_open)?cas.args.almox_open:[]);
        action = cas.checkPerms('t');
        adm = cas.checkPerms('x');
        $('#almox_item_action').empty();
        
        if(!action)
            $('#new_almox_type').remove();
        cas.ajaxer({
            method:'GET',
            sendto:'almox/pers',
            andthen:function(x){
                pers = {};
                per = null;
                okper = [];
                
                $('#nat_group').empty();
                for(var i in x.data.groups)
                    $('#nat_group').append("<option value='"+x.data.groups[i].id+"'>"+x.data.groups[i].name+"</option>");
                
                
                stselector = $('<select id="stselector">');
                for(var i in x.data.st){
                    var o = "<option value='"+x.data.st[i].id+"'>"+x.data.st[i].name+"</option>";
                    if(parseInt(x.data.st[i].id) !== 2)
                        stselector.append(o);
                    
                    
                }
                if(action){
                    var k = $('#almox_item_action').html(
                        "<button id='almox_item_save'>Salvar status</button>"+
                        "<button id='almox_item_deprecated'>Consumir</button>"+
                        ((adm)?"<button id='almox_item_kill'>Remover definitivamente</button>":''));
                    
                    $('#almox_item_kill').click(aiKill);
                    $('#almox_item_save').click(aiSave);
                    $('#almox_item_deprecated').click(aiDeprecate);
                    
                    stselector.prependTo('#almox_item_action');
                    
                }
                if(x.data.per.length <= 0)
                    return bye();
                
                $('#per').empty();
                for(var i in x.data.per){
                    x.data.per[i].id = parseInt(x.data.per[i].id);
                    pers[x.data.per[i].id] = x.data.per[i];
                    if(x.data.per[i].canedit)
                        okper.push(x.data.per[i].abbr);
                    $("<option value='"+x.data.per[i].id+"'>"+x.data.per[i].name+' ['+x.data.per[i].id+']</option>').appendTo('#per');
                }
                
                var p = ((cas.args.almox_per)?cas.args.almox_per:cas.get_pref('per'));
                if(p)
                    $('#per').val(p);
                
                $('#per').trigger('change');
                clearInterval(pendingInterval);
                pendingInterval = setInterval(loadPending,1000 * 60);
            }
        });
    }
    function loadPending(){
        cas.ajaxer({
            method:'GET',
            sendme:{
                per:per
            },sendto:'almox/pending_ack',
            andthen:function(x){
                pending = ((x.data.pending)?x.data.pending:[]);
                returned = ((x.data.returned)?x.data.returned:[]);
                var c = pending.length + returned.length;
                if(c > 0)
                    $('#pending_bt').html(c+' pendência'+((c>1)?'s':'')).show();
                else
                    $('#pending_bt').hide();
                populatePending();
            }
        });
    }
    function AIDS_P(){
        var ids = [];
        $('.selectme.pselected').each(function(){
            ids.push({
                id:$(this).attr('data-id'),
                ref:$(this).attr('data-ref')
            });
        });
        return ids;
    }
    function populatePending(){
        $('#pending_list,#returned_list').empty();
        var x,y,z;
        
        for(var i in pending){
            x = $('#p_tec_'+pending[i].tec);
            if(!x.length)
                x = $("<li id='p_tec_"+pending[i].tec+"' class='p_list_item'>"+
                        "<div class='p_list_item_name'>"+pending[i].tec_name.toUpperCase()+"</div>"+
                        "<ul class='p_list'></ul>"+
                    "</li>").appendTo('#pending_list');
            
            y = $("#p_tec_"+pending[i].tec+"-type_"+pending[i].almox_type);
            if(!y.length)
                y = $("<li id='p_tec_"+pending[i].tec+"-type_"+pending[i].almox_type+"' class='p_list_item'>"+
                        "<div class='p_list_item_name'>"+pending[i].almox_type_name+"</div>"+
                        "<ul class='p_list p_l_list'></ul>"+
                    '</li>').appendTo(x.children('.p_list'));
            
            y.find('.p_list').append(
                    "<li class='p_item'>"+                        
                        "<table class='almox_item_tb'>"+
                            "<tbody>"+
                                "<tr>"+
                                    '<td data-ref="pending" '+
                                        'data-id="'+
                                            Base64.encode(
                                                JSON.stringify(
                                                    {
                                                        almox_item: pending[i].id,
                                                        almox_item_status: pending[i].almox_item_status,
                                                        new_status: pending[i].new_status,
                                                        previous_status: pending[i].previous_status
                                                    }
                                                )
                                            )+'" '+
                                    'class="selectme"></td>'+
                                    "<td data-id="+pending[i].id+" class='destac_cell almox_item_id'>"+pending[i].id+"</td>"+
                                    "<td class='almox_item_name'>"+defStr(pending[i].name)+"</td>"+
                                    "<td class='almox_item_status' colspan=2>"+pending[i].new_status_name+"</td>"+
                                "</tr>"+
                            "</tbody>"+
                        "</table>"+
                    "</li>");
        }
        
        for(var i in returned){
            x = $('#r_tec_'+returned[i].tec);
            if(!x.length)
                x = $("<li id='r_tec_"+returned[i].tec+"' class='p_list_item'>"+
                        "<div class='p_list_item_name'>"+returned[i].tec_name.toUpperCase()+"</div>"+
                        "<ul class='p_list'></ul>"+
                    "</li>").appendTo('#returned_list');
            
            y = $("#r_tec_"+returned[i].tec+"-type_"+returned[i].almox_type);
            if(!y.length)
                y = $("<li id='r_tec_"+returned[i].tec+"-type_"+returned[i].almox_type+"' class='p_list_item'>"+
                        "<div class='p_list_item_name'>"+returned[i].almox_type_name+"</div>"+
                        "<ul class='p_list p_l_list'></ul>"+
                    '</li>').appendTo(x.children('.p_list'));
            
            y.find('.p_list').append(
                    "<li class='p_item'>"+                        
                        "<table class='almox_item_tb'>"+
                            "<tbody>"+
                                "<tr>"+
                                    '<td data-ref="returned" '+
                                        'data-id="'+
                                            Base64.encode(
                                                JSON.stringify(
                                                    {
                                                        almox_item_tec: returned[i].almox_item_tec,
                                                        almox_item_return: returned[i].almox_item_return
                                                    }
                                                )
                                            )+'" '+
                                    'class="selectme"></td>'+
                                    "<td data-id="+returned[i].id+" class='destac_cell almox_item_id'>"+returned[i].id+"</td>"+
                                    "<td class='almox_item_name'>"+defStr(returned[i].name)+"</td>"+
                                    "<td class='almox_item_status' colspan=2>"+returned[i].tec_time+"</td>"+
                                "</tr>"+
                            "</tbody>"+
                        "</table>"+
                    "</li>");
        }
        trigEmAll();
    }
    function trigEmAll(){
        $('#p_list_wrap').find('.p_list_item_name').click(function(){
            $(this).next('.p_list').find('.selectme').toggleClass('pselected');
        });
        $('#p_list_wrap').find('.selectme').click(function(){
            $(this).toggleClass('pselected');
        });
        $('#p_list_wrap').find('.almox_item_id').click(loadHist);
    }
    function postAck(p){
        cas.ajaxer({
            sendme:{
                id:AIDS_P(),
                action:p
            },sendto:'almox/post_ack',
            andthen:loadPending
        });
    }
    function loadGroups(){
        cas.ajaxer({
            method:'GET',
            sendto:'almox/almox_group',
            andthen:_loadGroups
        });
    }
    function _loadGroups(x){
        tp.empty();
        for(var i in x.data.group){
            x.data.group[i].id = parseInt(x.data.group[i].id);
            var z = 
                $("<div class='wrapall almox_group' data-id='"+x.data.group[i].id+"'>"+
                    "<h5 class='almox_group_header'>"+
                            ((action)
                                ?"<input type='text' value='"+x.data.group[i].name+"'"+
                                        " data-id='"+x.data.group[i].id+"'"+
                                        " title='Tecle enter para salvar novo nome'"+
                                        "class='atn d_name ag_name'/>"+
                                ((adm)?"<span title='Remover Grupo' data-id='"+x.data.group[i].id+"' class='imbt agkill'>&zwnj;</span>":'')
                                :"<span>"+x.data.group[i].name+"</span>"

                            )+

                    "</h5>"+
                    "<div class='wrapall almox_group_content' style='display:none;'></div>"+
                "</div>").appendTo(tp);
            if(action){
                
                z.find('.ag_name')
                    .change(function(){
                        $(this).addClass('ag_changed');
                    }).keydown(function(e){
                        if(e.keyCode === 13)
                            agSave.call(this);
                    });
                    
                z.find('.agkill').click(agKill);
            }
            T[x.data.group[i].id] = {
                id: x.data.group[i].id,
                name: x.data.group[i].name,
                children:{}
            };
        }
        if(action)
            $('.almox_group').droppable({
                accept:'.almox_type',
                hoverClass:'floatHover',
                drop:dropOnMe
            });
        loadTypes();
    }
    function loadTypes(){
        cas.ajaxer({
            method:'GET',
            sendto:'almox/almox_type',
            sendme:{
                per:per
            },
            andthen:_loadTypes
        });
    }
    function _todayYMD(){
        return cas.strpad(window.svrtime.getFullYear(),'0',2,true) + "-" + cas.strpad(window.svrtime.getMonth() + 1,'0',2,true) + "-" + cas.strpad(window.svrtime.getDate(),'0',2,true);
    }
    function _loadTypes(x){
        var z;
        var group;
        for(var i in x.data.type){
            x.data.type[i].id = parseInt(x.data.type[i].id);
            x.data.type[i].almox_group = parseInt(x.data.type[i].almox_group);
            
            T[x.data.type[i].almox_group].children[x.data.type[i].id] = {
                id: x.data.type[i].id,
                name: x.data.type[i].name,
                children:{}
            };
            
            group = $('.almox_group[data-id="'+x.data.type[i].almox_group+'"]').find('.almox_group_content');
            z = 
            $("<div class='almox_type"+
                    ((action)?' yours':' not-yours')+
                    "' data-id='"+x.data.type[i].id+"'>")
                .append(
                    "<table class='at_tb'"+
                        "data-id='"+x.data.type[i].id+"' "+
                        ">"+
                        "<tr class='at_header'>"+
                            "<td class='destac_cell at_more level_toggler' "+
                                "parent-id='g_"+x.data.type[i].almox_group+"' "+
                                "id='t_"+x.data.type[i].id+"' "+
                                "data-id='"+x.data.type[i].id+"' "+
                                ">"+x.data.type[i].c+"</td>"+
                            "<td class='at_cod'>"+((x.data.type[i].cod)?x.data.type[i].cod:'')+"</td>"+
                            "<td class='at_name'>"+
                                ((action)
                                    ?"<input type='text' class='atn d_name' title='Tecle enter para salvar novo nome'value='"+x.data.type[i].name+"' data-id='"+x.data.type[i].id+"'/>"
                                    :"<span>"+x.data.type[i].name+"</span>"
                                )+
                            "</td>"+
                            "<td class='at_act'>"+
                                ((action && adm)?
                                    "<span title='Remover tipo' data-id='"+x.data.type[i].id+"' class='imbt atkill'>&zwnj;</span>"
                                :'')+
                            "</td>"+
                        "</tr>"+
                    "</table>"+
                    "<div class='wrapall themstuff' data-id='"+x.data.type[i].id+"' style='display:none;'>"+

                        ((action)
                            ?"<div class='wrapall new_almox_item'>"+
                                "<input class='atn ai_multi' type='number' min='1' max='100' value='1' />"+
                                "<input class='atn ai_day' type='date' value='"+_todayYMD()+"' max='"+_todayYMD()+"'/>"+
                                "<input class='atn ai_name' type='text' placeholder='Serial/ID/Descrição/Nome'/>"+
                                "<input class='atn ai_per' type='text' placeholder='Permissores associados' value='"+
                                    ((cas.get_pref('almox_perlist'))
                                        ?cas.get_pref('almox_perlist')
                                        :pers[per].abbr
                                    )+
                                "'/>"+
                                "<button data-id='"+x.data.type[i].id+"' class='ai_save'>Salvar</button>"+
                            "</div>"
                            :'')+
                        "<div class='control_line' data-id='"+x.data.type[i].id+"'>"+
                            "<span class='d1'>"+
                                "<input class='atn select_multi' min=1 max=100 type='number' value=1 />"+
                                "<button class='autoselect' data-type='"+x.data.type[i].id+"' data-group='"+x.data.type[i].almox_group+"'>Selecionar</button>"+
                            "</span>"+
                            "<button class='deprecatedToggle'>+</button>"+
                            "<button class='deprecatedToggle' style='display:none;'>-</button>"+
                        "</div>"+
                    "</div>"
                ).appendTo(group);
            if(!checkInput('date')){
                datePolyfill(z);
            }
            if(action)
                z.draggable({
                    handle:'.at_tb',
                    zIndex:5,
                    delay:300,
                    axis:'y',
                    revert:'invalid',
                    start:function(event,ui){
                        ui.helper.addClass('floating');
                    },
                    stop:function(event,ui){
                        ui.helper.removeClass('floating');
                    }
                });
            z.find('.autoselect').click(autoSelect);
            z.find('.at_name>.atn').keydown(atName);
            z.find('.ai_name').keydown(function(e){
                if(e.keyCode === 13)
                    $(this).parent().children('.ai_save').trigger('click');
            });
            z.find('.ai_save').click(naiSave);

            z.find('.ai_per')
                .bind( "keydown", function( event ) {
                    if ( event.keyCode === $.ui.keyCode.TAB &&
                        $( this ).data( "ui-autocomplete" ).menu.active ) {
                      event.preventDefault();
                    }
                })
                .autocomplete({
                minLength: 0,
                    source: function( request, response ) {
                        var x = split(request.term);
                        var t = x.pop(),z = [];
                        for(var i in okper)
                            if( x.indexOf(okper[i]) === -1 )
                                z.push(okper[i]);
                        response($.ui.autocomplete.filter(z,t));
                    },
                    focus: function() {
                      return false;
                    },
                    select: function( event, ui ) {
                      var terms = split( this.value );
                      terms.pop();
                      terms.push(ui.item.value);
                      terms.push("");
                      this.value = terms.join(", ");
                      return false;
                    }
                });
            z.find('.at_more').click(atOpen);
            z.find('.deprecatedToggle').click(atOpenAll);
            if(action)
                z.find('.atkill').click(atKill);
        }
        tp.find('.almox_group').each(function(){
            var gID = $(this).attr('data-id');
            var counter = 0;
            $(this).find('.at_more').each(function(){
                counter += parseInt($(this).html());
            });
            $("<span class='destac_cell inline_destac level_toggler'"+
                    "id='g_"+gID+"'"+
                    "data-id='"+gID+"'>"+counter+"</span>")
                .click(groupOpen).prependTo($(this).find('.almox_group_header'));
        });
        loopMe(tp);
    }
    function groupOpen(){
        var h = $(this).parent().next('.almox_group_content');
        if(h.is(':empty'))
            h.append("<div class='empty_placeholder'>Grupo vazio</div>")
        h.toggle();
    }
    function dropOnMe(event,ui){
        cas.ajaxer({
            sendto:'almox/almox_type_move',
            sendme:{
                group:$(this).attr('data-id'),
                type:ui.draggable.attr('data-id')
            },
            andthen:loadPer
        });
    }
    
    function loopMe(x){
        x.find('.level_toggler').each(function(){
            var id = $(this).attr('id');
            if(cas.inArray(id,open)){
                $(this).trigger('click');
            }
        });
    }
    function autoSelect(){
        var n = $(this).prev('.select_multi').val(), 
            g = parseInt($(this).attr('data-group')),
            t = parseInt($(this).attr('data-type')),
            c = 0, d;
        for(d in T[g].children[t].children){
            c += _autoSelect(T[g].children[t].children[d].children, (n - c) );
            if(c >= n)
                break;
        }
    }
    function _autoSelect(l,n){
        var i, x, y, p, c = 0;
        for(i in l){
            
            if(c >= n)
                break;
            
            x = $('#i_'+i);
            
            if(x.length > 0){
                p = $('#'+x.attr('parent-id'));
                if(p.length > 0)
                    openUp(p);
                y = x.prev('.selectme');
                x.effect('highlight');
                if(!y.is('.selected'))
                    y.trigger('click');
                
                c++;
            }
        }
        return c;
    }
    function loadItems(t,deprecated,id){
        if(!deprecated)
            deprecated = null;
        cas.ajaxer({
            method:'GET',
            sendto:'almox/almox_item',
            etc:{
                t:t,id:id
            },
            sendme:{
                per:per,
                type:t,
                all:deprecated,
                id:id
            },andthen:_loadItems
        });
    }
    function defStr(x){
        return ((x)?x:'----');
    }
    function _loadItems(x){
        
        var t = x.etc.t;
        var l = null, j = $('.themstuff[data-id="'+t+'"]'), w = null, z;
        
        if(j.length > 0){
            
            if(!j.is(':visible'))
                j.show();
            
            j.find('.item_group').remove();
            for(var i in x.data.item){
                
                x.data.item[i].almox_type = parseInt(x.data.item[i].almox_type);
                x.data.item[i].dd = parseInt(x.data.item[i].dd);
                x.data.item[i].id = parseInt(x.data.item[i].id);
                
                
                if(l === null || l !== x.data.item[i].dd){
                    z =
                        $("<div data-id='"+x.data.item[i].dd+"' class='item_group'>"+
                            "<h5 class='gtitle level_toggler' "+
                                "parent-id='t_"+t+"' "+
                                "id='d_"+x.data.item[i].dd+"' "+
                                "data-id='"+x.data.item[i].dd+"'>"+x.data.item[i].d+"</h5>"+
                            "<div class='wrapall group_container' style='display:none;'></div>"+
                        "</div>").appendTo(j);
                    z.find('h5').click(function(){
                        $(this).next('.group_container').toggle();
                    });
                    w = z.find('.wrapall');
                    l = x.data.item[i].dd;
                    
                    T[x.data.item[i].almox_group]
                        .children[x.data.item[i].almox_type]
                        .children[x.data.item[i].dd] = 
                    {
                        id: x.data.item[i].dd,
                        name: x.data.item[i].d,
                        children:{}
                    };
                }
                
                T[x.data.item[i].almox_group]
                        .children[x.data.item[i].almox_type]
                        .children[x.data.item[i].dd]
                        .children[x.data.item[i].id] = 
                {
                    id: x.data.item[i].id,
                    name: x.data.item[i].name,
                    children:{}
                };
                
                var k = 
                    $("<div class='almox_item' "+
                        "data-id='"+x.data.item[i].id+"' "+
                        "data-type='"+x.data.item[i].almox_type+"'>")
                    .append(
                        "<table class='almox_item_tb"+((parseInt(x.data.item[i].status) === 2)?' deprecatedai':'')+"'>"+
                            "<tr>"+
                                "<td data-id='"+x.data.item[i].id+"' class='selectme'></td>"+
                                "<td class='destac_cell level_toggler almox_item_id' "+
                                    "parent-id='d_"+x.data.item[i].dd+"' "+
                                    "id='i_"+x.data.item[i].id+"' "+
                                    "data-id='"+x.data.item[i].id+"' "+
                                    ">"+x.data.item[i].id+"</td>"+
                                "<td class='almox_item_name' data-id='"+x.data.item[i].id+"' >"+
                                    defStr(x.data.item[i].name)+
                                "</td>"+
                                "<td class='almox_item_status' colspan=2>"+x.data.item[i].stname+"</td>"+
                            "</tr>"+
                        "</table>"
                    ).appendTo(w);
                
                k.find('.almox_item_id').click(loadHist);
                k.find('.selectme').click(aiSelect);
            }
            if(j.is(':empty')){
                j.append('<div class="item_group empty_placeholder">Tipo vazio</div>');
            }
            j.find('.item_group').each(function(){
                $(this).find('h5').prepend(
                    "<span class='destac_cell inline_destac'>"+$(this).find('.almox_item').length+"</span>");
            });
            loopMe(j);
        }
        if(x.etc.id && $('#i_'+x.etc.id).length > 0){
            srcResult($('#i_'+x.etc.id));
            $('#right').animate({
                scrollTop:$('#right').scrollTop() 
                            + ($('#i_'+x.etc.id).offset().top - $('#right').offset().top - 30)
            });
        }
    }
    function srcResult(x){
        x.addClass('searchResult').one('mouseenter',function(){$(this).removeClass('searchResult')});
    }
    function loadHist(){
        var id = parseInt($(this).attr('data-id'));
        var me = $(this);
        var there = 
            me.closest('tbody'),
            others = there.find('.hist');
        if(others.length > 0)
            others.remove();
        else{
            cas.ajaxer({
                method:'GET',
                sendme:{
                    id:id
                },
                etc:{
                    there:there
                },
                sendto:'almox/almox_item_hist',
                andthen:_loadHist
            });
        }
    }
    function _loadHist(x){
        if( $.contains(document.documentElement, x.etc.there[0]) ){
            if(x.data.hist.length > 0)
                for(var i in x.data.hist){
                    var u = x.data.hist[i].user.split('@'), uu = u.join(' @');
                    x.etc.there.append(
                        "<tr class='hist "+((i%2 === 0)?'even':'odd')+"'>"+
                            "<td class='almox_date' colspan=2>"+x.data.hist[i].date+"</td>"+
                            "<td class='almox_obs'>"+((x.data.hist[i].obs)?x.data.hist[i].obs:'---')+"</td>"+
                            "<td class='almox_status'>"+
                                x.data.hist[i].status+
                                    ((x.data.hist[i].n_status)
                                        ?" >> "+x.data.hist[i].n_status:'')+
                            "</td>"+
                            "<td class='almox_item_creator'>"+uu+"</td>"+
                        "</tr>"
                    );
                }
            else{
                x.etc.there.append(
                    "<tr class='hist'>"+
                        "<td class='empty_placeholder' colspan=5>Nenhuma mudança de status</td>"+
                    "</tr>"
                );
            }
        }
    }
    var sCount;
    function aiSelect(){
        $(this).toggleClass('selected');
        if($(this).is('.selected'))
            sCount++;
        else
            sCount--;
        if(sCount > 0)
            $('#almox_item_action').fadeIn();
        else
            $('#almox_item_action').hide();
    }
    
    function AIDS(){
        var ids = [];
        $('.selectme.selected').each(function(){
            ids.push(parseInt($(this).attr('data-id')));
        });
        return ids;
    }
    function aiSave(){
        var id = AIDS();
        var st = $('#stselector').val();
        _aiSave(id,st);
    }
    function aiDeprecate(){
        var id = AIDS();
        _aiSave(id,2);
    }
    function aiKill(){
        var id = AIDS();
        cas.ajaxer({
            sendme:{
                id:id
            },
            sendto:'almox/almox_item_kill',
            andthen:loadPer
        });
    }
    function _aiSave(id,st){
        var obs = prompt("Deseja adicionar alguma observação?");
        if( obs === null || typeof obs === 'undefined' ){
            return;
        }
        cas.ajaxer({
            sendme:{
                id: id,
                status: st,
                obs: obs
            },
            sendto:'almox/almox_item_save',
            andthen:loadPer
        });
    }
    function agSave(){
        var n = $(this);
        
        if(n.length > 0 && n.val()){
            var id = parseInt(n.attr('data-id'));
            cas.ajaxer({
                sendme:{
                    id:id,
                    name:n.val()
                },
                sendto:'almox/almox_group_save',
                andthen:boot
            });
        }else{
            alert('Por favor digite algum nome para o grupo.');
            n.effect('highlight');
        }
    }
    function atOpenAll(){
        var me = $(this).parent();
        var id = parseInt(me.attr('data-id'));
        me.toggleClass('showless');
        me.children('.deprecatedToggle').toggle();
        
        loadItems(id,me.is('.showless'));
    }
    function atOpen(){
        var 
            z = $(this).closest('.almox_type'), 
            y = z.find('.themstuff'), 
            id = parseInt(z.attr('data-id'));
        if(!y.is(':visible')){
            loadItems(id);
        }
        y.toggle();
    }
    function atKill(){
        if(confirm('Deseja REALMENTE remover este tipo?')){
            cas.ajaxer({
                method:'GET',
                sendme:{
                    id:$(this).attr('data-id')
                },
                sendto:'almox/almox_type_kill',
                andthen:loadPer
            });
        }
    }
    function agKill(){
        if(confirm('Deseja REALMENTE remover este grupo?')){
            cas.ajaxer({
                method:'GET',
                sendme:{
                    id:$(this).attr('data-id')
                },
                sendto:'almox/almox_group_kill',
                andthen:boot
            });
        }
    }
    function atName(e){
        if(e.keyCode === 13){
            var name = $(this).val().trim(),
                id = $(this).attr('data-id');
            if(name.length <= 0)
                return $(this).effect('highlight') && alert('Por favor, digite um nome para o tipo.');
            cas.ajaxer({
                sendme:{
                    id:id,
                    name:name
                },sendto:'almox/almox_type_name',
                andthen:loadPer
            });
        }
    }
    function naiSave(){
        var f = $(this).parent(), p = f.children('.ai_per').val();
        
        cas.set_pref('almox_perlist',p);
        cas.ajaxer({
            sendto:'almox/new_almox_item',
            sendme:{
                type: $(this).attr('data-id'),
                per:p,
                d:f.children('.ai_day').val(),
                name:f.children('.ai_name').val(),
                multi:parseInt(f.children('.ai_multi').val())
            },andthen:loadPer
        })
    }
    
    function natSave(){
        var x = 
            {
                name: $('#nat_name').val(),
                cod: $('#nat_cod').val(),
                almox_group:$('#nat_group').val()
            };
        if(!x.name || !x.almox_group)
            return $('#nat_name').parent().effect('highlight') && alert('Por favor, cheque os campos.');
        cas.ajaxer({
            sendme:x,
            sendto:'almox/new_almox_type',
            andthen: loadPer
        });
        
    }
    
    function loadTecs(){
        cas.ajaxer({
            sendto:'almox/tecs',
            sendme:{per:per},
            method:'GET',
            andthen:function(x){
                $('#tec_container').empty();
                var tecs = x.data.tecs;
                for(var i in tecs){
                    $("<div class='tec' tec-id='"+tecs[i].id+"'  id='tec_"+tecs[i].id+"'>")
                        .append("<h4  tec-id='"+tecs[i].id+"' class='tec_header'>"+tecs[i].name.toUpperCase()+'</h4>')
                        .append("<div class='tecslot'>")
                        .appendTo('#tec_container').find('.tec_header').click(tecClick);
                    tecMaterial(tecs[i].id);
                }
            }
        });
    }
    var this_tec;
    function tecClick(){
        if(sCount > 0){
            this_tec = $(this).attr('tec-id');
            $('#totecname').html($(this).html());
            $('#toteccount').html(sCount);
            cas.hidethis('#tec_container');
            cas.ajaxer({
                sendme:{item:AIDS(),tec:this_tec},
                sendto:'almox/tec_item_link',
                andthen:function(x){
                    cas.showthis('#tec_container');
                    loadPer();
                }
            });
        }else{
            $(this).next('.tecslot').toggle();
        }
        
    }
    function tecMaterial(i){
        cas.ajaxer({
            sendto:'almox/tec_item',
            sendme:{tec:i},
            etc:{
                tec:i
            },
            method:'GET',
            andthen:tecMaterial_
        });
    }
    function tecMaterial_(x){
        var item = x.data.item, t = null, lt = null;
        for(var i in item){
            if(t === null || lt !== item[i].almox_type){
                if(t !== null)
                    t.find('.almox_type_count').html(t.find('tbody>tr').length);
                t = 
                    $("<table class='tec_item_type' type-id='"+item[i].almox_type+"'>"+
                            "<thead>"+
                                "<tr>"+
                                    "<th class='almox_type_count'>"+item[i].almox_type+"</th>"+
                                    "<th class='almox_type_name'>"+defStr(item[i].almox_type_name)+"</th>"+
                                    "<th class='almox_type_rm'>"+
                                        "<button tec-id='"+item[i].tec+"' type-id='"+item[i].almox_type+"' class='tec_item_type_remove'>-</button>"+
                                    "</th>"+
                                "</tr>"+
                            "</thead>"+
                            "<tbody style='display:none'></tbody>"+
                        "</table>")
                    .appendTo('#tec_'+x.etc.tec+'>.tecslot');
                t.find('.tec_item_type_remove').click(unlinkType);
                t.find('thead').click(function(){
                    $(this).parent().find('tbody').toggle();
                });
                lt = item[i].almox_type;
            }
            $("<tr id='tec_item_"+item[i].almox_item+"''>"+
                '<td class=tec_item_id>'+item[i].almox_item+'</td>'+
                '<td class=tec_item_name>'+defStr(item[i].almox_item_name)+'</td>'+
                "<td>"+
                    "<button lease-id='"+item[i].lease_id+"' class='tec_item_remove'>-</button>"+
                "</td>"+
            '</tr>').appendTo(t.find('tbody'))
                .find('.tec_item_remove').click(unlinkItem);
            
        }
        if(t)
            t.find('.almox_type_count').html(t.find('tbody>tr').length);
    }
    function unlinkType(){
        cas.ajaxer({
            method:'GET',
            sendme:{
                tec:$(this).attr('tec-id'),
                type:$(this).attr('type-id')
            },sendto:'almox/tec_type_unlink',
            andthen:loadPer
        });
        $(this).parent().addClass('tec_loading');
        $(this).remove();
        return false;
    }
    function unlinkItem(){
        cas.ajaxer({
            method:'GET',
            sendme:{
                id:$(this).attr('lease-id')
            },sendto:'almox/tec_item_unlink',
            andthen:loadPer
        });
        $(this).parent().addClass('tec_loading');
        $(this).remove();
    }
    function loadPer(){
        if($('#almox_item_action').is(':visible'))
            $('#almox_item_action').hide();
        sCount = 0;
        $('#nat_name').val('');
        cas.set_pref('per',per);
        cas.args.almox_per = per;
        cas.pushArgs();
        if(!pers[per].canedit)
            $('#nat_name').prop('disabled',true);
        else
            $('#nat_name').prop('disabled',false);
        loadPending();
        loadTecs();
        loadGroups();
    }
    function bye(){
        alert('Seu usuário não está associado a nenhum permissor.');
        container.remove();
    }
    
    function toggleNode(me){
        
        var x = {id: me.attr('id'), parent: me.attr('parent-id')};
        me.toggleClass('level_open');
        
        if(!me.is('.level_open')){
            cas.kill(x.id,open);
            killBranch(x.id);
        }else{
            if(!cas.inArray(x.id,open))
                open.push(x.id);
        }
        
    }
    function openUp(x){
        if(!x.is('.level_open'))
            x.trigger('click');
        var p = x.attr('parent-id');
        if(p){
            openUp($('#'+p));
        }
    }
    function killBranch(id){
        $('.level_toggler[parent-id="'+id+'"]').each(function(){
            if($(this).is('.level_open'))
                $(this).trigger('click');
        });
    }
    $('#per').change(function(){
        per = parseInt($(this).val());
        loadPer();
    });
    
    $('#nat_save').click(natSave);
    $('#nat_group_add').click(function(){
        var n = prompt("Digite o nome para o novo grupo de equipamentos:");
        if(n){
            cas.ajaxer({
                sendto:'almox/new_almox_group',
                sendme:{name:n},
                andthen:boot
            });
        }else{
            return alert('Nome inválido.');
        }
    });
    $('#right').on('click','.level_toggler',function(){
        toggleNode($(this));
        cas.args.almox_open = open;
        cas.pushArgs();
    });
    $('#container').tooltip();
    $('#page_refresh').click(boot);
    $('#relats').click(function(){
        if(!per)
            return;
        cas.ajaxer({
            method:'GET',
            sendme:{pers:pers, loadScript: (typeof cas.almoxRelatForm === 'undefined')},
            sendto:'almox_relat/info',
            andthen: function(x){
                if(typeof cas.almoxRelatForm === 'function'){
                    cas.almoxRelatForm(x.data.relats,x.data.users,x.data.tecs,per);
                }
                LazyLoad.js('/lib/js/'+cas.src+'/almox.relat.js', function(){
                    cas.almoxRelatForm(x.data.relats,x.data.users,x.data.tecs,per);
                });
            }
        });
    });
    $('#magic_search').autocomplete({
        source: function( request, response ) {
            cas.ajaxer({
                method:'GET',
                sendto:'almox/search',
                sendme:{
                    term:request.term
                },andthen:function(x){
                    response(x.data.guess);
                }
            });
        },
        minLength: 2,
        select: function( event, ui ) {
            if(!ui.item.lease_id){
                var id = ui.item.id.split(':'),
                x = ['g_'+id[0],'t_'+id[1],'d_'+id[2],'i_'+id[3]];

                if(!$('#'+x[0]).is('.level_open'))
                    $('#'+x[0]).trigger('click');

                if(!cas.inArray(x[1],open))
                    open.push(x[1]);

                if(!cas.inArray(x[2],open))
                    open.push(x[2]);

                cas.args.almox_open = open;
                cas.pushArgs();

                loadItems(id[1],false,id[3]);
            }else{
                var item = $('#tec_item_'+ui.item.i);
                if(item.length > 0){
                    srcResult(item);
                    item.effect('highlight').closest('tbody').show();
                    
                    $('#tec_container').animate({
                        scrollTop:$('#tec_container').scrollTop() 
                                    + (item.offset().top - $('#tec_container').offset().top - 30)
                    });
                }
            }
        }
    });
    $('#pending_dialog').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        width: 700,
        height:500,
        resizable: false,
        close:loadPending,
        buttons: [ 
                { 
                    text: "Aceitar", 
                    click: function() { 
                        postAck(true);
                    } 
                },
                { 
                    text: "Recusar", 
                    click: function() { 
                        postAck(false);
                    } 
                },
                { 
                    text: "Fechar", 
                    click: function() {
                        $( this ).dialog( "close" ); 
                    } 
                }
            ]
    });
    $('#pending_bt').click(function(){
        $('#pending_dialog').dialog('open');
    });
    boot();
    resizer();
    cas.resizer.push(resizer);
};