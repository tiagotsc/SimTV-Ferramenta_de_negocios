cas.controller = function(){
    $('#loading').hide();
    
    var ongoingAjax = 0,
        ajaxini;
    function simpleAjax(x, hideme){
        if (typeof hideme === 'undefined')
            hideme = 'body';
        $.ajax(
        {
            type: "POST",
            dataType: 'json',
            data: x.sendme,
            url: x.sendto,
            beforeSend: function(){
                ongoingAjax++;
                cas.hidethis(hideme);
                if (ongoingAjax == 1){
                    ajaxini = new Date();

                }
            },
            complete: function (data)
            {
                ongoingAjax--;
                cas.showthis(hideme);
                if (ongoingAjax == 0)
                {

                    var ajaxend = new Date();
                    $('#timeloaded').html('Dados carregados em: ' + ((ajaxend - ajaxini) / 1000) + ' segundos');
                }
            },
            success: function (data)
            {
                if(typeof data.msg !== 'undefined')
                    cas.makeNotif(((data.status !== 'success')?'error':'success'), data.msg);
                if (data.status == 'success')
                {
                    if (x.andthen) x.andthen(
                    {
                        'data': data,
                        'etc': x.etc
                    });
                }
                else if (data.status == 'permission_error')
                {
                    window.location.replace("login");
                }
                else
                {
                    $('.popclose').dialog('close');
                }
            }
        });
    }
    function decodeUrl(){
        var weird = false;
        if (location.hash.substr(0,1) == "#"){
            var query = new Array();
            if(location.hash.indexOf("?") != -1){
                var l = location.hash.split("?");
                if(location.hash.indexOf("?") != -1){
                    var chunks = l[1].split("&");
                    for(x in chunks){
                        var a = chunks[x].split("=");
                        var k = a[0];
                        var v = a[1];
                        query[k] = v;
                    }
                }else{
                    weird = true;
                }
            }else{
                weird = true;
            }
        }
        switch(location.hash.substr(1,1)){
            case 'd':
                if(weird){
                    cas.makeNotif('error','URL Inválida');
                }else{
                    $('#guesswhat').val(query['id']);
                    loadDecoder(query);
                }
                break;
            case 'n':
                openNewDecoderForm();
                break;
        }
    }
    function deleteDecoder(v){
        simpleAjax({
            sendme:{id:v['id'],sn:v['sn'],chipid:v['chipid']},
            sendto: "dec/x",
            andthen:function(x){
                $("#container").empty();
                location.hash = '';
            }
        });
    }
    function newModel(){
        simpleAjax({
            sendme: {chipid:$('#newdecoderchipid').val(),
                    sn:$('#newdecodersn').val(),
                    model:$('#newdecodermodel').val()},
            sendto: "dec/s",
            andthen:function(x){
                loadDecoder({id:$('#newdecodersn').val()});
            }
        });

    }
    function loadDecoder(v){
        simpleAjax({
            sendme:{id:v['id']},
            sendto:"dec/d",
            andthen:function(x){
                $("#container").empty();
                if(typeof x.data.htm !== 'undefined')
                    $("#container").html(x.data.htm);
                $('.descr').css('height',$('.descr').parent().css('height'));
                location.hash = "d?id=" + v['id'];
            }
        });
    }
    function openNewDecoderForm(){
        simpleAjax({
            sendto:"dec/n",
            andthen:function(x){
                $("#container").empty();
                if(typeof x.data.htm !== 'undefined')
                    $("#container").html(x.data.htm);
                location.hash = "n";
            }
        });
    };
    $('#searchbt').click(function(){
        loadDecoder({'id':$('#guesswhat').val()});
    });
    $('#newbt').click(function(){
        openNewDecoderForm();
    });
    $('#content').on('click','#nextbt',function(){
        newModel();
    });
    $('#guesswhat').keypress(function(e){
        if (e.which == 13) {
            loadDecoder({'id':$('#guesswhat').val()});
        }
    });
    $('#content').on('click','#printbarcode',function(){
        $(this).parent().find('img').jqprint();
    });
    $("#guesswhat").autocomplete({
        source: "dec/a",
        select: function(event, ui) { loadDecoder({id:ui.item.value}); },
        minLength: 1
    });
    $('#content').on('click','#delete_item',function(){
        var r = confirm("Você realmente deseja excluir este item?");
        if (r==true){
            deleteDecoder({'id':$('#did').val(),'sn':$('#dsn').val(),'chipid':$('#dchipid').val()});
        }
    });
    decodeUrl();
};