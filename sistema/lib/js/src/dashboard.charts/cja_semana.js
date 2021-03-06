(function(){
    
    var _id = 'cja_semana',
        _parent = 'cja_hist',
        cas = window.cas,
        dashTitle = window.dashTitle,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.cja_hist(x);
        delete chart.opts.xAxis.plotLines;
        chart.id = 'cja_semana';

        chart.opts.tooltip.formatter = function(event) {
            var htm = '<b>' + this.point.category + '</b><br>';
            for (var i in this.point.options.totals) {
                var t = this.point.options.totals[i];
                htm += '<b>' + t.name + ':</b> ' + t.total + ' ordens ' + ((t.percent) ? '<i> ~' + t.percent + '%</i>' : '') + '<br>';
            }
            return htm;
        };

        chart.opts.plotOptions.series.events.click = function(event) {
            var id = dashboard.item.split(':');
            var s = {
                id: event.point.series.options.id,
                area: id[0],
                dia: event.point.options.dia
            };
            if (event.point.options.tipo)
                s.tipo = event.point.options.tipo;

            cas.hidethis('body');
            cas.ajaxer({
                sendme: s,
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
                        title: dashTitle + ' - ' + event.point.series.name +
                            ', ' + event.point.category + ': ' +
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

        chart.list_arg = 'dia';
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());