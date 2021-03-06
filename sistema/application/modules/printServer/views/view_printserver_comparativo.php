<?php
echo link_tag(array('href' => 'assets/css/css_dashboard_call.css', 'rel' => 'stylesheet', 'type' => 'text/css'));
echo link_tag(array('href' => 'assets/componentes/datepicker/css/datepicker.css',
    'rel' => 'stylesheet', 'type' => 'text/css'));
echo "<script type='text/javascript' src='" .
 base_url('assets/componentes/datepicker/js/bootstrap-datepicker.js') . "'></script>";

//header('Content-Type: text/html; charset=UTF-8');

$this->session->set_userdata('current_menu_ps', 2);
?>

<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>

<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

<div class="col col-md-12 md-offset-3 col-sm-3 main">

    <div class="row-fluid col col-md-10">

        <ol class="breadcrumb">
            <li><a href="<?php echo base_url('home/inicio'); ?>">Principal</a></li>
            <li class="active">Dashboard / Print Server</li>
        </ol>

        <div class="row">
            <div class="col-md-11">
                <div class="panel panel-primary">
                    <div class="panel-heading text-center">
                        <!--<h3 id="tituloImpressao" class="panel-title">Acompanhamento de Impress&atildeo</h3>-->
                        <h3 id="tituloImpressao" class="panel-title">VAR JQUERY</h3>
                    </div>
                    <div class="panel-body">
                        <div class="row center-block">
                            <div id="graphPrintServer"><div class="preloader">&nbsp;</div></div>
                        </div>
                        <div class="row">
                            <div id=""></div>
                        </div>
                    </div>
                    <div class="panel-footer">
                        <div id="dataRelatorio" class="row center">
                            <div class="col-md-4">
                                <input class="input-append form-control" value="" id="dpd1" type="text" placeholder="De" readonly>
                            </div>

                            <div class="col-md-4">
                                <input class="input-append form-control" value="" id="dpd2" type="text" placeholder="At&eacute" readonly>
                            </div>

                            <div class="col-md-4">
                                <button id="gerarResultado" type="button" class="btn btn-primary">Gerar Gr&aacutefico</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


<script type="text/javascript">
    $('.abaIndicadores').hide();
    $('.menuIndicadores').hide();
    $('.alert-warning').hide();
    $('#conteudo').removeClass('container');
    $('#conteudo').addClass('container-fluid');</script>

<script type="text/javascript">
    var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
    var checkin = $('#dpd1').datepicker({
//        onRender: function (date) {
//            return date.valueOf() < now.valueOf() ? 'disabled' : '';
//        },
        format: 'dd/mm/yyyy'
    }).on('changeDate', function (ev) {
        if (ev.date.valueOf() > checkout.date.valueOf()) {
            var newDate = new Date(ev.date);
            newDate.setDate(newDate.getDate());
            checkout.setValue(newDate);
        }
        checkin.hide();
        $('#dpd2')[0].focus();
    }).data('datepicker');
    var checkout = $('#dpd2').datepicker({
        format: 'dd/mm/yyyy'
    }).on('changeDate', function (ev) {
        checkout.hide();
    }).data('datepicker');</script>

<script type="text/javascript">
    var chart_data;
//    google.charts.load('current', {'packages': ['corechart']});
//    google.charts.setOnLoadCallback(load_page_data);
    google.charts.load('current', {'packages': ['corechart', 'bar']});
    google.charts.setOnLoadCallback(load_page_data);
//Escolha do Gráfico em Google Chart:
    function drawChart(chart_data) {
        var chart1_data = new google.visualization.DataTable(chart_data);
        //var chart1_data = chart_data;
        var chart1_options = {
//            seriesType: 'bars',
            bars: 'horizontal',
//            focusTarget: 'category',
//            isStacked: 'percent',
//            legend: {position: 'top', 'alignment': 'center'}
            title: 'Total impressos:',
            legend: {position: 'none'}
        };
//        var chart1_chart = new google.visualization.ComboChart(document.getElementById('graphPrintServer'));
        var chart1_chart = new
                google.visualization.ColumnChart(document.getElementById('graphPrintServer'));
        chart1_chart.draw(chart1_data, chart1_options);
    }

//Função do botão "Gerar Gráfico":
    $("#gerarResultado").click(function () {

        $(".preloader").show();
        var dataI = $('#dpd1').val();
        var dataF = $('#dpd2').val();
        if (dataI === "" || dataF === "") {
            load_page_data(dataInicio = '', dataFinal = '');
        } else {
            var arrInicio = dataI.split('/');
            var arrFinal = dataF.split('/');
            var dataInicio = arrInicio[2] + "-" + arrInicio[1] + "-" + arrInicio[0];
            var dataFinal = arrFinal[2] + "-" + arrFinal[1] + "-" + arrFinal[0];
            //alert ( dataInicio );
            load_page_data(dataInicio, dataFinal);
        }
    });
//Carrega como padrão os parâmetros de "DataInicio" e "DataFinal" para chamada do Ajax:
    function load_page_data(dataInicio = '', dataFinal = ''){
        $("#graphPrintServer").empty();
        if (dataFinal) {

        } else {
            var d = new Date();
            var dia = (("0" + d.getDate()).slice(-2)) - 1;
            var mes = ("0" + (d.getMonth() + 1)).slice(-2);
            var ano = d.getFullYear();
            dataInicio = ano + "-" + mes + "-" + dia;
            dataFinal = ano + "-" + mes + "-" + dia;
            //alert( dataInicio );
        }

//Criando título com variável "DE" e "ATÉ":

        var tituloImp = 'Acompanhamento Geral';
        if (dataInicio === dataFinal) {
            $('#tituloImpressao').text(tituloImp + ' D-1 <' + dataInicio + '>');
        } else {
            $('#tituloImpressao').text(tituloImp + '   de: (' + dataInicio + ')' + ' ate: (' + dataFinal + ')');
        }
        ;


//Ajax captura as informações do JSON + parâmetros do DatePicker:
        var jsonData = $.ajax({
            url: "/sistema/dashboard/printserver/dadosGraficoPrintServer/" + dataInicio + "/" + dataFinal,
            dataType: "json",
            async: false
        }).responseText;

        drawChart(jsonData);

    }

</script>