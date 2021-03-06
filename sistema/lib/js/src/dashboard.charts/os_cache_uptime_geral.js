(function(){
    
    var _id = 'os_cache_uptime_geral',
        _parent = 'os_cache_uptime_status',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.os_cache_uptime_status(x);
        chart.id = 'os_cache_uptime_geral';
        chart.opts.legend = {enabled: false};
        delete chart.opts.tooltip;
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());