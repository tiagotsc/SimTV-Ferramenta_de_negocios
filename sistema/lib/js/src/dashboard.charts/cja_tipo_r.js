(function(){
    
    var _id = 'cja_tipo_r',
        _parent = 'cja',
        cas = window.cas,
        dashTitle = window.dashTitle,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.cja(x);
        cas.charts.resetEvents(chart);
        delete chart.opts.yAxis;
        delete chart.opts.xAxis;
        delete chart.opts.plotOptions.column;
        chart.hist = true;
        chart.opts.chart.type = 'pie';
        chart.ostipo = 'reclamação';

        chart.opts.legend = {
            backgroundColor: 'white',
            enabled: (chart.owner.index === null),
            layout: 'vertical',
            verticalAlign: 'middle',
            align: 'right'
        };

        chart.opts.plotOptions.series.events.click = function(event) {
            if(event.point.series.name === 'Meta')
                return true;
            if (!event.ctrlKey)
                return true;

            cas.hidethis('body');
            cas.ajaxer({
                sendme: {
                    id: event.point.options.id,
                    area: dashboard.item,
                    mes: this.chart.owner.val,
                    tipo: this.chart.owner.ostipo
                },
                etc: {
                    event: event
                },
                method: 'GET',
                sendto: 'dashboard/cja_oslistget',
                andthen: function(x) {
                    cas.showthis('body');
                    var event = x.etc.event;
                    var table = x.data.table;

                    var makeTB = function(table, container) {
                        var data = new google.visualization.DataTable();
                        for (var i in table.cols) {
                            data.addColumn(table.cols[i].type, table.cols[i].title);
                        }
                        data.addRows(table.rows);
                        var t = new google.visualization.Table(container);
                        t.draw(data, {
                            showRowNumber: false,
                            allowHtml: true
                        });
                    };

                    var container = $("<div>");
                    $('<div>').appendTo('body').fullScreenDialog({
                        content: container,
                        title: dashTitle + ' - ' + event.point.name +
                            ', ' + event.point.series.chart.owner.hr_val + ': ' +
                            table.rows.length + ' Ordens'
                    });

                    if (typeof google.visualization === 'undefined') {
                        cas.charts.tbloader(function() {
                            makeTB(table, container[0]);
                        });
                    } else {
                        makeTB(table, container[0]);
                    }
                }
            });
        };

        chart.opts.tooltip.formatter = function(event) {
            if (this.point.series.name === 'Meta') {
                return "<b>" +
                    ((this.point.name) ? this.point.name : this.point.series.name) +
                    ":</b> " + this.y + '%';
            }

            var htm = '<b>' + this.point.name + '<i> ~' +
                cas.roundNumber(this.point.percentage, 2) +
                '%</i></b><br>';
            for (var i in this.point.options.totals) {
                var t = this.point.options.totals[i];
                htm += '<b>' + t.name + ':</b> ' + t.total + ' ordens ' + ((t.percent) ? '<i> ~' + t.percent + '%</i>' : '') + '<br>';
            }
            return htm;
        };

        chart.opts.plotOptions.pie = {
            allowPointSelect: false,
            cursor: 'pointer',
            showInLegend: true
        };

        chart.id = 'cja_tipo_r';
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());