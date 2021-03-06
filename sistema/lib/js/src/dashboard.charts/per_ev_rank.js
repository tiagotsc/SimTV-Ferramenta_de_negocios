(function(){
    
    var _id = 'per_ev_rank',
        _parent = 'std_column',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.std_column(x);
        chart.id = 'per_ev_rank';
        chart.orientation = 'down';
        chart.opts.title.text = 'Eventos Massivos';
        chart.opts.plotOptions.series.events.click = function(event) {
            if(event.ctrlKey && cas.checkPerms('e')){
                var s = this.chart.owner.val.split('-'), 
                    y = parseInt(s[0]), 
                    m = parseInt(s[1]) - 1;
                var from = new Date(y, m, 1),
                    to = new Date(y, m+1, 1);
                var filter = {
                    filter:{
                        l: [event.point.category],
                        s: ["pendente","dc","fechado","he","ativo","re","ri","noc"],
                        t: ["emergencia","canal","geral","mdu","node"], 
                        d: {
                            from: from.toYMD(),
                            to: to.toYMD()
                        }
                    }
                };
                window.open('eventos#'+cas.hashbangify(filter));
                return;
            }
            cas.args.dashboard = {
                dashboard: dashboard.dashboard,
                view: 'cidade',
                ind: 'ev',
                item: event.point.category
            };
            cas.pushArgs();
        };
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());