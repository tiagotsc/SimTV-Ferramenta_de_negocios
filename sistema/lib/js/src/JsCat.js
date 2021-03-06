(function(){
    /*console.log(LazyLoad);
    return;*/
    var queue = [],
        JsDownload = LazyLoad.js,
        srcFolder = window.casSrcFolder;

    function ConcatJs(src, callback){
        
        if(!src){
            return JsDownload(src, callback);
        }
        
        if(src instanceof Array === false){
            src = [src];
        }
        
        var allLocal = src.every(function (url) {
            return url.indexOf('/lib/js/') === 0;
        });
        
        if (!allLocal) {
            return JsDownload(src, callback);
        }
        
        if (src.length >= 3) {
            return cat(src, callback);
        }
        
        queue.push({src: src, callback: callback, since: new Date()});
        procQueue();
    }
    function cat(src, callback){
        
        if(callback instanceof Array === false){
            callback = [callback];
        }

        JsDownload('/jscat?f='+catUrls(src), function(){
            callback.forEach(function(func){
                if(typeof func === 'function')
                    func();
            });
        });
    }
    function catUrls(src){
        return src.map(function(url){
            console.log(url);
            return url.replace('/lib/js/','');
        }).join(':');
    }
    function procQueue(){
        if(!queue.length){
            return;
        }
        
        var older = queue.slice(0, 4),
            src = [], callback = [];

        if (older.length < 5) {
            for(var len = older.length, i = len; i < queue.length && i < 5; i++){
                if ((new Date()) - queue[i].since < 100) {
                    break;
                }
                older.push(queue[i]);
            }
        }
        
        queue.splice(0, older.length);
        older.forEach(function(js){
            src = src.concat(js.src);
            callback.push(js.callback);
        });

        if (older.length) {
            cat(src, callback);
        }

        if(queue.length){
            setTimeout(procQueue, 10);
        }
    }
    LazyLoad.js = ConcatJs;
}());