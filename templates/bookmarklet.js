var pics = new Array();
var body;
var title;
var v="1.8.2";
/*var inpica=document.createElement("script");
inpica.src='http://people.ischool.berkeley.edu/~jacob.portnoff/Inpica/inpicav1.js';
inpica.type='text/javascript';
inpica.charset='UTF-8';
document.getElementsByTagName("head")[0].appendChild(inpica);*/
if(window.jQuery===undefined||window.jQuery.fn.jquery<v){
    var done=false;
    var script=document.createElement("script");
    script.src="http://ajax.googleapis.com/ajax/libs/jquery/"+v+"/jquery.min.js";
    script.onload=script.onreadystatechange=function(){
        if(!done&&(!this.readyState||this.readyState=="loaded"||this.readyState=="complete")){
            done=true;
            initMyBookmarklet();
        }
    };
    console.log('no jquery');
    document.getElementsByTagName("head")[0].appendChild(script);
}
else{
    console.log('jquery');
    initMyBookmarklet();
}

function addBootstrap(){
    var locJS = '{{ STATIC_URL}}js/bootstrap.min.js';
    var locCSS = '{{ STATIC_URL}}css/bootstrap.min.css';
    //var locPNG = 'http://people.ischool.berkeley.edu/~jacob.portnoff/Inpica/bootstrap/img/glyphicons-halflings.png';
    var BootstrapJS=document.createElement("script");
    var BootstrapCSS=document.createElement("link");
    BootstrapJS.src=locJS;
    BootstrapJS.onload=script.onreadystatechange=function(){
        if(!done&&(!this.readyState||this.readyState=="loaded"||this.readyState=="complete")){
            done=true;
        }
    };
    BootstrapCSS.type="text/css";
    BootstrapCSS.rel="stylesheet";
    BootstrapCSS.href=locCSS;
    BootstrapCSS.onload=script.onreadystatechange=function(){
        if(!done&&(!this.readyState||this.readyState=="loaded"||this.readyState=="complete")){
            done=true;
        }
    };
}
/*
function initMyBookmarklet(){
    //console.log('here1');
    addBootstrap();
    //<link type="text/css" rel="stylesheet" href=
    if ($("#inpicaframe").length == 0) {
        $("body").append("\
        <div id='inpicaframe'>\
            <div id='inpicaframe_veil'>\
                <p>Loading...</p>\
                <img src='http://people.ischool.berkeley.edu/~jacob.portnoff/Inpica/close.png' alt='missing image' width='0' height='0' onload=\"loadImagesInpica();\">\
            </div>\
            <div id='super'>\
                <div id='buttons' class='container'>\
                    <button class='close'>&times;</button>\
                </div>\
                <input type='image' src='http://people.ischool.berkeley.edu/~jacob.portnoff/Inpica/close.png' id='closeInpica' onclick='closeInpica();'>\
                <div id='inpickit'>\
                </div>\
            </div>\
            <style type='text/css'>\
                #inpicaframe_veil { display: none; position: fixed; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,.5); cursor: pointer; z-index: 900; }\
                #inpicaframe_veil p { color: black; font: normal normal bold 20px/20px Helvetica, sans-serif; position: absolute; top: 50%; left: 50%; width: 10em; margin: -10px auto 0 -5em; text-align: center; }\
                #super { display: none; position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; overflow: auto; z-index: 999; background-color: rgba(128,128,128,1); border: 10px solid rgba(0,0,0,.5); margin: -5px 0 0 -5px; }\
                #inpickit { position: fixed; top: 90%; left: 90%; z-index: 999; border: 5px solid rgba(0,0,0,.5); margin: -5px 0 0 -5px; }\
                #closeInpica { position: fixed; top: 7%; left: 91%; z-index: 999; height: 25px; width: 25px;}\
            </style>\
        </div>");
    }
    else {
        $("#inpicaframe_veil").fadeOut(750);
        $('#inpicaframe').remove();
    }
}
*/
function initMyBookmarklet(){
    //console.log('here1');
    addBootstrap();
    //<link type="text/css" rel="stylesheet" href=
    if ($("#inpicaframe").length == 0) {
        $("body").append("\
        <div id='inpicaframe'>\
            <div id='inpicaframe_veil'>\
                <p>Loading...</p>\
                <img src='http://people.ischool.berkeley.edu/~jacob.portnoff/Inpica/close.png' alt='missing image' width='0' height='0' onload=\"loadImagesInpica();\">\
            </div>\
            <div id='super'>\
                <div id='buttons' class='container'>\
                    <p>Inpica</p>\
                    <button class='close pull-right' onclick='closeInpica();'>&times;</button>\
                </div>\
                <input type='image' src='http://people.ischool.berkeley.edu/~jacob.portnoff/Inpica/close.png' id='closeInpica' onclick='closeInpica();'>\
                <div id='inpickit'>\
                </div>\
            </div>\
            <style type='text/css'>\
                #inpicaframe_veil { display: none; position: fixed; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,.5); cursor: pointer; z-index: 900; }\
                #inpicaframe_veil p { color: black; font: normal normal bold 20px/20px Helvetica, sans-serif; position: absolute; top: 50%; left: 50%; width: 10em; margin: -10px auto 0 -5em; text-align: center; }\
                #super { display: none; position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; overflow: auto; z-index: 999; background-color: rgba(128,128,128,1); border: 10px solid rgba(0,0,0,.5); margin: -5px 0 0 -5px; }\
                #inpickit { position: fixed; top: 90%; left: 90%; z-index: 999; border: 5px solid rgba(0,0,0,.5); margin: -5px 0 0 -5px; }\
                #closeInpica { position: fixed; top: 7%; left: 91%; z-index: 999; height: 25px; width: 25px;}\
            </style>\
        </div>");
    }
    else {
		$("#inpicaframe_veil").fadeOut(750);
		$('#inpicaframe').remove();
    }
}

function closeInpica() {
  console.log('here8');
  $("#inpicaframe").remove();
  $("#inpica-frame").remove();
  $("#closeInpica").remove();
}
function loadImagesInpica(){
    $("#inpicaframe_veil").fadeIn(750);
    body = $('body')[0].outerHTML;
    title = $('title')[0].outerHTML;
    var images=$('img');
    console.log('here2');
    var numImages=0;
    for(var i=0;i<images.length;i++){
      console.log(i);
      if(images[i].height>100 && images[i].width>100){
        numImages++;
        $('#super').append("\
        <div id='imgDivInpica"+i+"'>\
            <INPUT type='image' src='"+images[i].src+"' id='img"+i+"' value='off' onclick='addImage("+i+");' height=max-width=100%>\
            <style type='text/css'>\
                #imgDivInpica"+i+" { padding: 5px; height: 150px; width: 150px; float: left; background-color: rgba(250,250,250,1);}\
                #img"+i+" { max-width: 100%; }\
            </style>\
        </div>");
      }
    }
    console.log('here3');
    // append the submit button
    if(numImages>0) {
        $('#inpickit').append("\ <input type='submit' id='InpicaSubmit' value='In-Pick-It!' onclick='InpicaSubmit();' float='right'>");
    }
    // display the structure
    $('#super').slideDown(500);
}
function addImage(i){
    console.log('here5now');
    var x=$("#img"+i).attr('value');
    console.log(x);
    var curLen=pics.length;
    var imageSrc = $("#img"+i).attr('src');
    console.log(imageSrc);
    if ($("#img"+i).attr('value')=='off') {
        $("#imgDivInpica"+i).attr('style','border: 3px solid rgba(250,0,0,1)');
        $("#img"+i).attr('value','on');
        //console.log('here6');
        pics[curLen]=imageSrc;
    }
    else {
        $("#imgDivInpica"+i).attr('style','border: 0px');
        $("#img"+i).attr('value','off');
        var index = pics.indexOf(imageSrc);
        if (index!=-1) {
            pics.splice(index,1);
        }
        else {
            console.log('error: selected pic not in array');
        }
    }
}
function InpicaSubmit() {
    numPics = pics.length;
    con = false;
    if (numPics>1) {
        con = confirm("Do you want to add these images to your furniture selection at Inpica?");
    }
    else if (numPics<1) {
        alert("Please select an image to continue.");
    }
    else {
        con = confirm("Do you want to add this image to your furniture selection at Inpica?");
    }
    //console.log(body);
    //console.log(title);
    var x = "";
    if (con==true) {
        x="submit array of pics";
        setTimeout("$('#super').remove()", 450);
        /*$("body").append("\
        <div id='super2'>\
        <img src='http://people.ischool.berkeley.edu/~jacob.portnoff/Inpica/close.png' alt='missing image' width='50' height='50' onload=\"loadFormInpica();\">\
        </div>\
        <style type='text/css'>\
        #super2 { display: none; position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; overflow: auto; z-index: 999; background-color: rgba(128,128,128,1); border: 10px solid rgba(0,0,0,.5); margin: -5px 0 0 -5px; }\
        </style>\
        ");*/
        // encodeURIComponent(picurl)
        var urlStr = "";
        for(var i=0;i<pics.length;i++){
            urlStr = urlStr+"picurl="+encodeURIComponent(pics[i])+"&";
        }
        console.log(urlStr);
        var url = document.URL;
        var grabbedVals = {};
        grabbedVals = runRegexs(grabbedVals);
        $('body').append("\
            <iframe id='inpica-frame' src='http://127.0.0.1:8000/pin/{{user.id}}/{{user.userdetails.bookmarkletss}}?"+urlStr+"w="+grabbedVals['width']+"&l="+grabbedVals['length']+"&h="+grabbedVals['height']+"&title="+grabbedVals['title']+"&type="+grabbedVals['type']+"&other="+grabbedVals['other']+"&url="+url+"'>\
            </iframe>\
            <input type='image' src='http://people.ischool.berkeley.edu/~jacob.portnoff/Inpica/close.png' id='closeInpica' onclick='closeInpica();'>\
            <style>\
                #inpica-frame { display: none; position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; overflow: auto; z-index: 999; margin: -5px 0 0 -5px; }\
                #closeInpica { position: fixed; top: 7%; left: 91%; z-index: 999; height: 25px; width: 25px;}\
            </style>\
            ");
        $('#inpica-frame').slideDown(500);


    }
    else {
        x="Cancelled";
    }
    console.log(x);
}

function loadFormInpica() {
    var grabbedVals = {};
    grabbedVals = runRegexs(grabbedVals);
    // what I need: pic(s), furniture type, length, width, height and title, extra, and 'purchased'
    
}

function runRegexs(grabbedVals) {
    var units = "(in|in.|inch|inches|foot|feet|ft|cm|mm|m|\'|\")";
    var widthRegex = "^.*(Width)[\:\=\-x ]? ?([0-9]+) ?"+units+".*$";
    var lengthRegex = "^.*(Length|Depth)[\:\=\-x ]? ?([0-9]+) ?"+units+".*$";
    var heightRegex = "^.*(Height)[\:\=\-x ]? ?([0-9]+) ?"+units+".*$";
    var dimRegex = "^.*> ?([0-9]+) ?"+units+" ?([LlDdWwHh]) ?[Xx] ?([0-9]+) ?"+units+" ?([LlDdWwHh]) ?[Xx] ?([0-9]+) ?"+units+" ?([LlDdWwHh]).*$"
    var allRegex = "^.*[Ll](ength)?[\:\=\-x ][Ww](idth)?[\:\=\-x ]?[Hh]?(eight)?[\:\=\-x ]? ?(([0-9]+) ?(in|inch|inches|foot|feet|ft|cm|mm|m|\'|\")?[\:\=\-x ]?){1,3}.*$";
    var typeRegex = "^.*([Ll]oveseat|[Aa]rmchair|[Cc]ouch|[Ss]ofa|[Rr]ecliner|[Ss]ectional|TV|[Pp]iano|[Cc]hair|[Dd]esk|[Pp]rinter|[Cc]omputer|[Bb]ookcase|[Bb]ookshelf|[Rr]ug|[Ff]iling|[Cc]abinet|[Bb]ed|[Nn]ightstand|[Dd]resser|[Cc]ounter|[Ss]ink|[Ss]tove|[Ff]ridge|[Bb]athtub|[Ss]hower|[Ss]ink|[Tt]oilet|[Tt]able).*$"
    var costRegex = "^.*\\$([0-9]+\\.[0-9]{2}).*$";

    grabbedVals['type'] = '';
    grabbedVals['length'] = '';
    grabbedVals['width'] = '';
    grabbedVals['height'] = '';
    grabbedVals['other'] = '';
    grabbedVals['title'] = '';
    
    var wVal; //bodyLines[i].match(widthRegex)
    var lVal; //body.match(lengthRegex);
    var hVal; //body.match(heightRegex);
    var allVal; //body.match(allRegex);
    var lenCommit;// = cleanVal(lVal);
    var widCommit;// = cleanVal(wVal);
    var hitCommit;// = cleanVal(hVal);
    var otherVal;

    console.log("hi1");
    
    var bodyLines = body.split(/\n/);
    var line;
    for(var i=0;i<bodyLines.length;i++){
        line = line+" "+bodyLines[i];
    }
    var titleLines = title.split(/\n/);
    title="";
    for(var j=0;j<titleLines.length;j++) {
        title = title + " " +titleLines[j];
    }

    allVal = line.match(dimRegex);
    otherVal = line.match(costRegex);
    //console.log(line);
    console.log(otherVal);
    if (allVal == null) {
        wVal = line.match(widthRegex);
        lVal = line.match(lengthRegex);
        hVal = line.match(heightRegex);
        if (lVal != null) {
            lenCommit = cleanVal(lVal[2],lVal[3]);
        }
        else {
            lenCommit = "UNK";
        }
        if (wVal != null) {
            widCommit = cleanVal(wVal[2],wVal[3]);
        }
        else {
            widCommit = "UNK";
        }
        if (hVal != null) {
            hitCommit = cleanVal(hVal[2],hVal[3]);
        }
        else {
            hitCommit = "UNK";
        }
    }
    else {
        var valType1 = allVal[3];
        var valType2 = allVal[6];
        var valType3 = allVal[9];
        console.log(allVal);
        if (valType1.match("[LlDd]") != null) {
            lenCommit = cleanVal(allVal[1],allVal[2]);
        }
        else if (valType1.match("[Ww]") != null) {
            widCommit = cleanVal(allVal[1],allVal[2]);
        }
        else if (valType1.match("[Hh]") != null) {
            hitCommit = cleanVal(allVal[1],allVal[2]);
        }
        if (valType2.match("[LlDd]") != null) {
            lenCommit = cleanVal(allVal[4],allVal[5]);
        }
        else if (valType2.match("[Ww]") != null) {
            widCommit = cleanVal(allVal[4],allVal[5]);
        }
        else if (valType2.match("[Hh]") != null) {
            hitCommit = cleanVal(allVal[4],allVal[5]);
        }
        if (valType3.match("[LlDd]") != null) {
            lenCommit = cleanVal(allVal[7],allVal[8]);
        }
        else if (valType3.match("[Ww]") != null) {
            widCommit = cleanVal(allVal[7],allVal[8]);
        }
        else if (valType3.match("[Hh]") != null) {
            hitCommit = cleanVal(allVal[7],allVal[8]);
        }
    }
    
    // simplify type - if need be
    var titleValue = title.match(typeRegex);
    console.log(title);
    console.log(titleValue);
    var lC = parseInt(lenCommit);
    var wC = parseInt(widCommit);
    var typeCode = determineType(titleValue,lC,wC);
    // commit to the hashtable
    var titleCommit = title.replace(/(<.{5,7}>)/g,'');
    console.log(titleCommit);
    
    var otherCommit = "UNK";
    if (otherVal!= null) {
        otherCommit = otherVal[1];
    }
    grabbedVals['title'] = titleCommit;
    grabbedVals['type'] = typeCode;
    grabbedVals['length'] = lenCommit;
    grabbedVals['width'] = widCommit;
    grabbedVals['height'] = hitCommit;
    grabbedVals['other'] = otherCommit;
    console.log("hi2");
    return grabbedVals;
}

function determineType(typeVal,length,width) {
    var code = "2000";
    if (typeVal == null){
        return code;
    }
    else {
        var word = typeVal[1];
        if (word.match("[Ll]oveseat|[Aa]rmchair")!=null){
            code = "1000";
            return code;
        }
        else if (word.match("[Cc]ouch|[Ss]ofa")!=null){
            code = "1001";
            return code;            
        }
        else if (word.match("[Rr]ecliner")!=null){
            code = "1002";
            return code;            
        }
        else if (word.match("[Ss]ectional")!=null){
            code = "1004";
            return code;            
        }
        else if (word.match("[Bb]ookcase|[Bb]ookshelf")!=null){
            code = "1023";
            return code;            
        }
        else if (word.match("[Rr]ug")!=null){
            code = "1025";
            return code;            
        }
        else if (word.match("[Pp]rinter")!=null){
            code = "2005";
            return code;            
        }
        else if (word.match("[Nn]ightstand")!=null){
            code = "3006";
            return code;            
        }
        else if (word.match("[Dd]resser")!=null){
            code = "3007";
            return code;            
        }
        else if (word.match("[Bb]athtub")!=null){
            code = "4000";
            return code;            
        }
        else if (word.match("[Ss]hower")!=null){
            code = "4001";
            return code;            
        }
        else if (word.match("[Tt]oilet")!=null){
            code = "4004";
            return code;            
        }
        else if (word.match("[Cc]ounter")!=null){
            code = "6000";
            return code;            
        }
        else if (word.match("[Ss]tove")!=null){
            code = "6003";
            return code;            
        }
        else if (word.match("[Cc]hair")!=null){
            code = "2000";
            return code;            
        }
        else if (word.match("[Ff]iling|[Cc]abinet")!=null){
            code = "2002";
            return code;            
        }
        else if (word.match("TV")!=null && title.match(".*([Ff]latscreen).*")!=null){
            code = "1011";
            return code;            
        }
        else if (word.match("TV")!=null && title.match(".*([Ff]latscreen).*")==null && title.match(".*([Dd]esk|[Tt]able|[Uu]nit|[Ss]torage|[Cc]ombination).*")!=null){
            code = "1020";
            return code;            
        }
        else if (word.match("TV")!=null && title.match(".*([Ff]latscreen).*")==null){
            code = "1012";
            return code;            
        }
        else if (word.match("[Pp]iano")!=null && title.match(".*([Uu]pright).*")==null){
            code = "1017";
            return code;            
        }
        else if (word.match("[Pp]iano")!=null && title.match(".*([Uu]pright).*")!=null){
            code = "1018";
            return code;            
        }
        else if (word.match("[Dd]esk")!=null && title.match(".*([Cc]hair).*")!=null){
            code = "2000";
            return code;            
        }
        else if (word.match("[Dd]esk")!=null && title.match(".*([Ww]riting).*")!=null){
            code = "2001";
            return code;            
        }
        else if (word.match("[Dd]esk")!=null && title.match(".*([Cc]orner).*")!=null){
            code = "2008";
            return code;            
        }
        else if (word.match("[Dd]esk")!=null && title.match(".*([Cc]urved).*")!=null){
            code = "2009";
            return code;            
        }
        else if (word.match("[Dd]esk")!=null){
            code = "2001";
            return code;            
        }
        else if (word.match("[Cc]omputer")!=null && title.match(".*([Ll]aptop).*")==null){
            code = "2003";
            return code;            
        }
        else if (word.match("[Cc]omputer")!=null && title.match(".*([Ll]aptop).*")!=null){
            code = "2004";
            return code;            
        }
        else if (word.match("[Ss]ink")!=null && length!=width) {
            code = "4002";
            return code;
        }
        else if (word.match("[Ss]ink")!=null && length==width) {
            code = "4003";
            return code;
        }
        else if (word.match("[Ss]ink")!=null && (length>30 || width>30)) {
            code = "6001";
            return code;
        }
        else if (word.match("[Ss]ink")!=null && (length<=30 && width<=30)) {
            code = "6002";
            return code;
        }
        else if (word.match("[Ff]ridge")!=null && title.match(".*([Dd]ouble).*")!=null){
            code = "6004";
            return code;            
        }
        else if (word.match("[Ff]ridge")!=null && title.match(".*([Dd]ouble).*")==null){
            code = "6005";
            return code;            
        }
        else if (word.match("[Bb]ed")!=null && title.match(".*([Kk]ing).*")!=null){
            code = "3000";
            return code;            
        }
        else if (word.match("[Bb]ed")!=null && title.match(".*([Qq]ueen).*")!=null){
            code = "3001";
            return code;            
        }
        else if (word.match("[Bb]ed")!=null && title.match(".*([Dd]ouble).*")!=null){
            code = "3002";
            return code;            
        }
        else if (word.match("[Bb]ed")!=null && title.match(".*([Bb]unk).*")!=null){
            code = "3004";
            return code;            
        }
        else if (word.match("[Bb]ed")!=null){
            code = "3002";
            return code;
        }
        else if (word.match("[Tt]able")!=null && title.match(".*([Cc]offee).*")!=null && title.match(".*([Rr]ound).*")!=null) {
            code = "1019";
            return code;
        }
        else if (word.match("[Tt]able")!=null && title.match(".*([Cc]offee).*")!=null && title.match(".*([Rr]ound).*")==null) {
            code = "1020";
            return code;
        }
        else if (word.match("[Tt]able")!=null && title.match(".*([Dd]ining).*")!=null && title.match(".*([Rr]ound).*")!=null) {
            code = "5003";
            return code;
        }
        else if (word.match("[Tt]able")!=null && title.match(".*([Dd]ining).*")!=null && (length>60||width>60)) {
            code = "5006";
            return code;
        }
        else if (word.match("[Tt]able")!=null && title.match(".*([Dd]ining).*")!=null && (length>48||width>48)) {
            code = "5005";
            return code;
        }
        else if (word.match("[Tt]able")!=null && title.match(".*([Dd]ining).*")!=null) {
            code = "5004";
            return code;
        }
        else if (word.match("[Tt]able")!=null) {
            code = "1020";
            return code;
        }
    }
}

function cleanVal(lenVal, unit){
    var len = parseInt(lenVal);
    // convert to inches
    var unitAdj = checkUofM(unit);
    len = len * unitAdj;
    len = len.toFixed(2);
    var lenCommit = len.toString();
    return lenCommit;
}

function checkUofM(UofM){
    var inRegex = "^(in|in.|inch|inches|\")$";
    var ftRegex = "^(foot|feet|ft|\')$";
    var mRegex = "^(cm|mm|m)$";
    var unitAdj=1;
    if (UofM.match(inRegex)!=null) {
        unitAdj = 1;
    }
    else if (UofM.match(ftRegex)!=null) {
        unitAdj = 12;
    }
    else if (UofM.match(mRegex)!=null) {
        if (UofM == "m") {
            unitAdj = 39.3701;
        }
        else  if (UofM == "cm") {
            unitAdj = 0.393701;
        }
        else if (UofM == "mm") {
            unitAdj = 0.0393701;
        }
    }
    return unitAdj;
}