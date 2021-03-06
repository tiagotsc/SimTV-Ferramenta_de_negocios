(function(){
    
    var _id = 'cad_inst_diff_hist',
        _parent = 'std_line',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.std_line(x);
        chart.id = 'cad_inst_diff_hist';
        chart.arg = 'mes';
        chart.orientation = 'down';
        chart.refresh = cas.charts.multiStepChart;

        chart.opts.tooltip = {
            shared: true,
            crosshairs: true,
            valueSuffix: '%',
            formatter: function() {
                var output = this.points;
                output.sort(function(a, b) {
                    if (a.y > b.y) {
                        return -1;
                    } else if (a.y < b.y) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                var result = '';
                for (var x in output) {
                    result +=  "<b>" + output[x].series.name + ":</b> " + output[x].y +
                        " <i>~" + output[x].point.instals  + ((output[x].point.instals > 1)
                            ?" instalações":' instalação')+"</i><br>";
                }
                return '<b>' + this.x + '</b><br/>' + result;
            }
        };
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());