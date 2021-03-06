(function(){
    
    var _id = 'causa_rank_by_node_hist',
        _parent = 'causa_rank_hist',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.causa_rank_hist(x);
        chart.id = 'causa_rank_by_node_hist';
        chart.orientation = 'down';
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());