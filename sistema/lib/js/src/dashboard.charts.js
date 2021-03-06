(function() {
    var cas = window.cas;

    function ChartsCore(){
        this.chartFactoryStructure = {};
        this.chartQueue = [];
        this.chartFactory = {};
        this.chartSelector = {
            mes: null,
            dia: null
        };
        this.zoomChart = null;
        this.chartTree = {};
        this.altIcon = null;
        return this;
    }

    ChartsCore.prototype.tbloader = function(callback){
        google.load('visualization', '1', {packages:['table'],callback:callback});
    };
    ChartsCore.prototype.proccessLoadQueue = function(queue){

        var func;

        if(queue instanceof Array === false){
            return;
        }

        do{
            func = queue.pop();
            if(func){
                func();
            }
        }while(queue.length > 0);

    };
    ChartsCore.prototype.__downloadChart = function(chart, onload){
        cas.charts.chartQueue.push(chart);
        console.group('Downloading', chart);

        LazyLoad.js('/lib/js/'+cas.src+'/dashboard.charts/'+chart+'.js',
            function(){

                _.pull(cas.charts.chartQueue, chart);

                if (cas.charts.chartFactory[chart] instanceof cas.charts.ChartPlaceHolder) {

                    console.log(chart, '...loading parent:', cas.charts.chartFactory[chart].parent);

                    onload = onload.concat(cas.charts.chartFactory[chart].onload);
                    delete cas.charts.chartFactory[chart].onload;
                    cas.charts.downloadChart(cas.charts.chartFactory[chart].parent, onload);

                    return;
                }

                console.log(chart, '...loaded');
                cas.charts.proccessLoadQueue(onload);

            });
    };
    ChartsCore.prototype.downloadChart = function (chart, onload, since) {
        since = since || new Date();

        if(onload instanceof Array === false){
            onload = [onload];
        }

        if(!chart){
            return cas.charts.proccessLoadQueue(onload);
        }

        function waitABit(){

            if ( (new Date()) - since < 1000 * 60 ) {
                console.log(chart, '...waiting');
                setTimeout(function(){
                    cas.charts.downloadChart(chart, onload, since);
                }, 100);
                return;
            }

            console.error('FAILED TO LOAD ', chart, ' - ', 
                Math.floor(((new Date()) - since)/1000), ' seconds ellapsed.' );
        }

        var chartConstructor = cas.charts.chartFactory[chart];
        if (chartConstructor) {

            if(chartConstructor instanceof cas.charts.ChartPlaceHolder){
                return waitABit();
            }

            return cas.charts.proccessLoadQueue(onload);
        }

        if(cas.charts.chartQueue.indexOf(chart) >-1 ){
            return waitABit();
        }

        cas.charts.__downloadChart(chart, onload);

    };
    ChartsCore.prototype.ChartPlaceHolder = function (id, parent, ChartClass) {
        this.parent = parent;
        this.onload = [];
        this.onload.push(function chartAssembler() {
            console.groupEnd();
            console.log("%c "+ id+ ' ...mounting', "color: green; font-weight: bold");

            if(parent){
                var ParentChart = cas.charts.chartFactory[parent];

                _.extend(ChartClass.prototype, ParentChart.prototype);
                ChartClass.prototype.constructor = ChartClass;
            }

            ChartClass.__id = id;
            ChartClass.__parent = (parent) ? ParentChart : null;

            var node = cas.charts.chartFactoryStructure;
            if (parent) {
                node = ChartClass.__parent.__node;
            }

            node[id] = {};
            ChartClass.__node = node[id];

            cas.charts.chartFactory[id] = ChartClass;
        });
        return this;
    };
    ChartsCore.prototype.iarToolTip = function(event) {

        var titleplus;
        var chart = event.chart.owner;

        if (chart.id === 'iar') {
            titleplus = cas.areaName(this.point.category);
        }
        if (chart.id === 'iar_hist') {
            titleplus = this.point.category;
        }
        if (chart.id === 'iar_mes') {
            titleplus = 'Semana ' + (this.point.x + 1);
        }
        if (chart.id === 'iar_semana') {
            titleplus = this.point.category;
        }

        if (this.point.series.name === 'Meta') {
            return "<b>" + titleplus + '</b><br><b>' +
                this.point.series.name + ":</b> " + this.y + '%';
        }

        return '<b>Tempo de atendimento - ' + titleplus + ':</b><br>' +
            '<b>' + this.series.name + ':</b> ' + this.y + ' ~ <i>' + cas.roundNumber(this.percentage, 2) + '%</i><br>' +
            ((this.series.options.to) ? '<b>' + this.series.options.stackedName + ':</b> ' + this.point.options.stack +
            ' ~ <i>' + this.point.options.stackPercent + '%</i><br>' : ''
        ) +
            '<b>Total:</b> ' + this.point.stackTotal;
    };
    ChartsCore.prototype.DashChart = function(i, charts, w) {
        this.index = i;
        this.enabled = true;
        this.charts = charts;
        this.mountTime = new Date();
        this.selected = 0;
        this.width = w || '48.5%';
        this.elem = null;
        this.prevChart = [];

        this.loadFromArgs = function() {
            if (
                this.index !== null &&
                cas.args.charts &&
                cas.args.charts[this.index] &&
                cas.args.charts[this.index].i !== undefined
            ) {
                this.selected = parseInt(cas.args.charts[this.index].i);
            }
            return this;
        };
        this.currentChart = function() {
            this.loadFromArgs();
            if (typeof this.charts[this.selected] === 'undefined') {
                this.selected = 0;
            }
            return this.charts[this.selected];
        };

        this.alt = function() {
            this.prevChart.push({
                arg: this.chart.arg,
                val: this.chart.val
            });
            this.selected++;

            if (this.selected > (this.charts.length - 1)){
                this.selected = 0;
            }
            cas.charts.extendArgs(this.index, {i: this.selected});
            return this.update();
        };

        this.update = function() {
            this.enabled = true;
            var ch = this.currentChart();
            if (!this.elem || !$.contains(document.documentElement, this.elem[0])){
                this.elem =
                    $("<div class='dash-chart'>")
                        .data('index', i)
                        .appendTo(
                            $("<div class='chart-wrapper'>")
                                .width(this.width).appendTo('#dash-body'));
            }
            this.elem.empty();

            var self = this;
            cas.charts.downloadChart(ch, function(){
                self.chart = new cas.charts.chartFactory[ch](self).makeMenu().refresh();
            });

            return this;

        };
        this.zoomTo = function(x, zoomBox) {
            this.elem = zoomBox;

            var self = this;
            cas.charts.downloadChart(this.currentChart(),
                function(){
                    self.chart = new cas.charts.chartFactory[self.currentChart()](self);

                    self.chart.val = x.chart.val;
                    self.chart.hr_val = x.chart.hr_val;

                    self.chart.draw(x.chart.response);

                    cas.args.zoomIn = x.index;
                    cas.pushArgs();
                });

            return this;
        };
        this.histOf = function(x, zoomBox) {

            this.elem = zoomBox;
            var self = this;
            cas.charts.downloadChart(this.currentChart(),
                function(){
                    self.chart = new cas.charts.chartFactory[self.currentChart()](self);
                    self.chart.refresh();

                    cas.args.histOf = x.index;
                    cas.pushArgs();
                });
            return this;
        };
        return this;
    };
    ChartsCore.prototype.makeChartName = function(chart, opts) {
        if (chart.owner.index !== null) {
            return opts.title.text;
        } else {
            return ((dashTitle) ? dashTitle + ' - ' : '') + '<b>' + opts.title.text + '</b>' + ((typeof chart.val !== 'undefined') ? ' [' + chart.hr_val + ']' : '');
        }
    };
    ChartsCore.prototype.fetchChartData = function() {
        if(!this.owner.enabled){ return; }
        var s = {dashboard: dashboard};
        s[this.arg] = this.val;
        cas.ajaxer({
            method: 'GET',
            sendme: s,
            etc: {chart: this},
            sendto: 'dashboard/' + this.id,
            andthen: function(x) {
                x.etc.chart.draw(x);
            }
        });
        return this;
    };
    ChartsCore.prototype.multiStepChart = function(list, step) {

        var chart = this;
        if(!chart.owner.enabled){ return; }
        var s = {
            dashboard: dashboard
        };

        if (!step)
            step = 0;
        if (!$.contains(document.documentElement, chart.plot[0])){
            return false;
        }
        s.step = step;
        if (list) {
            if (chart.arg)
                s[chart.arg] = list[step - 1];
            else
                s['mes'] = list[step - 1];
        }

        cas.ajaxer({
            method: 'GET',
            sendme: s,
            etc: {
                chart: chart,
                list: list,
                step: step
            },
            sendto: 'dashboard/' + chart.id,
            andthen: function(x) {
                var list, k;
                var chart = x.etc.chart;
                if (!$.contains(document.documentElement, chart.plot[0]))
                    return false;
                if (x.etc.step === 0) {
                    if(chart.topFLags){
                        delete chart.topFLags;
                    }
                    chart.draw(x);
                    list = x.data.list;
                } else {

                    list = x.etc.list;
                    for (var j in x.data.x) {
                        if (chart.id === 'repair_timeline') {
                            chart.chartObject.series[0].addPoint(x.data.x[j], (x.etc.step + 1 > list.length || j % 25 === 0));
                            if( x.data.x[j].evCount ){
                                var flag = $.extend({},x.data.x[j]);
                                flag.title = flag.evCount+' evento'+((flag.evCount > 1)?'s':'');
                                if(!chart.topFLags){
                                    chart.topFLags = [];
                                }
                                chart.topFLags.push(flag);
                            }
                        } else {
                            if(!chart.response.series[x.data.x[j].id].data){
                                chart.response.series[x.data.x[j].id].data = [];
                            }
                            chart.response.series[x.data.x[j].id].data.push(x.data.x[j]);
                            chart.chartObject.series[x.data.x[j].id].addPoint(x.data.x[j], true, false);
                        }

                    }
                }

                x.etc.step++;
                if (x.etc.step <= list.length) {
                    setTimeout(function() {
                        chart.refresh(list, x.etc.step);
                    }, 10);
                }else if(chart.id === 'repair_timeline'){
                    var flags = chart.topFLags.sort(function(a,b){
                        return b.evCount - a.evCount;
                    }).slice(0, 25);
                    for(var findex = 0; findex<flags.length; findex++){
                        chart.chartObject.series[1].addPoint(flags[findex], (findex === flags.length - 1));
                    }
                }
            }
        });
        return this;
    };

    ChartsCore.prototype.stdNodeClick = function(event) {

        cas.args.dashboard = {
            dashboard: dashboard.dashboard,
            view: 'node',
            ind: dashboard.ind,
            item: event.point.category
        };
        cas.pushArgs();
    };
    ChartsCore.prototype.stdFileList = function() {
        cas.ajaxer({
            method: 'GET',
            etc: {
                chart: this
            },
            sendto: 'dashboard/' + this.id + "_files",
            andthen: function(x) {
                var dlg =
                    $("<ul class='xls_list_dlg'>")
                    .append("<li><h3>Lista de Extrações</h3></li>");
                for (var i in x.data.files) {
                    dlg.append(
                        "<li class='xls_list_item'>" +
                        "<span>&zwnj;</span>" +
                        "<a href='media/" +
                        ((x.etc.chart.id === 'vend_inst') ? 'xls' : 'descon') + "/" + x.data.files[i].file + "'>" +
                        x.data.files[i].name +
                        "</a>" +
                        "</li>");
                }
                cas.weirdDialogSpawn(null, dlg, null, true);
            }
        });
    };
    ChartsCore.prototype.stdDataTableConstructor = function(table, args) {
        var title = args.hr_val + ', ' + dashTitle + ': ' + table.rows.length + ' Ordens de Serviço' +
            ((args.status && args.status.length) ? ' (' + args.status.join(', ') + ')' : '');
        var container = $("<div>");
        $('<div>').appendTo('body').fullScreenDialog({
            content: container,
            title: title
        });
        var data = new google.visualization.DataTable();
        for (var i in table.cols) {
            data.addColumn(table.cols[i].type, table.cols[i].title);
        }
        data.addRows(table.rows);
        var table = new google.visualization.Table(container[0]);
        table.draw(data, {
            showRowNumber: false,
            allowHtml: true
        });
        cas.showthis('body');
    };
    ChartsCore.prototype.dialogPrint = function() {
        cas.charts.zoomChart.chart.plot.jqprint();
    };
    ChartsCore.prototype.nodeOSList = function(event) {
        if (!cas.checkPerms('b'))
            return true;

        var s = {
            dashboard: dashboard
        };

        if (this.id === 'node_dia') {
            s.t = event.point.x;
            s.interval = 'dia';
        } else {
            s.t = event.point.category;
            s.interval = 'mes';
        }


        cas.hidethis('body');
        cas.ajaxer({
            method: 'GET',
            sendme: s,
            sendto: 'dashboard/node_os_list',
            andthen: function(x) {
                var t = x.data.table;
                if (typeof google.visualization === 'undefined') {
                    cas.charts.tbloader(function() {
                        stdDataTableConstructor(t, {
                            hr_val: x.data.interval
                        });
                    });
                } else {
                    stdDataTableConstructor(t, {
                        hr_val: x.data.interval
                    });
                }
            }
        });
    };
    ChartsCore.prototype.resetEvents = function(chart){
        if(!chart.opts || !chart.opts.plotOptions){
            return;
        }
        _.forEach(chart.opts.plotOptions, function(series){
            series.events = {};
        });
    };
    
    ChartsCore.prototype.findOwner = function($this) {
        var index = parseInt($this.closest('.dash-chart').data('index'));
        var x = cas.charts.chartView();
        return x[index];
    };
    
    ChartsCore.prototype.extendArgs = function(index, n){
        if(!cas.args.charts[index]){
            cas.args.charts[index] = {};
        }
        _.merge(cas.args.charts[index], n);
        if(Object.keys(n).length){
            cas.pushArgs();
        }
    };
    ChartsCore.prototype.mesSelect = function() {
        var item = cas.charts.findOwner($(this));

        item.chart.val = $(this).val();
        item.chart.hr_val = $(this).find('option:selected').text();
        cas.charts.extendArgs(item.index, {x: item.chart.val});
        item.chart.refresh();

    };
    ChartsCore.prototype.acompStatusSelect = function() {
        var item = cas.charts.findOwner($(this));

        item.chart.val = $(this).val();
        item.chart.hr_val = $(this).find('option:selected').text();
        cas.charts.extendArgs(item.index, {x: item.chart.val});
        item.chart.refresh();

    };
    ChartsCore.prototype.diaSelect = function() {
        var item = cas.charts.findOwner($(this));

        item.chart.val = $(this).val();
        item.chart.hr_val = item.chart.val;
        cas.charts.extendArgs(item.index, {x: item.chart.val});
        item.chart.refresh();

    };
    
    ChartsCore.prototype.initPlot = function(chart, item){
        item.elem.find('.chart-plot').remove();
        chart.plot = $("<div class='chart-plot'>");

        var menu = item.elem.find('.chart-menu');
        if (menu.length) {
            chart.plot.insertBefore(menu);
        } else {
            chart.plot.appendTo(item.elem);
        }
    };
    ChartsCore.prototype.initMenu = function(chart, item){
        item.elem.find('.chart-menu').remove();
        chart.menu = $("<div class='chart-menu'>");

        var plot = item.elem.find('.chart-plot');
        if (plot.length) {
            chart.menu.insertAfter(plot);
        } else {
            chart.menu.appendTo(item.elem);
        }
    };
    ChartsCore.prototype.menuOpts = function() {
        var chart = this;
        if (chart.controls !== null) {
            cas.charts.initMenu(chart, chart.owner);
            var def = ['f5','zoom'];
            if (chart.arg){
                def = ['selector_' + chart.arg].concat(def);
            }
            if (chart.hist){
                def = ['hist'].concat(def);
            }
            if (chart.info){
                def = ['info'].concat(def);
            }
            if (cas.checkPerms('b') && typeof chart.exportMe === 'function'){
                def = ['export_bt'].concat(def);
            }
            if (chart.owner.charts.length > 1){
                def = ['alt_chart'].concat(def);
            }
            chart.controls = chart.controls.concat(def);

            for (var i in chart.controls) {
                cas.charts.makeControl(chart.controls[i], chart);
            }
        }
        return this;
    };
    ChartsCore.prototype.altChart = function() {
        var item = cas.charts.findOwner($(this));
        item.alt();
    };
    ChartsCore.prototype.zoomToChart = function(item) {
        if (!item.chart || !item.chart.response){
            return false;
        }

        $('#chartZoom').remove();
        var zoomBox =
            $("<div id='chartZoom'>").appendTo('body').fullScreenDialog({
                content: $("<div class='chart-zoomed'>"),
                buttons: item.chart.dialogBts,
                onClose: function() {
                    delete cas.args.zoomIn;
                    cas.pushArgs();
                }
            });

        zoomChart =
            new this.DashChart(null, [item.chart.id], '100%')
            .zoomTo(item, zoomBox.find('.chart-zoomed'));


    };
    ChartsCore.prototype.f11 = function(item){
        if (!item.chart || !item.chart.response || !item.chart.plot) {
            return false;
        }
        var chart = item.chart, elem = item.chart.plot[0];

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
        /*
        $(document).one('mozfullscreenchange fullscreenchange webkitfullscreenchange', function(){
            if ( document.mozFullScreenElement || document.webkitCurrentFullScreenElement || document.fullscreenElement ) {
                $(elem).width('100%').height('100%');
                $(document).one('mozfullscreenchange fullscreenchange webkitfullscreenchange', function(){
                    $(elem).css('width', '').css('height', '');
                });
            }
        });*/
    };
    ChartsCore.prototype.showHist = function(item) {
        if (!item.chart || !item.chart.response)
            return false;

        $('#chartZoom').remove();
        var zoomBox =
            $("<div id='chartZoom'>").appendTo('body').fullScreenDialog({
                content: $("<div class='chart-zoomed'>"),
                buttons: [{
                    title: "Imprimir",
                    action: cas.charts.dialogPrint
                }],
                onClose: function() {
                    delete cas.args.histOf;
                    cas.pushArgs();
                }
            });

        zoomChart =
            new this.DashChart(null, [item.chart.id + '_hist'], '100%')
                .histOf(item, zoomBox.find('.chart-zoomed'));
    };
    ChartsCore.prototype.stdDownloadXLS = function(x) {
        cas.showthis('body');
        window.location.href = 'media/xls/' + x.data.fname;
    };
    ChartsCore.prototype.stdArgs = function(x) {
        var s = this.chartObject.getSelectedPoints(),
            sts = [];
        for (var i in s)
            sts.push(s[i].name);
        var x = {
            status: sts,
            dashboard: dashboard
        };
        if (this.arg)
            x[this.arg] = this.val;
        return x;
    };

    ChartsCore.prototype.exportClick = function() {
        var item = cas.charts.findOwner($(this));
        item.chart.exportMe();
    };
    ChartsCore.prototype.dataTableClick = function() {
        var item = cas.charts.findOwner($(this));
        item.chart.dataTable();
    };
    ChartsCore.prototype.f5Click = function() {
        var me = $(this);
        var item = cas.charts.findOwner(me);
        item.chart.refresh();
    };
    ChartsCore.prototype.zoomClick = function() {
        var item = cas.charts.findOwner($(this));
        if(!item || !item.chart)
            return;
        if(item.chart.autoupdate){
            cas.charts.f11(item);
        }else{
            cas.charts.zoomToChart(item);
        }

    };
    ChartsCore.prototype.histClick = function() {
        var item = cas.charts.findOwner($(this));
        cas.charts.showHist(item);
    };
    ChartsCore.prototype.infoClick = function() {
        var item = cas.charts.findOwner($(this));
        item.chart.fetchInfo();
    };
    ChartsCore.prototype.makeControl = function(control, chart) {

        var defSelect = function(chart) {
            if (cas.args.charts 
                && cas.args.charts[chart.owner.index] 
                && cas.args.charts[chart.owner.index].x !== undefined
            ) {
                chart.val = cas.args.charts[chart.owner.index].x;
                return;
            }

            var l = chart.owner.prevChart,
                changed = false;
            for (var i = l.length - 1; i >= 0; i--) {
                if (l[i].arg === chart.arg) {
                    chart.val = l[i].val;
                    changed = true;
                    break;
                }
            }
            if (!changed) {
                if (chart.arg_def){
                    chart.val = chart.arg_def;
                }else{
                    chart.val = cas.charts.chartSelector[chart.arg].x;
                }
            } else if (chart.val !== cas.charts.chartSelector[chart.arg].x) {
                cas.charts.extendArgs(chart.owner.index, {x: chart.val});
            }
        };
        var findAltIcon = function(from, to) {
            for (var i in cas.charts.altIcon)
                if (cas.charts.altIcon[i].from === from && cas.charts.altIcon[i].to === to)
                    return cas.charts.altIcon[i];

            return null;
        };
        var x = {
            alt_chart: function(chart) {
                var me = $("<span class='chart-menu-item chart-menu-button chart-alt' " +
                    "title='Alternar entre gráficos'>&zwnj;</span>")
                    .click(cas.charts.altChart).appendTo(chart.menu);

                var from = chart.id, i = chart.owner.selected;
                i++;
                if (i > (chart.owner.charts.length - 1)) {
                    i = 0;
                }
                var to = chart.owner.charts[i];

                function setIcon(){
                    var alt = findAltIcon(from, to);
                    if (alt){
                        me.addClass(alt.cssClass).attr('title', alt.title);
                    }
                }

                if(cas.charts.altIcon === null){    
                    $.getJSON('/lib/json/dashboard.charts.alt.icons.json', function(data){
                        cas.charts.altIcon = data;
                        setIcon();
                    });
                    return;
                }
                setIcon();

            },
            data_table: function(chart) {
                return $("<span class='chart-menu-item chart-menu-button chart-data-table'>&zwnj;</span>")
                    .click(cas.charts.dataTableClick).appendTo(chart.menu);
            },
            export_bt: function(chart) {
                return $("<span class='chart-menu-item chart-menu-button chart-export'>&zwnj;</span>")
                    .click(cas.charts.exportClick).appendTo(chart.menu);
            },
            hist: function(chart) {
                return $("<span class='chart-menu-item chart-menu-button chart-hist'>&zwnj;</span>")
                    .click(cas.charts.histClick).appendTo(chart.menu);
            },
            info: function(chart) {
                return $("<span class='chart-menu-item chart-menu-button chart-info'>&zwnj;</span>")
                    .click(cas.charts.infoClick).appendTo(chart.menu);
            },
            f5: function(chart){
                return $("<span class='chart-menu-item chart-menu-button chart-f5'>&zwnj;</span>")
                    .click(cas.charts.f5Click).appendTo(chart.menu);
            },
            zoom: function(chart) {
                return $("<span class='chart-menu-item chart-menu-button chart-zoom'>&zwnj;</span>")
                    .click(cas.charts.zoomClick).appendTo(chart.menu);
            },
            selector_mes: function(chart) {

                var x = $("<select class='chart-menu-item selector_mes'>")
                    .change(cas.charts.mesSelect).appendTo(chart.menu);

                chart.val = null;
                if (cas.charts.chartSelector.mes) {
                    defSelect(chart);
                    for (var i in cas.charts.chartSelector.mes.l) {
                        x.append("<option value='" + cas.charts.chartSelector.mes.l[i].value + "'>" +
                            cas.charts.chartSelector.mes.l[i].label +
                            "</option>");
                    }

                    if (chart.id === 'ass_rank')
                        x.prepend("<option value='Corrente'>Corrente</option>");

                    x.val(chart.val);
                    chart.hr_val = x.find('option:selected').text();
                }

            },
            selector_acomp_status: function(chart) {

                var x = $("<select class='chart-menu-item selector_acomp_status'>")
                    .change(cas.charts.acompStatusSelect).appendTo(chart.menu);

                chart.val = null;
                if (cas.charts.chartSelector.acomp_status) {
                    defSelect(chart);
                    for (var i in cas.charts.chartSelector.acomp_status.l) {
                        x.append("<option value='" + cas.charts.chartSelector.acomp_status.l[i].value + "'>" +
                            cas.charts.chartSelector.acomp_status.l[i].label +
                            "</option>");
                    }

                    if (chart.id === 'ass_rank')
                        x.prepend("<option value='Corrente'>Corrente</option>");

                    x.val(chart.val);
                    chart.hr_val = x.find('option:selected').text();
                }

            },
            selector_dia: function(chart) {

                var x =
                    $("<input type='text' class='chart-menu-item selector_dia' />")
                    .change(cas.charts.diaSelect).appendTo(chart.menu)
                    .datepicker({
                        dateFormat: 'yy-mm-dd',
                        maxDate: 0
                    });

                chart.val = null;
                defSelect(chart);
                x.val(chart.val);
                chart.hr_val = chart.val;
            }
        };
        if (typeof x[control] === 'function') {
            x[control](chart);
        }
    };
    ChartsCore.prototype.killChartView = function(chartList){
        if(!chartList){ return; }
        _.forEach(chartList, function(chart){
            if(!chart){ return; }
            if(chart.enabled !== undefined){
                chart.enabled = false;
            }else{
                cas.charts.killChartView(chart);
            }
        });
    };
    ChartsCore.prototype.chartView = function(units) {

        if (units) {
            for (var i in units) {
                var unit = new cas.charts.DashChart(i, units[i][0], units[i][1] + '%');
                units[i] = unit;
            }
        }
        var chartTree = this.chartTree;

        if (dashboard.view === 'monitor') {
            try {
                if (!chartTree[dashboard.dashboard]) {
                    chartTree[dashboard.dashboard] = {};
                }
                if (!chartTree[dashboard.dashboard]['monitor']) {
                    chartTree[dashboard.dashboard]['monitor'] = units;
                }
                return chartTree[dashboard.dashboard]['monitor'];
            } catch (e) {
                return null;
            }
        } else {
            try {

                if (!chartTree[dashboard.dashboard])
                    chartTree[dashboard.dashboard] = {};

                if (!chartTree[dashboard.dashboard][dashboard.ind])
                    chartTree[dashboard.dashboard][dashboard.ind] = {};

                if (!chartTree[dashboard.dashboard][dashboard.ind][dashboard.view])
                    chartTree[dashboard.dashboard][dashboard.ind][dashboard.view] = units;

                return chartTree[dashboard.dashboard][dashboard.ind][dashboard.view];
            } catch (e) {
                return null;
            }
        }
    };
    cas.charts = new ChartsCore();
}());