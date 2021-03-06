cas.controller = function(){
        
    function geraTR (html, equipamento) {
        return html + (
            '<tr>' +
                '<td>' + equipamento.cidade + '</td>' +
                '<td>' + equipamento.fabricante + '</td>' +
                '<td>' + equipamento.ident + '</td>' +
                '<td>' + equipamento.localizacao + '</td>' +
                '<td>' + 
                    '<div><strong>IP:</strong> ' + equipamento.ip + '</div>' +
                    '<div><strong>IP interno:</strong> ' + equipamento.ip_interno + '</div>' +
                '</td>' +
                '<td>' + 
                    '<div><strong>Login:</strong> ' + equipamento.login + '</div>' +
                    '<div><strong>Senha:</strong> ' + equipamento.senha + '</div>' +
                '</td>' +
            '</tr>'
        );
    }
    
    function listaCidades (resposta) {
        var $tbody = $('#tb-equipamentos>tbody');
        
        $tbody.html(
            resposta.data.equipamentos.reduce(geraTR, '')
        );
    }
    
    $('#content > form').on('submit', function buscarCidade (e) {
                
        e.preventDefault();
        
        cas.ajaxer({
            method: 'GET',
            sendto: '/cadastro/cidadeselect',
            sendme: {
               
                cidade: $(this).find('select[name="cidade"]').val()
            },
            
            andthen: listaCidades
        });
        
    });
    
};