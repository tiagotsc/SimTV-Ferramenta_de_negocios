(function(){
    
    var _id = 'siga_conns',
        _parent = 'cache_perf',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.cache_perf(x);
        chart.id = 'siga_conns';
        chart.opts.legend = {enabled: false};
        chart.opts.tooltip = {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
        };
        chart.opts.title.text = 'Conexões com o Siga';
        chart.autoupdate = getRandomInt(40,50) * 1000;
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());