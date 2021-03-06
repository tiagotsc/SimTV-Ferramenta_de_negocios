(function(){
    
    var _id = 'tbo_detail',
        _parent = 'std_column',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.std_column(x);
        chart.id = 'tbo_detail';
        chart.orientation = 'greenup';
        chart.opts.chart.zoomType = 'xy';
        chart.opts.yAxis.labels = {
            format: '{value}%'
        };
        chart.opts.legend = {
            backgroundColor: 'white',
            enabled: (chart.owner.index === null),
            layout: 'vertical',
            verticalAlign: 'middle',
            align: 'right'
        };
        chart.opts.plotOptions.column.stacking = 'percent';
        chart.opts.tooltip = {
            pointFormat: 
                '<b>{series.name}:</b> {point.y} ordens <i>~{point.options.percent}%</i><br>'+
                '<b>{series.options.stackedName}:</b> {point.options.total} ordens <i>~{point.options.stackPercent}%</i>'
        };
        function TBOPlotTb(x){
            var point = x.etc.point;
            cas.showthis('body');
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
                title: 
                    ((point.options.level === 0)
                        ?point.name
                        :"<a href='dashboard#" +
                            cas.hashbangify({
                                dashboard: {
                                    dashboard: dashboard.dashboard,
                                    view: 'cidade',
                                    ind: 'tbo',
                                    item: point.category
                                }
                            }) + "'>" + point.name + "</a>"
                    ) +
                    ' - ' + point.series.name +
                    ', ' + point.series.chart.owner.hr_val + ': ' +
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
        chart.opts.plotOptions.series.events.click = function(event) {
            var point = event.point;
            var chart = this.chart.owner;

            if(point.series.name === 'Meta'){
                return;
            }

            if (!event.ctrlKey) {
                if( point.options.level === 0 ){
                    if(chart.owner.index === null){
                        return;
                    }
                    var cluster = point.options.cluster;
                    var alt = chart.response.alt;
                    alt.name = chart.response.name + ' [ ' + point.name + ' ]';
                    delete chart.response.alt;
                    delete chart.response;

                    var dead = [];
                    alt.series = alt.series.map(function(series){
                        series.data = series.data.filter(function(a){
                            if( cluster === 'SIM' || a.cluster === cluster || a.cluster === 'SIM'){
                                return true;
                            }
                            dead.push(a.abbr);
                            return false;
                        });
                        return series;
                    });

                    alt.categories = alt.categories.filter(function(category){
                        return dead.indexOf(category) === -1;
                    });

                    chart.response = alt;
                    chart.draw({data:chart.response});

                    if(!chart.menu){
                        return;
                    }

                    var bt = chart.menu.find('.chart-f5')
                        .attr('title','Voltar').addClass('chart-goback')
                        .one('click', function(){
                            $(this).removeClass('chart-goback').removeAttr('title');
                        });
                    chart.plot.effect('transfer', {to: bt}, 700);
                    return;
                }
                cas.args.dashboard = {
                    dashboard: dashboard.dashboard,
                    view: 'cluster',
                    ind: 'tbo',
                    item: point.options.cluster
                };
                cas.pushArgs();
                return;
            }

            cas.hidethis('body');
            cas.ajaxer({
                sendme: {
                    from: point.series.options.from,
                    to: point.series.options.to,
                    area: point.category,
                    mes: this.chart.owner.val
                },
                etc: {point: point},
                method: 'GET',
                sendto: 'dashboard/tbo_oslistget',
                andthen: TBOPlotTb
            });
        };
        chart.arg = 'mes';
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());