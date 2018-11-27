cas.controller = function(){
    var gMap, pFirstLoad = true, tFirstLoad = true;

    function loadMap () {
        

        gMap = new GMaps({
            div: '#map',
            lat: -22.956831,
            lng: -43.182631,
            zoom: 13,
            streetViewControl: true,
            panControl: false,
            rotateControl: true,
            zoomControl: true,
            scaleControl: false,
            mapTypeControl: true
        });
    }
    function inputLock() {
        $('#topbar').find('input,select,button').prop('disabled', true);
    }
    function inputUnlock() {
        $('#topbar').find('input,select,button').prop('disabled', false);
    }
    function loadPlacas () {
        inputLock();
        return $.getJSON('/lochist/placas', {d1: $('#day_one').val(), d2: $('#day_two').val()})
            .done(function (response) {
                inputUnlock();
                var $p = $('#placa').empty().append('<option value=""> #### ~~~ ##### </option>');
                
                response.placas.forEach(function (placa) {
                    $('<option>').attr('value', placa).text(placa).appendTo($p);
                });
                
 
                if (pFirstLoad && cas.args.l && cas.args.l.p) $p.val(cas.args.l.p);

                pFirstLoad = false;
                loadTecs();
            });
    }

    function loadTecs () {
        var args = {d1: $('#day_one').val(), d2: $('#day_two').val(), p: $('#placa').val()};
        args.d0 = $('#day_zero').val();
        
        inputLock();

        return $.getJSON('/lochist/tecs', args)
            .done(function (response) {
                inputUnlock();
                var $t = $('#tec').empty().append('<option value="">## Todos ##</option>');
                response.tecs.forEach(function (tec) {
                    $('<option>').attr('value', tec.id).text(tec.name).appendTo($t);
                });

                if (tFirstLoad && cas.args.l) {
                    $t.val(cas.args.l.t);
                    loadPos();
                }

                tFirstLoad = false;
            });
    }

    function plusOne (d) {
        d.setDate(d.getDate() + 1);
        return d;
    }

    function loadPos () {

        $('#tbwrapper td,#histTB,#histDescr,#histToggle>span').empty();
        

        cas.args.l = {
            d0: $('#day_zero').val(),
            d1: $('#day_one').val(),
            d2: $('#day_two').val(),
            t: $('#tec').val()
        };

        cas.args.l.p = $('#placa').val();
        
        var tecs = [], tecNames = [];

        if (!cas.args.l.p) delete cas.args.l.p;
        
        if (!cas.args.l.t) {
            
            tecs = $('#tec').find('option').filter(function () {
                return $(this).val() && $(this).val().length;
            }).first();
            
            if (tecs.length) {
                cas.args.l.t = tecs.val();
                tecNames.push(tecs.text())
            } else {
                delete cas.args.l.t;
            }

        } else {
            tecNames.push($('#tec').children('option:selected').text());
        }

        $('#tecName').html(tecNames.join(', '));

        cas.pushArgs();
        
        loadHist();
        inputLock();
        return $.getJSON('/lochist/pos', {t: cas.args.l.t, d: cas.args.l.d0})
            .done(function (response) {
                inputUnlock();
                gMap.removeMarkers();
                gMap.removePolylines();

                var coordinates = [], first = null, last = null;

                response.pos.forEach(function(newPos){
                    
                    if (!first) first = newPos.u_time;
                    last = newPos.u_time;

                    gMap.addMarker({
                        lat: newPos.lat,
                        lng: newPos.lng,
                        icon: '/lib/img/ok-pin.png',
                        title: newPos.time,
                        infoWindow: {
                            content: '<h3>'+newPos.time+'</h3>'+
                            '<p><b>Velocidade:</b>  '+newPos.speed+' km/h</p>'
                        }
                    });
                    coordinates.push([newPos.lat, newPos.lng]);
                });

                gMap.drawPolyline({
                    path: coordinates,
                    strokeColor: '#131540',
                    strokeOpacity: 0.6,
                    strokeWeight: 3
                });
                var poly = gMap.drawPolyline({
                    path: coordinates,
                    strokeColor: '#131540',
                    strokeOpacity: 0.6,
                    strokeWeight: 3
                }).getPath(),
                    len = google.maps.geometry.spherical.computeLength(poly);

                $('#totalLength').html(
                    len > 1000 
                        ? '<b>' + Math.round((len)/1000) + ' Km</b> de rastro GPS'
                        : '<b>' + len + ' metros</b> de rastro GPS'
                    );
                
                if (first) {
                    $('#lengthDescr').html('Rastro diário ' + 
                        (new Date(first * 1000)).toLocaleString() + ' • ' + (new Date(last * 1000)).toLocaleTimeString())
                } else {
                    $('#lengthDescr').empty();
                }

                if (coordinates.length){
                    gMap.fitZoom();
                } else {
                    gMap.setCenter(-22.956831, -43.182631);
                }
            });
    }
    function loadHist () {

        var args = {
            d1: $('#day_one').val(),
            d2: $('#day_two').val(),
            t: $('#tec').val(),
            p: $('#placa').val()
        };

        $('#histDescr').html(
            'Valores do período ' + 
                plusOne(new Date(args.d1)).toLocaleDateString() + 
                    ' • ' + 
                        plusOne(new Date(args.d2)).toLocaleDateString()
        );
        
        function gasLabel (km) {
            switch (km) {
                case 0:
                    return '[ Vazio ]';
                case 0.25:
                    return '1/4';
                case 0.5:
                    return '1/2';
                case 0.75:
                    return '3/4';
                case 1:
                    return '[ Cheio ]';
                default:
                    return km;
            }
        }

        $.getJSON('/lochist/hist', args)
            .done(function(response){
                $('#sumLength').html('<b>' + response.sum.km + ' km</b> registrados na kilometragem');
                $('#sumGas').html('<b>' + response.sum.gas + ' litros</b> registrados de consumo');

                if (response.veic) {
                    $('#veicModel').html('<b>' + response.veic.veic_model+ '</b>, ' + response.veic.gas_capacity + ' litros de tanque');
                }
                
                if (args.p) $('#veicPlaca').html('<b>'+args.p.toUpperCase()+'</b>');

                $('#osInfo').html('<b>' + response.vt_count + '</b> visitas realizadas');
                if (response.hist instanceof Array) {
                    $('#histToggle>span').html(response.hist.length + ' ');
                    response.hist.forEach(function(log){
                        $('#histTB').append(
                            '<tr>'+
                                '<td>'+log.time+'</td>'+
                                '<td>'+
                                    (log.tecnico ? '<br/><b>'+log.tecnico+'</b>' : '') +
                                    log.km + 
                                    (args.p ? '' : '<br/><b>'+log.placa+'</b>') +
                                    '</td>'+
                                '<td>'+gasLabel(log.gas)+'</td>'+
                            '</tr>'
                        );
                    });
                 }
            });
    }
    function resizer () {
        $('#contentwrapper').height($(window).height() 
            - $('#head').outerHeight()
            - $('#foot').outerHeight()
            - $('#topbar').outerHeight());
    }

    function initialize () {
        if (cas.args.l) {
            
            if (cas.args.l.d0) 
                $('#day_zero').val(cas.args.l.d0);

            if (cas.args.l.d1) 
                $('#day_one').val(cas.args.l.d1);
        
            if (cas.args.l.d2) 
                $('#day_two').val(cas.args.l.d2);
        }

        cas.resizer.push(resizer);
        resizer();
        loadMap();

        loadPlacas().always(function () {
            $('#placa').change(loadTecs);
            $('#day_zero').change(function(){
                var p = $('#placa').val();
                if (!(p && p.length)) {
                    loadTecs();
                }
            });
        });

        $('#day_one,#day_two').change(loadPlacas);
        $('#topbar>form').on('submit', function (e) {
            e.preventDefault();

            function validStuff (stuff) {
                return stuff.val() && stuff.val().length;
            }

            if (!validStuff($('#tec')) && !validStuff($('#placa'))) {
                return alert('Ops... selecione pelo menos um técnico ou uma placa.');
            }
            loadPos();
        });
        $('#histToggle').click(function(){
            $('#histTB').toggle();
        });
    }

    initialize();
    
};