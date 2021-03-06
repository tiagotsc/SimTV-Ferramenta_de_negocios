(function(){
    
    var _id = 'ass_recs',
        _parent = 'std_list',
        cas = window.cas,

        google = window.google,
        chartFactory = cas.charts.chartFactory;
    
    function ChartConstructor(x) {
        var chart = new chartFactory.std_list(x);
        chart.id = 'ass_recs';
        chart.draw = function(response) {
            if(!this.owner.enabled){ return; }
            if (!$.contains(document.documentElement, this.plot[0]))
                return false;
            this.plot.html('<h4>Histórico de Reclamações</h4>');
            this.response = response;
            var me = this;
            var makeTB = function(table) {
                var data = new google.visualization.DataTable();
                for (var i in table.cols) {
                    data.addColumn(table.cols[i].type, table.cols[i].title);
                }
                data.addRows(table.rows);
                var t = new google.visualization.Table($('<div>').appendTo(me.plot)[0]);
                t.draw(data, {
                    showRowNumber: false,
                    allowHtml: true
                });
            };

            if (typeof google.visualization === 'undefined') {
                cas.charts.tbloader(function() {
                    makeTB(response.data.table);
                });
            } else {
                makeTB(response.data.table);
            }
            var list = response.data.table.rows;
            if (this.menu) {
                //contagem
                var abc = list.length + " Reclamações";
                this.menu.find('.ass_count').remove();
                $("<div class='ass_count'>").html(abc).appendTo(this.menu);
            }
            //---------------------------------------
            return this;
        };
        return chart;
    };
    
    chartFactory[_id] = new cas.charts.ChartPlaceHolder(_id, _parent, ChartConstructor);
}());