var languages = ["Java"/*,"English"*/,"C++","Python"];
var languageModes = {"Java":"java","English":"text","C++":"c_cpp","Python":"python"};
populateSelects();
initEditors();

function translateCode(){
  var source = document.getElementById("langFrom").value;
  var dest = document.getElementById("langTo").value;
  if(source === dest){
    ace.edit("CodeOutput").setValue(ace.edit("CodeEditor").getValue());
  }
  else{
    fetch("/SMOL/"+source+'To'+dest+'.smol')
      .then((response) => response.text())
      .then((data)=>callTranslation(data));
  }
}

function callTranslation(tableData){
  if(tableData.includes("<title>Not Found</title>")){
    ace.edit("CodeOutput").setValue("Translation table not found for "+document.getElementById("langFrom").value+" to "+document.getElementById("langTo").value);
  }
  else{
    var table = rowsToTable(tableData);
    var inputText = ace.edit("CodeEditor").getValue();
    var outputText = finishTranslation(table,inputText);
    ace.edit("CodeOutput").setValue(outputText);
  }  
}

function populateSelects(){
  for(let i = 0; i < languages.length; i++){
    addLang(languages[i]);
  }
}

function addLang(lang){
  var option = "<option value='"+lang+"'>"+lang+"</option>";
  document.getElementById("langFrom").innerHTML += option;
  document.getElementById("langTo").innerHTML += option;
}

function initEditors(){
  var editor = ace.edit("CodeEditor");
  editor.resize("40vw","100%");
  editor.setTheme("ace/theme/tomorrow_night_eighties");
  editor.session.setMode("ace/mode/java");

  var editor = ace.edit("CodeOutput");
  editor.resize("40vw","100%");
  editor.setReadOnly(true);
  editor.setTheme("ace/theme/tomorrow_night_eighties");
  editor.session.setMode("ace/mode/text");
}

function changeLang(which){
  var selectorId = which.id;
  var editorId = (selectorId == "langFrom")?"CodeEditor":"CodeOutput";
  ace.edit(editorId).session.setMode("ace/mode/"+languageModes[which.value]);
}