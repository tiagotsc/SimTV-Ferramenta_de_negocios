(function(){
    
    var _id = 'repair_timeline',
        _parent = 'std_line',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.std_line(x);
        chart.arg = null;
        chart.stock = true;
        chart.orientation = 'down';
        chart.refresh = cas.charts.multiStepChart;
        chart.id = 'repair_timeline';
        chart.opts.rangeSelector.selected = 0;
        chart.opts.legend.enabled = false;
        chart.opts.rangeSelector.buttons =
            [{
            type: 'day',
            count: 15,
            text: '15d'
        }, {
            type: 'month',
            count: 3,
            text: '3m'
        }, {
            type: 'month',
            count: 6,
            text: '6m'
        }, {
            type: 'all',
            text: 'Tudo'
        }];

        chart.opts.plotOptions = {
            line:{
                tooltip: {
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} </b><br/>'+
                        '<i>Eventos massivos: {point.options.evCount} </i>'
                }
            },
            series: {
                marker: {
                    enabled: false
                },
                events: {
                    click: function(event){
                        var filter = {
                            filter:{
                                l: [],
                                s: ["pendente","dc","fechado","he","ativo","re","ri","noc"],
                                t: ["emergencia","canal","geral","mdu","node"], 
                                d: {
                                    from: event.point.options.dia,
                                    to: event.point.options.dia
                                }
                            }
                        };
                        if(event.point.options.pers){
                            filter.filter.l = event.point.options.pers;
                        }
                        window.open('eventos#'+cas.hashbangify(filter));
                    }
                }
            }
        };
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());