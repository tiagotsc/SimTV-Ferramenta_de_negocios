cas.controller = function(){
     var rFilter = 
             /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
    var file = null,reader,dim = 320;
    
    $('#save_bt').click(okNow);
    
    function loadMe(){
        cas.ajaxer({
            method:'GET',
            sendme:{
                dimension:dim
            },
            sendto:'user/person',
            andthen:function(x){
                $('#user_name').val((x.data.name)?x.data.name:'');
                $('#cel1').val((x.data.cel1)?x.data.cel1:'');
                $('#cel2').val((x.data.cel2)?x.data.cel2:'');
                if(x.data.avatar){
                    $('#avatar').attr('src',x.data.avatar);
                }
            }    
        });
    }
    $('#avatar_file').change(function(){
        if(
            typeof document.getElementById('avatar_file').files !== 'undefined'
            && document.getElementById('avatar_file').files.length >= 1
        ){
            file = document.getElementById('avatar_file').files[0];
            if(!rFilter.test(file.type)){
                alert('Selecione um formato válido de imagem.'); 
                return false;
            }
            reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = upImg;
        }
    });
    function upImg(e){
        if(typeof e.target.result !== 'undefined'){
            var f = null,fnm = null;
            f = e.target.result;
            fnm = document.getElementById('avatar_file').files[0].name;
            cas.hidethis('body');
            dim = 320;
            cas.ajaxer({
                sendme:{
                    avatar:f
                },sendto:'user/set_user_avatar',
                andthen:function(x){
                    cas.showthis('body');
                    loadMe();
                }
            });
        }
    }
    function okNow(e){
        cas.hidethis('body');
        dim = 320;
        cas.ajaxer({
            sendme:{
                name:$('#user_name').val(),
                cel1:$('#cel1').val(),
                cel2:$('#cel2').val()
            },sendto:'user/edit_user',
            andthen:function(x){
                cas.showthis('body');
                loadMe();
            }
        });
    }
    $('#avatar').click(function(){
        if(dim !== 'orig')
            dim = 'orig';
        else
            dim = 320;
        loadMe();
    });
    loadMe();
};