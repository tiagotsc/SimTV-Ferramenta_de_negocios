(function(){
    
    var _id = 'cja_clean_semana',
        _parent = 'cja_semana',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.cja_semana(x);
        chart.id = 'cja_clean_semana';
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());