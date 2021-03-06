(function(){
    
    var _id = 'cep_rank_by_node',
        _parent = 'std_column',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.std_column(x);
        chart.id = 'cep_rank_by_node';
        chart.orientation = 'down';
        chart.opts.yAxis.allowDecimals = false;
        chart.opts.yAxis.title = {
            text: 'Nº de Reclamações'
        };
        chart.opts.xAxis.labels = {
            enabled: false
        };
        chart.opts.scrollbar = {
            enabled: true
        };

        chart.opts.plotOptions.series.events = {
            click: function(event) {
                if (!cas.checkPerms('b'))
                    return true;

                var $this = this.chart.owner;
                var s = {
                    cep: event.point.cep,
                    dashboard: dashboard
                };

                if ($this.arg)
                    s[$this.arg] = $this.val;

                cas.hidethis('body');
                cas.ajaxer({
                    method: 'GET',
                    etc: {
                        s: {
                            hr_val: $this.hr_val,
                            status: ['CEP: ' + event.point.cep]
                        }
                    },
                    sendme: s,
                    sendto: 'dashboard/' + $this.id + '_dtb',
                    andthen: function(x) {
                        var t = x.data.table;
                        if (typeof google.visualization === 'undefined') {
                            cas.charts.tbloader(function() {
                                cas.charts.stdDataTableConstructor(t, x.etc.s);
                            });
                        } else {
                            cas.charts.stdDataTableConstructor(t, x.etc.s);
                        }
                    }
                });
            }
        };
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());