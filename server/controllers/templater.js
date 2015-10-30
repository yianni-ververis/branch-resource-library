var Templater = (function(){

    //var templateHTML, compiledHTML, pieces=[];

    function Templater(html, attributes){
        //One single line and one space only
        html = html.replace(/(?:\r\n|\r|\n|\t|\n\t| \n\t)/g, '');
        html = html.replace(/\s{2,}/g, ' ');

        this.pieces = null;
        this.evalFn = null;
        this.templateHTML = html;

        if (html.indexOf('qs-repeat=') !== -1
            || html.indexOf('qs-show=') !== -1
            || html.indexOf('qs-if=') !== -1){
            this.evalFn = repeater(html);
        }else {
            this.pieces = parse(html);
        }
    }

    function parse(html){
        var pattern = /({{([^#^/].*?)}})/g;
        var pieces = [];
        while (s=pattern.exec(html)){
            pieces.push({what:s[0], item:s[0].replace("{{","").replace("}}","")});
        }        
        return pieces;
    }

    function repeater(html){
        var htmlObj = document.createElement('div');
        htmlObj.innerHTML = html;
        var evalFn = [];

        var ifElms = htmlObj.querySelectorAll('[qs-if]');
        if (ifElms.length > 0){
            for (var i=0; i<ifElms.length;i++){
                var htmlItem = getHTMLString(ifElms[i]);
                var expression = (ifElms[i].attributes)? ifElms[i].attributes["qs-if"].value : null;
                evalFn.push({
                    'type':'qs-if',
                    'htmlItem': htmlItem,
                    'expression': expression
                });
            }
        }

        var repeatElms = htmlObj.querySelectorAll('[qs-repeat]');
        if (repeatElms.length > 0){
            for (var i=0; i<repeatElms.length;i++){
                var htmlItem = getHTMLString(repeatElms[i]);
                var expression = repeatElms[i].attributes["qs-repeat"].value.split(' '),
                    dimension = expression[expression.length-1],
                    loop = expression[0]+' '+'in'+' data["'+dimension+'"]';

                evalFn.push({
                    'type': 'qs-repeat',
                    'htmlItem': htmlItem,
                    'dimension': dimension,
                    'repeater': expression[0],
                    'loop': loop,
                    'repeatPieces': parse(htmlItem)
                });
            }
        }

        var showElms = htmlObj.querySelectorAll('[qs-show]');
        if (showElms.length > 0){
            for (var i=0; i<showElms.length;i++){
                var htmlItem = getHTMLString(showElms[i]);
                var expression = (showElms[i].attributes)? showElms[i].attributes["qs-show"].value : null;

                evalFn.push({
                    'type':'qs-show',
                    'htmlItem': htmlItem,
                    'expression': expression
                });
            }
        }

        htmlObj.innerHTML = null;

        return evalFn;
    }

    function getRepeatBlock(params, evalIterator, data){

        var htmlString = params.htmlItem;
        for(var i=0;i<params.repeatPieces.length;i++){
            try{
                var what = params.repeatPieces[i].what;
                var fields = params.repeatPieces[i].item.split('.');
                var item = what;
                if (fields[0] == params.repeater){
                    item = evalIterator;
                    if (fields.length > 1){
                        item = data[fields[1]];
                    }
                    htmlString = htmlString.replace(what, item);
                }

            }
            catch(err){
                console.log("error", htmlString);
            }
        }

        return htmlString;
    }

    Templater.prototype = Object.create(Object.prototype, {
        getHTML:{
            value: function(data){
                this.compiledHTML = this.templateHTML;

                var myEval = function(expr){
                    var s = true;
                    eval('var o=data; if ('+expr+') { s=true; } else { s=false; }');
                    return s;
                };

                var fn = this.evalFn;
                if (fn && fn.length > 0){
                    for (var i=0; i<fn.length; i++){
                        if (fn[i].type === 'qs-if'){
                            if (myEval(fn[i].expression) === false){
                                //Remove dom element from template
                                fn[i]['htmlItem'] = fn[i]['htmlItem'].replace(/&amp;/g, '&');
                                this.compiledHTML = this.compiledHTML.replace(fn[i]['htmlItem'], '');
                            }
                        }else  if (fn[i].type === 'qs-show'){
                            var show = (myEval(fn[i].expression) === true)? 'block' : 'none';
                            fn[i]['htmlItem'] = fn[i]['htmlItem'].replace(/&amp;/g, '&');
                            var str = fn[i]['htmlItem'].replace('qs-show', 'style="display:'+show+'" qs-show');
                            this.compiledHTML = this.compiledHTML.replace(fn[i]['htmlItem'], str);

                        }else if (fn[i].type === 'qs-repeat'){
                            var repeatBlokHTML = '';
                            var oriString = fn[i]['htmlItem'];
                            if(this.compiledHTML.indexOf(oriString) !== -1){
                                for (var t in data[fn[i]['dimension']]){
                                    repeatBlokHTML += getRepeatBlock(fn[i], t, data[fn[i]['dimension']][t]);
                                }
                                this.compiledHTML = this.compiledHTML.replace(oriString, repeatBlokHTML);
                            }
                        }
                    }
                }
                if (!this.pieces){
                    this.pieces = parse(this.compiledHTML);
                }

                for(var i=0;i<this.pieces.length;i++){
                    try{
                      //check to see if the piece refers to a child property
                      var props = this.pieces[i].item.split(".");
                      var result = data;
                      for (var p in props){
                        result = result[props[p]];
                      }
                      this.compiledHTML = this.compiledHTML.replace(this.pieces[i].what, result);
                    }
                    catch(err){
                        console.log("error", data.toString());
                    }
                }
                return this.compiledHTML;
            }
        }

    });

    function getHTMLString(node){
        if(!node || !node.tagName) return '';
        if(node.outerHTML) return node.outerHTML;

        var wrapper = document.createElement('div');
        wrapper.appendChild(node.cloneNode(true));
        var strHTML = wrapper.innerHTML;
        wrapper.innerHTML = null;
        return strHTML;
    }

    return Templater;

}());

module.exports = Templater;
