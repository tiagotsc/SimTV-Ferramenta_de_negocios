$('#my').multiSelect();

$('#observacaoEquip').on('keyup',function(){
    var v = $(this).val().length;
    $('#contador').html(250-v);
});

$('#btn_salvar').click(function(){
    $('#form_pesq').submit();
});

jQuery.validator.addMethod("numSerieValido",function(){
    $.ajax({
        type: "POST",
        url: validaNumeroSeire,
        data:{
            numeroSerie: $('#numSerie').val(),
        },
        dataType:"json",
        success: function(data){
            if(data['numero'] == true){
                $('#nSerie').removeClass("has-success has-error");
                $('#nSerie').addClass("has-success");
                $('#numSerie').attr("valido","true");
            }else{
                $('#nSerie').removeClass("has-success has-error");
                $('#nSerie').addClass("has-error");
                $('#numSerie').attr("valido","false");
            }
        }//Fim 'success'
    });//Fim ajax
    return ($('#numSerie').attr("valido") == "true")?true:false;
},"Numero de serie ja cadastrado");

$("#form_pesq").validate({
    rules:{
        "FK_cd_localidade":"required",
        FK_cd_setor:"required",
        numero_serie:{
            required: true,
            numSerieValido: true
        },
        FK_tipo_equipamento:"required",
        FK_fabricante:"required",
        FK_modelo:"required",
        status:"required"
    },
    messages: {
        FK_cd_localidade:"Campo obrigatorio",
        FK_cd_setor:"Campo obrigatorio",
        numero_serie:{
            required:"Campo obrigatorio",
        },
        FK_tipo_equipamento:"Campo obrigatorio",
        FK_fabricante:"Campo obrigatorio",
        FK_modelo:"Campo obrigatorio",
        status:"Campo obrigatorio"
    }
});