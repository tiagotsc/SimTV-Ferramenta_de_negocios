(function(){
    
    var _id = 'std_list',
        _parent = null,
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        cas.charts.initPlot(this, x);
        this.plot.css('min-height', 400);
        if(x.index !== null){
            this.plot.css('overflow-x','auto').css('overflow-y','auto');
        }
        this.arg = null;
        this.refresh = cas.charts.fetchChartData;
        this.makeMenu = cas.charts.menuOpts;
        this.dialogBts = [{
            title: "Imprimir",
            action: cas.charts.dialogPrint
        }];
        this.controls = [];
        this.owner = x;
        return this;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());