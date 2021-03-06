(function(){
    
    var _id = 'per_mon_timeline',
        _parent = 'std_line',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.std_line(x);
        chart.arg = 'dia';
        chart.orientation = 'down';
        chart.stock = true;
        chart.id = 'per_mon_timeline';
        chart.opts.title.text = 'Contagem de Nodes';
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());