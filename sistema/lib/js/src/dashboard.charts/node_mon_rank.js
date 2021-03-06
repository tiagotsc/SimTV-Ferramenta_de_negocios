(function(){
    
    var _id = 'node_mon_rank',
        _parent = 'std_column',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.std_column(x);
        chart.limitX = true;
        chart.orientation = 'down';
        chart.id = 'node_mon_rank';
        chart.opts.title.text = 'Nodes Ofensores';
        chart.opts.plotOptions.series.events.click = cas.charts.stdNodeClick;
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());