(function(){
    
    var _id = 'motivo_rank',
        _parent = 'std_col_pie',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.std_col_pie(x);
        chart.orientation = 'down';
        chart.arg = 'dia';
        chart.limitX = true;
        chart.id = 'motivo_rank';
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());