cas.controller = function() {
    if (!cas.checkPerms('z'))
        $('.z-perm').remove();
    if (!cas.checkPerms('x'))
        $('.x-perm').remove();
    if (!cas.checkPerms('x') && !cas.checkPerms('i'))
        $('.i-perm').remove();
    var
    usrselected = false,
        areaselected = false,
        metaArea = 1,
        mycharts = {
            perf: {
                chart: false,
                t1: 0
            }
        },
        ajaxini,
        perfI = false,
        tab = null,
        tabLoadedFlag = 0;



    $("#tabs").tabs({
        activate: tabber,
        create: tabber
    });

    function tabber(event, ui) {

        var panel = null;
        if (ui.newPanel) {
            panel = ui.newPanel;
        } else {
            panel = ui.panel;
        }
        tab = panel.attr('id');
        clearInterval(perfI);
        for (var i in mycharts) {
            if (mycharts[i].chart) {
                mycharts[i].chart.destroy();
                mycharts[i].chart = false;
                mycharts[i].t1 = 0;
            }
        }

        $(".tab-list-item").removeClass('tab-list-item-selected');
        window.location.hash = tab;
        if (tab === 'tabs-usrs') {
            listUsers();
        } else if (tab === 'tabs-coord-ri') {
            areaselected = $(".area-list-item:first").html();
            $(".area-list-item:first").addClass('tab-list-item-selected');
            listAreaCoord();
        } else if (tab === 'tabs-fid') {
            listFidUsers();
        } else if (tab === 'tabs-param-dash') {
            args_show();
        } else if (tab === 'tabs-param-mon') {
            monAcc();
        } else if (tab === 'tabs-users-mon') {
            listTTUsers();
        } else if (tab === 'tabs-perf') {
            perf();
            perfI = setInterval(perf, 30000);
            newNodes();
        } else if (tab === 'tabs-threads') {
            threadTab();
        }
        if (tabLoadedFlag === 0) {
            $("#arg-accordion").accordion({
                heightStyle: "content",
                activate: args_show
            });
            $("#mon-accordion").accordion({
                heightStyle: "content",
                activate: monAcc
            });
            tabLoadedFlag++;
        }
    }

    function args_show(event, ui) {

        if (tab === 'tabs-param-dash') {

            if (ui){
                var panel = ((ui.newPanel) ? $(ui.newPanel).attr('id') : $(ui.panel).attr('id'));
            }else{
                var panel = 'gen_args';
            }
            
            if (panel === 'ri_area_metas'){
                $("#area_selector").children(':first').trigger('click');
            }else if (panel === 'cst_area_metas'){
                $("#cst_area_metas").find('.tab-list>li:first-child').trigger('click');
            }else if (panel === 'cst_cluster_metas'){
                $("#cst_cluster_metas").find('.tab-list>li:first-child').trigger('click');
            }else if (panel === 'gen_args'){
                loadSystemArgs();
            }
        }
    }

    function monAcc(event, ui) {

        if (tab === 'tabs-param-mon') {

            if (ui)
                var panel = ((ui.newPanel) ? $(ui.newPanel).attr('id') : $(ui.panel).attr('id'));
            else
                var panel = 'mon_sla_wrapper';

            if (panel === 'per_metas_wrapper')
                $('.per-mon-item:first').trigger('click');
            else if (panel === 'mon_sla_wrapper')
                sla_get();

        }
    }

    function threadTab() {
        openThreads();
        jobQueue();
    }
    var tthread, jthread;

    function openThreads() {
        clearTimeout(tthread);
        if (tab === 'tabs-threads') {
            var t = $('#thread_tb>tbody');
            
            cas.ajaxer({
                sendto: 'adm/open_threads',
                andthen: function(x) {
                    t.empty();
                    for (var i in x.data.threads)
                        t.append(
                            "<tr>" +
                            "<td class='loctbtd'>" + x.data.threads[i].ini + "</td>" +
                            "<td class='loctbtd'>" + x.data.threads[i].pid + "</td>" +
                            "<td class='loctbtd'>" + x.data.threads[i].descr + "</td>" +
                            "<td class='loctbtd logclick'>" + ((x.data.threads[i].log_file) ? x.data.threads[i].log_file : '') + "</td>" +
                            "<td class='loctbtd'><button title='Matar processo' class='threadkilla' thread='" + x.data.threads[i].id + "'>&zwnj;</button></td>" +
                            "</tr>"
                        );
                    $('.threadkilla').button({
                        icons: {
                            primary: "ui-icon-close"
                        },
                        text: false
                    }).click(threadKilla);
                    $('.logclick').click(showLog);
                }
            });
            tthread = setTimeout(openThreads, 10 * 1000);
        }
    }

    function jobQueue() {
        clearTimeout(jthread);
        if (tab === 'tabs-threads') {
            var t = $('#job_tb>tbody');
            
            cas.ajaxer({
                sendto: 'adm/job_queue',
                andthen: function(x) {
                    t.empty();
                    for (var i in x.data.queue)
                        t.append(
                            "<tr>" +
                            "<td class='loctbtd'>" + x.data.queue[i].open + "</td>" +
                            "<td class='loctbtd'>" + ((x.data.queue[i].user) ? x.data.queue[i].user : 'Sistema') + "</td>" +
                            "<td class='loctbtd'>" + x.data.queue[i].job + "</td>" +
                            "<td class='loctbtd'>" + ((parseInt(x.data.queue[i].a) > 0) ? "Remover" : 'Iniciar') + "</td>" +
                            "</tr>"
                        );
                }
            });
            jthread = setTimeout(jobQueue, 10 * 1000);
        }
    }

    function threadKilla() {
        cas.ajaxer({
            sendme: {
                thread: $(this).attr('thread')
            },
            sendto: 'adm/killathread',
            andthen: function() {
                threadTab();
            }
        });
    }
    var logthread;

    function logShow() {
        clearTimeout(logthread);
        if ($('#cmdshell').length > 0)
            cas.ajaxer({
                sendme: {
                    log: whatlog
                },
                sendto: 'adm/read_log',
                andthen: function(x) {
                    if ($('#cmdshell').length > 0) {
                        $('#cmdshell').html(x.data.log);
                        if (!$('#cmdshell').is(':hover'))
                            $('#randum').stop(true, true).animate({
                                scrollTop: $('#cmdshell').height()
                            }, 100);
                        logthread = setTimeout(logShow, 5 * 1000);
                    }
                }
            });
    }
    var whatlog;

    function showLog() {
        whatlog = $(this).html();
        $("<div id='randum'><pre id='cmdshell'></pre></div>")
            .appendTo('body').dialog({
                autoOpen: false,
                modal: true,
                closeOnEscape: true,
                width: 600,
                height: 400,
                dialogClass: 'noTitleDialog',
                resizable: false,
                open: function() {
                    logShow();
                },
                close: function() {
                    clearTimeout(logthread);
                    $(this).remove();
                },
                buttons: {
                    "Fechar": function() {
                        $(this).dialog('close');
                    }
                }
            }).dialog('open');

    }

    function spawnJob() {
        cas.ajaxer({
            sendme: {
                job: $('#thread_select').val()
            },
            sendto: 'adm/spawnajob',
            andthen: function() {
                threadTab();
            }
        });
    }


    function newNodes() {
        var t = $('#new_nodes>tbody').html("<tr><td class='loctbtd'><i>Carregando...</i></td></tr>");
        cas.ajaxer({
            method: 'GET',
            sendto: 'adm/nnodes',
            etc: {
                t: t
            },
            andthen: newNodes_
        });
    }

    function newNodes_(x) {
        if (typeof x.data.nodes.length !== 'undefined' && x.data.nodes.length) {
            x.etc.t.empty();
            for (var i in x.data.nodes)
                x.etc.t.append("<tr><td class='loctbtd'>" + x.data.nodes[i].NODE + "</td></tr>");
        } else
            x.etc.t.html("<tr><td class='loctbtd'><i>Nenhum novo node</i></td></tr>");
    }

    function perf() {
        cas.ajaxer({
            method: 'GET',
            sendto: 'adm/cache_perf_udpate',
            sendme: {
                t1: mycharts.perf.t1
            },
            andthen: perf_
        });
    }

    function perf_(x) {
        mycharts.perf.t1 = ((x.data.t.length > 0) ? (x.data.t[x.data.t.length - 1].x / 1000) : mycharts.perf.t1);
        if (!mycharts.perf.chart) {
            mycharts.perf.chart = new Highcharts.StockChart({
                chart: {
                    renderTo: 'perf_chart'
                },

                rangeSelector: {
                    enabled: true,
                    selected: 1,
                    inputEnabled: false,
                    buttons: [{
                        type: 'hour',
                        count: 1,
                        text: '1h'
                    }, {
                        type: 'hour',
                        count: 3,
                        text: '3h'
                    }, {
                        type: 'all',
                        text: 'Tudo'
                    }]
                },
                credits: {
                    enabled: false
                },
                global: {
                    useUTC: false
                },
                legend: {
                    backgroundColor: 'white',
                    enabled: true,
                    floating: false,
                    layout: 'vertical',
                    verticalAlign: 'middle',
                    align: 'right'
                },
                title: {
                    text: "Duração da Atualização do Cache em Segundos"
                },
                yAxis: {
                    min: 0,
                    labels: {
                        enabled: true
                    }
                },
                xAxis: {
                    labels: {
                        enabled: true
                    }
                },
                plotOptions: {
                    series: {
                        marker: {
                            enabled: false
                        },
                        dataLabels: {
                            enabled: false,
                            y: -8
                        }
                    }
                },
                series: [{
                        name: 'Total',
                        data: x.data.t
                    }, {
                        name: 'Atualização',
                        data: x.data.u
                    }, {
                        name: 'Novos',
                        data: x.data.n
                    }, {
                        name: 'Remoção',
                        data: x.data.k
                    }

                ]
            });
        } else {
            for (var i in x.data.t)
                mycharts.perf.chart.series[0].addPoint([x.data.t[i].x, x.data.t[i].y], true, true);

            for (var i in x.data.u)
                mycharts.perf.chart.series[1].addPoint([x.data.t[i].x, x.data.u[i].y], true, true);

            for (var i in x.data.n)
                mycharts.perf.chart.series[2].addPoint([x.data.n[i].x, x.data.n[i].y], true, true);

            for (var i in x.data.k)
                mycharts.perf.chart.series[3].addPoint([x.data.k[i].x, x.data.k[i].y], true, true);
        }
        $('#perf_tb>tbody').empty();
        var tot = 0,
            sp_tot = 0;
        for (var i in x.data.by_status) {
            tot += parseInt(x.data.by_status[i].c);
            sp_tot += Math.floor(parseInt(x.data.by_status[i].speed));
            $('#perf_tb>tbody').append(
                "<tr>" +
                "<td class='loctbtd'>" + x.data.by_status[i].status + "</td>" +
                "<td class='loctbtd'>" + x.data.by_status[i].c + "</td>" +
                "<td class='loctbtd' title='Máximo: " + x.data.by_status[i].mx_sp + ", Mínimo: " + x.data.by_status[i].mn_sp + "'>" + x.data.by_status[i].sp + "</td>" +
                "</tr>"
            );
        }
        sp_tot = ((x.data.by_status.length > 0) ? (sp_tot / x.data.by_status.length) : 0);
        var spp = Math.floor(sp_tot / 60) + "m " + Math.floor(sp_tot % 60) + "s";
        $('#perf_tb>tbody').append(
            "<tr>" +
            "<td class='loctbtd' style='font-weight:bold;'>TOTAL</td>" +
            "<td class='loctbtd' style='font-weight:bold;'>" + tot + "</td>" +
            "<td class='loctbtd' style='font-weight:bold;'>" + spp + "</td>" +
            "</tr>"
        );
    }
    $('#mon_group').on('change', function() {
        sla_get();
    });
    $('#mon_sla_sv').on('click', function() {
        cas.ajaxer({
            'sendto': "adm/sla_set",
            'sendme': {
                node_crit_sla: $('#node_crit_sla').spinner("value"),
                node_warn_sla: $('#node_warn_sla').spinner("value"),
                node_autobacklog: $('#node_autobacklog').spinner("value"),
                mon_days: $('#mon_days').spinner("value"),
                group_sla: {
                    group: $('#mon_group').val(),
                    sla: $('#mon_sla').spinner("value")
                }
            },
            'andthen': function(x) {
                cas.makeNotif('success', 'Novo SLA salvo no banco.');
            }
        });
    });

    function sla_get() {
        cas.ajaxer({
            'sendto': "adm/sla_get",
            'sendme': {
                group: $('#mon_group').val()
            },
            'andthen': function(x) {
                $('#mon_sla').val(x.data.group.sla);
                $('#node_warn_sla').val(x.data.node.node_warn_sla);
                $('#node_autobacklog').val(x.data.node.node_autobacklog);
                $('#mon_days').val(x.data.mon_days);
                $('#node_crit_sla').val(x.data.node.node_crit_sla);
                mon_sla_update();
                node_warn_sla_update();
                node_autobacklog_update();
                node_crit_sla_update();
            }
        });
    }

    $('#area_meta_sv').on('click', function() {
        saveAreaMetas();
    });
    $('#per_args_sv').on('click', function() {
        savePerArgs();
    });
    $('#tt_users_sv').on('click', function() {
        saveTTUsers();
    });

    function saveTTUsers() {
        var myusers = [];
        $('#tt_group_users').children().each(function() {
            myusers.push($(this).html());
        });

        cas.ajaxer({
            'sendto': "adm/save_tt_users",
            'sendme': {
                'group': $('#ttuser-group-select').val(),
                'per': $('#ttuser-per-select').val(),
                'users': myusers
            },
            'andthen': function(x) {
                cas.makeNotif('success', 'Alteração salva no banco com sucesso.');
            }
        });
    }

    function saveFidUsers() {
        var myusers = [];
        $('#usr_box_2').children().each(function() {
            myusers.push({
                'user': $(this).html(),
                'level': 1
            });
        });
        $('#usr_box_1').children().each(function() {
            myusers.push({
                'user': $(this).html(),
                'level': 2
            });
        });
        cas.ajaxer({
            'sendto': "adm/save_fid_users",
            'sendme': {
                users: myusers
            },
            'andthen': function(x) {
                cas.makeNotif('success', 'Alteração salva no banco com sucesso.');
            }
        });
    }

    function savePerArgs() {
        cas.ajaxer({
            'sendto': "adm/save_per_args",
            'sendme': {
                id: $('.tab-list-item-selected').attr('data-perid'),
                node_warn: $('#per_node_warn').val(),
                node_crit: $('#per_node_crit').val(),
                ag_min: $('#per_ag_min').val(),
                mailist: $('#per_mailist').val()
            },
            'andthen': function(x) {
                cas.makeNotif('success', 'Parâmetros salvos com sucesso.');
            }
        });
    }

    function saveAreaMetas() {
        var mts = {
            metas: {},
            id: metaArea,
            color: $('#area_color').val()
        };
        $('.areamt').each(function() {
            mts.metas[($(this).attr('id')).substr(5)] = {
                value: $(this).val(),
                ini: $(this).closest('.s_arg_val').children('.meta_ini').val()
            };
        });
        cas.ajaxer({
            'sendto': "adm/save_metas",
            'sendme': mts,
            'andthen': function(x) {
                cas.makeNotif('success', 'Parâmetros salvos com sucesso.');
            }
        });
    }

    function loadAreaMetas() {
        cas.ajaxer({
            method: 'GET',
            'sendto': "adm/area_metas",
            'sendme': { 'id': metaArea },
            'andthen': function(x) {
                $('#area_meta_imb').val(x.data.metas.meta_imb);
                $('#area_meta_imb_tv').val(x.data.metas.meta_imb_tv);
                $('#area_meta_imb_cm').val(x.data.metas.meta_imb_cm);
                $('#area_meta_irm').val(x.data.metas.meta_irm);
                $('#area_meta_qualidade').val(x.data.metas.meta_qualidade);
                $('#area_meta_producao').val(x.data.metas.meta_producao);
                $('#area_meta_cad_inst_diff').val(x.data.metas.meta_cad_inst_diff);
                $('#area_color').spectrum('set', x.data.metas.color);
            }
        });
    }

    function loadPerArgs(perid) {
        cas.ajaxer({
            'sendto': "adm/per_args",
            'sendme': {
                'id': perid
            },
            'andthen': function(x) {
                $('#per_node_warn').val(x.data.args.node_warn);
                $('#per_node_crit').val(x.data.args.node_crit);
                $('#per_ag_min').val(x.data.args.ag_min);
                $('#per_mailist').val(x.data.args.mailist);
            }
        });
    }

    function loadMonArgs() {
        cas.ajaxer({
            'sendto': "adm/load_mon_args",
            'sendme': {
                ola: true
            },
            'andthen': function(x) {
                for (var i = 0; i < x.data.args.length; i++) {
                    $('#' + x.data.args[i].name).val(x.data.args[i].value);
                }
            }
        });
    }

    function loadSystemArgs() {
        cas.ajaxer({
            'sendto': "adm/load_system_args",
            'sendme': {
                ola: true
            },
            'andthen': function(x) {
                for (var i = 0; i < x.data.args.length; i++) {
                    if (x.data.args[i].checkbox) {
                        $('#' + x.data.args[i].name).prop('checked', x.data.args[i].value);
                    } else
                        $('#' + x.data.args[i].name).val(x.data.args[i].value);

                }
            }
        });
    }

    function listAreaCoord() {
        cas.ajaxer({
            'sendto': "adm/list_coord",
            'sendme': {
                'area': areaselected
            },
            'andthen': function(x) {
                var usr;
                $('#coord-list').empty();
                if (x.data.users.length > 0) {
                    for (usr in x.data.users) {
                        var parthtm = "<div class='coord-list-item'>";
                        if (x.data.users[usr].level) {
                            parthtm += "<span class='coord-list-item-level'>[ " + x.data.users[usr].level + " ]</span>";
                        }
                        parthtm +=
                            "<span class='coord-list-item-name'>" + x.data.users[usr].user + "</span>" +
                            "<span class='coord-list-item-action'>" +
                            "<span class='rm_coord' title='Clique para desvincular coordenador'></span>" +
                            "</span>" +
                            "</div>";
                        parthtm = $(parthtm);
                        parthtm.find('.rm_coord').button({
                            icons: {
                                primary: "ui-icon-close"
                            },
                            text: false
                        })
                            .click(function() {
                                rmCoord($(this).parent().prev().html());
                            });
                        $('#coord-list').append(parthtm);
                    }
                    $('#area-wrapper').show();
                } else {
                    if (areaselected != 'SIM')
                        $('#coord-list').html('<div>Nenhum coordenador para esta área.</div>');
                    else
                        $('#coord-list').html('<div>Nenhum coordenador geral.</div>');
                    $('#area-wrapper').show();
                }

            }
        });
    }

    function addCoord(new_user) {
        cas.ajaxer({
            'sendto': "adm/add_coord",
            'sendme': {
                'user': new_user,
                'area': areaselected
            },
            'andthen': function(x) {
                listAreaCoord();
            }
        });
    }

    function rmCoord(victim) {
        cas.ajaxer({
            'sendto': "adm/rm_coord",
            'sendme': {
                'user': victim,
                'area': areaselected
            },
            'andthen': function(x) {
                listAreaCoord();
            }
        });
    }
    $('#ttuser-group-select,#ttuser-per-select').change(function() {
        listTTUsers();
    });

    function listTTUsers() {
        cas.ajaxer({
            'sendto': "adm/tt_users",
            'sendme': {
                group: $('#ttuser-group-select').val(),
                per: $('#ttuser-per-select').val()
            },
            'andthen': function(x) {
                var usr;
                $('.connectedSortable').empty();
                for (usr in x.data.users.all)
                    $('#non_tt_users').append('<li class="ui-state-default">' + x.data.users.all[usr] + "</li>");
                for (usr in x.data.users.group)
                    $('#tt_group_users').append('<li class="ui-state-default">' + x.data.users.group[usr] + "</li>");
                $(".connectedSortable").sortable({
                    connectWith: ".connectedSortable"
                });
            }
        });
    }

    function listFidUsers() {
        cas.ajaxer({
            'sendto': "adm/list_fid_users",
            'andthen': function(x) {
                var usr;
                $('.usr_select').empty();
                if (x.data.users.length > 0) {
                    for (usr in x.data.users) {
                        if (x.data.users[usr].level1 == '0' && x.data.users[usr].level2 == '0') {
                            $('#usr_box_0').append("<option>" + x.data.users[usr].user + "</option>");
                        } else if (x.data.users[usr].level1 == '1') {
                            $('#usr_box_2').append("<option>" + x.data.users[usr].user + "</option>");
                        } else if (x.data.users[usr].level2 == '1') {
                            $('#usr_box_1').append("<option>" + x.data.users[usr].user + "</option>");
                        }
                    }
                }
            }
        });
    }

    function listUsers() {
        cas.ajaxer({
            'sendto': "adm/list_users",
            'andthen': function(x) {
                var usr;
                $('#user-list').empty();
                if (x.data.users.length > 0) {
                    for (usr in x.data.users) {
                        $('#user-list').append("<div class='user-list-item tab-list-item'>" +
                            x.data.users[usr].login + "</div>");
                    }
                    $('#user-list').find('.user-list-item').on('click', function() {
                        $(".tab-list-item").removeClass('tab-list-item-selected');
                        $(this).addClass('tab-list-item-selected');
                        usrselected = $(this).html();

                        $('#user-form-last_login').html('lendo log...');

                        cas.ajaxer({
                            method: 'GET',
                            sendme: {
                                user: usrselected
                            },
                            sendto: 'adm/user_last_log',
                            andthen: function(x) {
                                $('#user-form-last_login').html(x.data.log);
                            }
                        });

                        cas.ajaxer({
                            'sendto': "adm/get_user",
                            'sendme': {
                                'user': usrselected
                            },
                            'andthen': function(x) {
                                resetPerms();
                                var f;
                                for (f in x.data.fields) {
                                    if (f === 'perms') {
                                        for (var i = 0; i < x.data.fields[f].length; i++) {
                                            var $_opt =
                                                $(".perm_s[value='" + (x.data.fields[f][i]) + "']");
                                            $_opt.remove();
                                            $('#perms_enabled').append($_opt);
                                        }
                                    } else if ($('#user-form-' + f).attr('type') === 'checkbox')
                                        $('#user-form-' + f).prop('checked', x.data.fields[f]);
                                    else
                                        $('#user-form-' + f).val(x.data.fields[f]);

                                }
                                checkGroup();
                            }
                        });
                    });
                    $('#user-wrapper').show();
                    resetUserFields();
                } else {
                    $('#user-list').html('<div>Não há nenhum usuário abaixo do seu.</div>');
                    $('#user-wrapper').show();
                    resetUserFields();
                }
            }
        });
    }

    function resetUserFields() {
        usrselected = false;
        $(".user-list-item").removeClass('tab-list-item-selected');
        $('#user-form-login').val('usuario@simtv.com.br');
        $('#user-form-group-check').prop('checked', false);;
        $('#user-form-group-password').val('');
        $('#user-form-cel1').val('');
        $('#user-form-cel2').val('');
        resetPerms();
        checkGroup();
    }
    $('#user-form-group-check').change(function() {
        checkGroup();
    });

    function checkGroup() {
        if (!$('#user-form-group-check').is(':checked')) {
            $('#user-form-group-password').prop('readOnly', true);
        } else {
            $('#user-form-group-password').prop('readOnly', false);
        }
    }

    function resetPerms() {
        $('.perm_s').each(function(i) {
            var $_opt = $(this);
            $_opt.removeAttr('selected');
            $_opt.remove();
            /*if($_opt.val() === 'a')
                $('#perms_enabled').append($_opt);
            else*/
            $('#perms_avaible').append($_opt);
        });
    }

    function loadCstAreaMetas() {
        var args = {
            area: $(this).attr('data-areaid')
        };
        args.root = $(this).closest('.tab-content').attr('data-areaid', args.area);
        args.form = args.root.find('.tab-form').empty();

        cas.ajaxer({
            method: 'GET',
            etc: args,
            sendme: {
                area: args.area,
                cst_cluster: $(this).closest('.meta-container').is('#cst_cluster_metas')
            },
            sendto: 'adm/l_cst_area_metas',
            andthen: _lMetas
        });
    }

    function _lMetas(x) {
        var metas = x.data.metas;
        for (var i in metas) {
            var line = $('<div>').attr('data-meta', metas[i].id).addClass('arg_line').appendTo(x.etc.form);
            line.append("<span class='s_arg_name'>" + metas[i].name + "</span>");
            var s = $('<span>').addClass('s_arg_val').appendTo(line);
            $("<input type='text' />")
                .addClass('cst-meta-val').appendTo(s)
                .spinner({
                    step: 0.1,
                    min: 0,
                    max: 100
                }).spinner('value', 0);

            $("<input type='text' />").addClass('cst-meta-date')
                .appendTo(s).val(metas[i].ini)
                .datepicker({
                    dateFormat: 'yy-mm-dd'
                }).change(reloadMeta).trigger('change');
            $('<button title="Ver Histórico"> ... </button>').appendTo(s).click(showMetaHist);
        }
    }
    $('.btmetahist').click(function() {
        var line = $(this).closest('.arg_line');
        cas.ajaxer({
            method: 'GET',
            sendto: 'adm/ri_meta_hist',
            etc: {
                title: line.find('.s_arg_name').text()
            },
            sendme: {
                meta: line.attr('data-meta'),
                area: metaArea
            },
            andthen: plotMetaHist
        });
    });

    function showMetaHist() {
        var line = $(this).closest('.arg_line');
        cas.ajaxer({
            method: 'GET',
            sendto: 'adm/cst_meta_hist',
            etc: {
                title: line.find('.s_arg_name').text()
            },
            sendme: {
                meta: line.attr('data-meta'),
                area: $(this).closest('.tab-content').attr('data-areaid'),
                cst_cluster: $(this).closest('.meta-container').is('#cst_cluster_metas')
            },
            andthen: plotMetaHist
        });
    }

    function plotMetaHist(x) {
        var dialog = $('<div>').width(800).height(400);
        cas.weirdDialogSpawn(null, dialog);
        var dates = x.data.dates;
        for (var i in dates) {
            var d = new Date();
            dates[i].x = d.setTime(dates[i].x);
        }
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: dialog[0],
                type: 'line'
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: true
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Histórico - ' + x.etc.title
            },
            tooltip: {
                formatter: function() {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%e. %b, %Y', this.x) + ': <b>' + this.y + '</b>' +
                        '<br>Inserida em <i>' + this.point.options.timestamp + '</i>';
                }
            },
            legend: {
                enabled: false
            },
            yAxis: {
                min: 0,
                labels: {
                    enabled: true
                },
                title: {
                    text: null
                }
            },
            xAxis: {
                type: 'datetime'
            },
            series: [{
                name: x.etc.title,
                data: dates
            }]
        });
    }

    function reloadMeta() {
        var line = $(this).closest('.arg_line');
        var s = {
            ini: $(this).val(),
            meta: line.attr('data-meta'),
            area: $(this).closest('.tab-content').attr('data-areaid'),
            cst_cluster: $(this).closest('.meta-container').is('#cst_cluster_metas')
        };
        cas.ajaxer({
            method: 'GET',
            sendto: 'adm/r_cst_area_meta',
            sendme: s,
            andthen: function(x) {
                if (!$.contains(document.documentElement, line[0])){
                    return false;
                }
                line.find('.cst-meta-val').spinner('value', x.data.meta);
            }
        });
    }
    

    function svCSTMetas() {
        var mts = [];
        var metaContainer = $(this).closest('.meta-container');
        var root = metaContainer.find('.tab-content');
        var aid = root.attr('data-areaid');
        root.find('.arg_line').each(function(){
            mts.push({
                meta: $(this).attr('data-meta'),
                ini: $(this).find('.cst-meta-date').val(),
                val: $(this).find('.cst-meta-val').spinner('value')
            });
        });

        cas.ajaxer({
            sendme: {
                area: aid,
                metas: mts,
                cst_cluster: metaContainer.is('#cst_cluster_metas')
            },
            sendto: 'adm/sv_cst_area_metas'
        });
    }
    $('.tab-list-item').click(function() {
        $('.tab-list-item').removeClass('tab-list-item-selected');
        $(this).addClass('tab-list-item-selected');
    });
    
    $('.meta-container').find('.sv_button').click(svCSTMetas);
    $('.meta-container').find('.tab-list>li').click(loadCstAreaMetas);
    
    $('.area-meta-item').click(function() {
        metaArea = $(this).attr('data-areaid');
        loadAreaMetas();
    });
    $('#coord-email').autocomplete({
        minLength: 3,
        source: function(request, response) {
            $.ajax({
                type: "POST",
                dataType: 'json',
                data: {
                    term: request.term
                },
                url: 'adm/usr_auto_comp',
                success: function(data) {
                    if (data.status == 'success') {
                        response(data.usrs);
                    } else if (data.status == 'permission_error') {
                        window.location.replace("login");
                    } else {
                        cas.makeNotif('error', data.msg);

                    }
                }
            });
        }
    });
    $('.per-mon-item').on('click', function() {
        $(".tab-list-item").removeClass('tab-list-item-selected');
        $(this).addClass('tab-list-item-selected');
        loadPerArgs($(this).attr('data-perid'));
    });
    $('.area-list-item').on('click', function() {
        $(".tab-list-item").removeClass('tab-list-item-selected');
        $(this).addClass('tab-list-item-selected');
        areaselected = $(this).html();
        listAreaCoord();
    });

    $("#user-form-save").click(function() {
        var p_e = '';
        $('#perms_enabled').children('option').each(function(i) {
            p_e += $(this).val();
        });
        if (usrselected) {
            if (isEmailValid($('#user-form-login').val())) {
                var usr = {
                    old_login: usrselected,
                    new_login: $('#user-form-login').val(),
                    cel1: $('#user-form-cel1').val(),
                    cel2: $('#user-form-cel2').val(),
                    perms: p_e,
                    home: $('#user-form-home').val(),
                    group: (($('#user-form-group-check').is(':checked')) ? 1 : 0),
                    password: $('#user-form-group-password').val()
                };
                sendUsr(usr);
            } else {
                $('#user-form-login').effect('highlight');
                cas.makeNotif('warning', 'Por favor, preencha corretamente o email do usuário.');
            }
        } else {
            if (isEmailValid($('#user-form-login').val())) {
                var usr = {
                    new_login: $('#user-form-login').val(),
                    cel1: $('#user-form-cel1').val(),
                    cel2: $('#user-form-cel2').val(),
                    perms: p_e,
                    home: $('#user-form-home').val(),
                    group: (($('#user-form-group-check').is(':checked')) ? 1 : 0),
                    password: $('#user-form-group-password').val()
                };
                sendUsr(usr);
            } else {
                $('#user-form-login').effect('highlight', 'slow');
                cas.makeNotif('warning', 'Por favor, preencha corretamente o email do usuário.');
            }
        }
    });
    $('#sys_args_sv').click(function() {
        var args = {};
        $('.sysarg').each(function() {
            if ($(this).is(':checkbox'))
                args[$(this).attr('id')] = (($(this).is(':checked')) ? 1 : 0);
            else
                args[$(this).attr('id')] = $(this).val();
        });
        saveSysArgs(args);
    });
    $('#usr_fid_sv').click(function() {
        saveFidUsers();
    });

    function saveSysArgs(args) {
        cas.ajaxer({
            'sendto': "adm/save_sys_args",
            'sendme': args,
            'andthen': function(x) {
                cas.makeNotif('success', 'Parâmetros salvos com sucesso.');
                loadSystemArgs();
            }
        });
    }

    function sendUsr(usr) {
        cas.ajaxer({
            'sendto': "adm/save_user",
            'sendme': usr,
            'andthen': function(x) {
                listUsers();
            }
        });
    }

    function isEmailValid(strEmail) {
        //var pos = strEmail.indexOf("@simtv.com.br");
        var pos = strEmail.indexOf("@");
        return pos > 2;
    }

    $("#user-form-kill").click(function() {
        if (usrselected) {
            cas.ajaxer({
                'sendto': "adm/delete_user",
                'sendme': {
                    login: usrselected
                },
                'andthen': function(x) {
                    listUsers();
                }
            });
        } else {
            cas.makeNotif('warning', 'Por favor, selecione um usuário.');

        }
    });
    $('.swap_bt_r').button({
        text: false,
        icons: {
            primary: "ui-icon-circle-arrow-e"
        }
    });
    $('.swap_bt_l').button({
        text: false,
        icons: {
            primary: "ui-icon-circle-arrow-w"
        }
    });
    $('#perm_down').button({
        text: false,
        icons: {
            primary: "ui-icon-circle-arrow-s"
        }
    });
    $('#perm_up').button({
        text: false,
        icons: {
            primary: "ui-icon-circle-arrow-n"
        }
    });
    $('#perm_left').button({
        text: false,
        icons: {
            primary: "ui-icon-circle-arrow-w"
        }
    });
    $('#perm_right').button({
        text: false,
        icons: {
            primary: "ui-icon-circle-arrow-e"
        }
    });
    $("#coord-insert-bt").button({
        label: 'Adicionar',
        icons: {
            primary: "ui-icon-plus"
        }
    });
    $(".sv_button").button({
        icons: {
            primary: "ui-icon-circle-arrow-n"
        }
    });
    $("#user-form-new").button({
        icons: {
            primary: "ui-icon-document"
        }
    });
    $("#user-form-kill").button({
        icons: {
            primary: "ui-icon-trash"
        }
    });
    $("#user-form-reset").button({
        icons: {
            primary: "ui-icon-refresh"
        }
    });
    $('#user-form-new').click(function() {
        resetUserFields();
        $('#user-form-login').effect('highlight');
    });
    $("#coord-insert-bt").on('click', function() {
        if (isEmailValid($("#coord-email").val()))
            addCoord({
                user: $("#coord-email").val(),
                level: $("#coord-level").val()
            });
        else {
            cas.makeNotif('warning', 'Valor inválido para Coordenador!');
            $("#coord-email").effect('highlight');
        }
    });

    $('#coord-email').keypress(function(e) {
        if (e.which == 13 && isEmailValid($(this).val())) {
            addCoord({
                user: $(this).val(),
                level: $("#coord-level").val()
            });
        } else if (e.which == 13) {
            cas.makeNotif('warning', 'Valor inválido para Coordenador!');
            $("#coord-email").effect('highlight');
        }

    });

    function mon_sla_update(v) {
        if (typeof v === 'undefined')
            v = $('#mon_sla').spinner("value");
        $('#mon_sla_label').html(Math.floor(v / 60) + " horas " + (v % 60) + " minutos.");
    }

    function node_crit_sla_update(v) {
        if (typeof v === 'undefined')
            v = $('#node_crit_sla').spinner("value");
        $('#node_crit_sla_label').html(Math.floor(v / 60) + " horas " + (v % 60) + " minutos.");
    }

    function node_warn_sla_update(v) {
        if (typeof v === 'undefined')
            v = $('#node_warn_sla').spinner("value");
        $('#node_warn_sla_label').html(Math.floor(v / 60) + " horas " + (v % 60) + " minutos.");
    }

    function node_autobacklog_update(v) {
        if (typeof v === 'undefined')
            v = $('#node_autobacklog').spinner("value");
        $('#node_autobacklog_label').html(Math.floor(v / 60) + " horas " + (v % 60) + " minutos.");
    }
    $('#os_cache_freq,#os_cache_span').spinner({
        step: 1,
        min: 1
    });
    $("#mon_sla").spinner({
        step: 10,
        min: 0,
        spin: function(event, ui) {
            mon_sla_update(ui.value);
        }
    });
    $("#node_crit_sla").spinner({
        step: 1,
        min: 0,
        spin: function(event, ui) {
            node_crit_sla_update(ui.value);
        }
    });
    $("#node_warn_sla").spinner({
        step: 1,
        min: 0,
        spin: function(event, ui) {
            node_warn_sla_update(ui.value);
        }
    });
    $("#node_autobacklog").spinner({
        step: 1,
        min: 0,
        spin: function(event, ui) {
            node_autobacklog_update(ui.value);
        }
    });
    $("#mon_days").spinner({step: 1, min: 1});

    $("#coord-level").spinner({
        step: 1,
        min: 1,
        max: 100
    });

    $("#coord-level").val('1');
    $(".spinner-dec").spinner({
        step: 0.01,
        min: 0,
        max: 100
    });
    $(".spinner-int").spinner({
        step: 1,
        min: 0,
        max: 100
    });
    $('.meta_ini').datepicker({
        dateFormat: 'yy-mm-dd'
    });
    $('.swap_bt_r').on('click', function() {
        var tmpINDX;
        tmpINDX = $(this).parent().attr('index');
        $('#usr_box_0').children(":selected").each(function() {
            var tmp = $(this);
            $(this).remove();
            $('#usr_box_' + tmpINDX).append(tmp);
        });
    });
    $('.swap_bt_l').on('click', function() {
        $('#usr_box_' + $(this).parent().attr('index')).children(":selected").each(function() {
            var tmp = $(this);
            $(this).remove();
            $('#usr_box_0').append(tmp);
        });
    });
    $('#perm_right').on('click', function() {
        $('#perms_avaible').children(":selected").each(function() {
            var tmp = $(this);
            $(this).remove();
            $('#perms_enabled').append(tmp);
        });
    });
    $('#perm_left').on('click', function() {
        $('#perms_enabled').children(":selected").each(function() {
            var tmp = $(this);
            $(this).remove();
            $('#perms_avaible').append(tmp);
        });
    });
    $("#area_color").spectrum({
        showInitial: true,
        showInput: true,
        chooseText: "Confirmar",
        cancelText: "Cancelar"
    });
    $('#st_pm_bt').button({
        icons: {
            primary: "ui-icon-gear"
        },
        text: false
    }).click(function() {
        $('#stperminute').dialog('open');
    }).attr('title', 'Configurar');
    $('#stperminute').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        width: 750,
        height: 450,
        dialogClass: 'noTitleDialog',
        resizable: false,
        open: function() {
            cas.ajaxer({
                'sendto': "adm/get_stpm",
                'andthen': function(x) {
                    var c = 0;
                    $('#os_cache_freq').val(x.data.freq);
                    $('#os_cache_span').val(x.data.span);
                    $('#stperminutes').html("<thead><tr><th>#</th></tr></thead><tbody></tbody>");
                    for (var status in x.data.args) {
                        var st =
                            $("<tr>" +
                                "<td class='stname'>" + status + "s</td>" +
                                "</tr>").appendTo('#stperminutes>tbody');

                        for (var tipo in x.data.args[status]) {
                            var tp = $("<input type='text' data-st='" + status + 
                                    "' title='" + x.data.args[status][tipo].x + "' data-tp='" + tipo + 
                                    "' class='perminute_spinner' style='width:40px;' value='" + x.data.args[status][tipo].y + "'/>");
                            $("<td>").append(tp).appendTo(st);
                            tp.spinner({step: 1, min: 0});
                            
                            if (c === 0){
                                $("<th class='stname'>" + x.data.args[status][tipo].x + "</th>").appendTo('#stperminutes>thead>tr');
                            }
                        }
                        c++;
                    }
                }
            });
        },
        buttons: {
            Fechar: function() {
                $('#stperminute').dialog('close');
            },
            Salvar: function() {
                var args = {};
                $('.perminute_spinner').each(function() {
                    var status = $(this).attr('data-st');
                    var tipo = $(this).attr('data-tp');
                    var tpname = $(this).attr('title');
                    if (!args[status])
                        args[status] = {};
                    args[status][tipo] = {
                        x: tpname,
                        y: parseInt($(this).spinner('value'))
                    };
                });
                cas.ajaxer({
                    sendto: "adm/save_stpm",
                    sendme: {
                        args: args,
                        freq: $('#os_cache_freq').spinner('value'),
                        span: $('#os_cache_span').spinner('value')
                    },
                    andthen: function(x) {
                        cas.makeNotif('success', 'Alterações Salvas com Sucesso');
                        $('#stperminute').dialog('close');
                    }
                });
            }
        }
    });
    $('#thread_start').click(spawnJob);
    $('.tab-list').disableSelection();
};