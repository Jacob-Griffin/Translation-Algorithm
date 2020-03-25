if(window.location.href.match(/\?ex=.+$/)){
  var ex = window.location.href.match(/\?ex=(.+)$/)[1];
  var smolLoc = "/Examples/"+ex+"/ex.smol";
  var inLoc = "/Examples/"+ex+"/exInput.txt";
  var outLoc = "/Examples/"+ex+"/exOutput.txt";
  fetch(smolLoc)
    .then((response) => response.text())
    .then((data)=>initSmol(data));
  fetch(inLoc)
    .then((response) => response.text())
    .then((data)=>initInput(data));
  fetch(outLoc)
    .then((response) => response.text())
    .then((data)=>initOutput(data));
}
else if(window.location.href.match(/\?tu=.+$/)){
  var tu = window.location.href.match(/\?tu=(.+)$/)[1];
  var smolLoc = "/SMOL/"+tu+".smol";
  initInput("");
  initOutput("");
  fetch(smolLoc)
    .then((response) => response.text())
    .then((data)=>initSmol(data));
}
else{
  initEditors();
}

function updateText(){
  var smolData = ace.edit("SMOLInput").getValue();
  var inputText = ace.edit("TextInput").getValue();
  var outputText = translateText(smolData,inputText);
  ace.edit("TextOutput").setValue(outputText);
}

function initSmol(initialData){
  var editor = ace.edit("SMOLInput");
  editor.resize("40%","100%");
  editor.setTheme("ace/theme/tomorrow_night");
  editor.setValue(initialData);
  editor.setOption("wrap", true);
  editor.setFontSize(14);
  editor.getSession().on('change',updateText);
  editor.session.setMode("ace/mode/zeek");
}

function initInput(initialData){
  var editor = ace.edit("TextInput");
  editor.resize("60%","50%");
  editor.setTheme("ace/theme/tomorrow_night_eighties");
  editor.setValue(initialData);
  editor.setFontSize(14);
  editor.setOption("wrap", true);
  editor.getSession().on('change',updateText);
}

function initOutput(initialData){
  var editor = ace.edit("TextOutput");
  editor.resize("60%","50%");
  editor.setValue(initialData);
  editor.setReadOnly(true);
  editor.setFontSize(14);
  editor.setOption("wrap", true);
  editor.setTheme("ace/theme/tomorrow_night_eighties");
}

function initEditors(){
  initSmol('#SMOL Input\n#Place Regex calls here\nreplace /Hello/g "goodbye"');
  initInput('Hello');
  initOutput('goodbye');
}

function showUpload(){
  document.getElementById("inputLabel").style = "display:block";
}

function downloadSMOL() {
  var contents = ace.edit("SMOLInput").getValue();
  var titleMatch = contents.match(/^#!title:(.+)$/m);
  var name = titleMatch?titleMatch[1]+".smol":"sequence.smol";

  finishDownload(contents,name);
}

function fileUploaded(event){
  var file = event.target.files[0];
    if (file) {
        // create reader
        var reader = new FileReader();
        reader.onload = function(e) {
            // browser completed reading file - display it
            ace.edit('SMOLInput').setValue(e.target.result,1);
        };
        reader.readAsText(file);
    }
}

function compileAsJS(){
  //Make File
  var contents = ace.edit("SMOLInput").getValue();
  var titleMatch = contents.match(/^#!title:(.+)$/m);
  var name = titleMatch?titleMatch[1]:"smolSequence";
  var jsData;
  fetch("/SMOL/SMOLtoJavaScript.smol")
      .then((response) => response.text())
      .then((data)=>jsData=translateText(data,contents))
      .then((content)=>finalizeJS(content,name));
}

function finalizeJS(content,name){
  //Add function definition to raw code
  content = "function "+name+"(input)\n{\n"+content+"\nreturn input;\n}";
  //Grab Default functions
  fetch("/JS/manipFunctions.js")
      .then((response) => response.text())
      .then((data)=>content+"\n"+data) //Add Default functions after user functions
      .then((finalCode)=>finishDownload(finalCode,name+".js"));
  
}

function finishDownload(contents,name){
  //Download
  var blob = new Blob([contents], {type: "text/plain"});

  var dlink = document.createElement('a');
  dlink.download = name;
  dlink.href = window.URL.createObjectURL(blob);
  dlink.onclick = function(e) {
      // revokeObjectURL needs a delay to work properly
      var that = this;
      setTimeout(function() {
          window.URL.revokeObjectURL(that.href);
      }, 1500);
  };

  dlink.click();
  dlink.remove();
}