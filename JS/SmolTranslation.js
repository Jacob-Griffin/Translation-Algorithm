function translateText(smolData, inputText) {
  var table = rowsToTable(smolData);
  return finishTranslation(table, inputText);
}

function rowsToTable(smolData) {
  smolData = smolData.replace(/^(.+?[^\\])#.+$/gm, "$1");    //Remove after-line comments
  smolData = smolData.replace(/\\#/g, "#");                  //Unescape Escaped #
  var rows = smolData.split("\n");                          //Separate into lines
  var table = [];
  for (let i = 0; i < rows.length; i++) {
    var line = rows[i];
    line = line.replace(/\/\//,"/?/"); //replace empty regexes to simplify code matching
    line = line.replace(/\"\"/,"");    //delete empty output strings
    line = line.trim();
    if(!line.startsWith("#") && line != ""){
      try{
        var commands = line.match(/([a-z]+)\s+\/(.*?[^\\])\/([a-z]*)\s*/);
        line = line.replace(/([a-z]+)\s+\/(.*?[^\\])\/([a-z]*)\s*/,"");
        var method = commands[1];
        var regex = commands[2];
        var flags = commands[3];
        var commands = line.match(/([a-z]+)\s+\/(.*?[^\\])\/([a-z]*)\s*/);
        var control = false; //This gets checked later to see if conditionals exist
        var condition = false;
        var cflags = false;
        if(commands){
          control = method;
          condition = regex;
          cflags = flags;
          method = commands[1];
          regex = commands[2];
          flags = commands[3];
        }
        var output = "";
        if(/"(.*?[^\\])"/.test(line)){
          output = line.match(/"(.*?[^\\])"/)[1];
        }
        var rowJSON = { "Control": control, "Method": method, "Pattern": regex, "Flags": flags, "Output": output, "Condition": condition, "CFlags": cflags };
        table.push(rowJSON);
      }
      catch(err){

      }
    }
  }
  return table;
}

function finishTranslation(table, input) {
  if ((typeof table != "undefined")) {
    var code = input;
    for (let i = 0; i < table.length; i++) {
      code = doTransform(code, table[i]);
    }
    return code;
  }
}

function validatePattern(regexPattern) {
  var validationArray = [0, 0, 0, 0];
  for (let i = 0; i < regexPattern.length; i++) {
    if (regexPattern[i] == "(") {
      validationArray[0] += 1;
    }
    if (regexPattern[i] == ")") {
      validationArray[1] += 1;
      if (validationArray[1] > validationArray[0]) break;
    }
    if (regexPattern[i] == "[") {
      validationArray[2] += 1;
    }
    if (regexPattern[i] == "]") {
      validationArray[3] += 1;
      if (validationArray[3] > validationArray[2]) break;
    }
    if (regexPattern[i] == "\\") {
      //If the current character is a back slash, then the next character is escaped and therefore doesn't count
      i += 1;
    }
  }
  if (validationArray[0] != validationArray[1] || validationArray[2] != validationArray[3]) {
    regexPattern = "\\(" * validationArray[1]; //If there are mismatched ()[], make up a pattern that doesn't match anything
  }
  if (regexPattern[regexPattern.length - 1] == "\\") {
    regexPattern = regexPattern.substr(0, regexPattern.length - 1);
  }

  return regexPattern;
}

function doTransform(code, row) {
  var doExecution = true;
  var loop = false;
  if (row["Control"]) {//Check if the JSON has a "Control"
    if (!code.match(new RegExp(row["Condition"], row["CFlags"]))) {//If the condition doesn't apply, don't execute the regex
      doExecution = false;
    }
    else if (row["Control"] == "while") { //If the statement is a while statement and the condition is met
      loop = true;              //Read the same line again next time
    }
  }
  if (row["Method"] === "replace" && doExecution) {
    // If the code is going to change, change it, otherwise, make sure you don't loop, or else infinite looping
    if (code != smolReplace(code, row["Pattern"], row["Flags"], row["Output"])) {
      code = smolReplace(code, row["Pattern"], row["Flags"], row["Output"])
    }
    else {
      loop = false;
    }
  }
  else if (row["Method"] === "list" && doExecution) {
    if (code != smolList(code, row["Pattern"], row["Flags"], row["Output"])) {
      code = smolList(code, row["Pattern"], row["Flags"], row["Output"])
    }
    else {
      loop = false;
    }
  }
  else if (row["Method"] === "reverse" && doExecution) {
    if (code != smolReverse(code, row["Pattern"], row["Flags"], row["Output"])) {
      code = smolReverse(code, row["Pattern"], row["Flags"], row["Output"])
    }
    else {
      loop = false;
    }
  }
  else {
    loop = false;
  }
  return loop ? doTransform(code, row) : code; //If we flagged this for looping, do the transform again until it just returns code;
}