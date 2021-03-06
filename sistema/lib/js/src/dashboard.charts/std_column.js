(function(){
    
    var _id = 'std_column',
        _parent = 'std',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        chartFactory[_parent].call(this, x);
        this.opts = {
            title: {
                text: null
            },
            chart: {
                renderTo: this.plot[0],
                type: 'column'
            },
            xAxis: {
                labels: {
                    rotation: -45,
                    y: 20
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: null
                },
                labels: {}
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            tooltip: {},
            plotOptions: {
                series: {marker: {enabled: false},dataLabels:{enabled: false},events:{}},
                areaspline: {marker: {enabled: false},dataLabels:{enabled: false},events:{}},
                spline: {
                    color: '#BE0000',
                    events:{}
                },
                column: {
                    cursor: 'pointer',
                    pointPadding: 0.2,
                    borderWidth: 0,
                    events:{}
                }
            }
        };
        return this;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());