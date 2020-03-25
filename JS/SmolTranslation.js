function translateText(smolData,inputText){
  var table = rowsToTable(smolData);
  return finishTranslation(table,inputText);
}

function rowsToTable(smolData){
  smolData = smolData.replace(/^([^#]*)[^\\]#.+$/gm,"$1");  //Remove comments
  smolData = smolData.replace(/\\#/g,"#");                  //Unescape Escaped #
  var rows = smolData.split("\n");                          //Separate into lines
  var table = [];
  for(let i=0;i<rows.length;i++){
    var line = rows[i].trim();//trim whitespace
    if(!line.startsWith("#") && rows[i] !== ""){
      var dataArray;

      //Try to match Control Structures first
      dataArray = line.match(/^(\S+)\s+\/((?:.*?(?:\\\/)?)*?)\/([a-z]*)\s+(\S+)\s+\/((?:.*?(?:\\\/)?)*?)\/([a-z]*)(?:\s+"((?:.*?(?:\\\")?)*?)")?/);

      if(dataArray){
        //This matches lines with control structures first
        var controlType = dataArray[1];
        var conditionPattern = dataArray[2];
        var conditionFlags = dataArray[3]
        var method = dataArray[4];
        var regexPattern = dataArray[5];
        var flags = dataArray[6];
        var outputString = dataArray[7]?dataArray[7].replace(/\\"/g,'"'):"";

        regexPattern = validatePattern(regexPattern);
        conditionPattern = validatePattern(conditionPattern);

        var rowJSON = {"Control":controlType,"Method":method,"Pattern":regexPattern,"Flags":flags,"Output":outputString,"Condition":conditionPattern,"CFlags":conditionFlags};
        table.push(rowJSON);
      }
      else{
        //If there aren't control structures, try to match a regular command
        dataArray = line.match(/^(\S+)\s+\/((?:.*?(?:\\\/)?)*?)\/([a-z]*)(?:\s+"((?:.*?(?:\\\")?)*?)")?/);
        /*Regex matches strict syntax. Capture groups:
        1. Method
        2. Pattern
        3. Flags
        4. outputString (optional)
        */
        if(dataArray){
          var method = dataArray[1];
          var regexPattern = dataArray[2];
          var flags = dataArray[3];
          var outputString = dataArray[4]?dataArray[4].replace(/\\"/g,'"'):"";
          //output string is unique in that it can be left blank or non-existant. If there is no fourth capture group, pretend that they typed in ""
          //Additionally, escaped quotes (\") within the string should be replaced with regular quotes, now that we've found the end of the string


          //Count non-escaped parentheses and brackets for matching pairs in the regex pattern. Unfinished parentheses mess up the editor
          regexPattern = validatePattern(regexPattern);
          
          var rowJSON = {"Method":method,"Pattern":regexPattern,"Flags":flags,"Output":outputString};
          table.push(rowJSON);
        }
      }
    }
  }
  return table;
}

function finishTranslation(table,input){
  if((typeof table != "undefined")){
    var code = input;
    var loop = false;
    var doExecution;
    for(let i = 0;i < table.length; i++){
      code = doTransform(code,table[i]);
    }
    return code;
  }
}

function validatePattern(regexPattern){
  var validationArray = [0,0,0,0];
  for(let i = 0; i < regexPattern.length; i++){
    if(regexPattern[i] == "("){
      validationArray[0] += 1;
    }
    if(regexPattern[i] == ")"){
      validationArray[1] += 1;
      if(validationArray[1]>validationArray[0]) break;
    }
    if(regexPattern[i] == "["){
      validationArray[2] += 1;
    }
    if(regexPattern[i] == "]"){
      validationArray[3] += 1;
      if(validationArray[3]>validationArray[2]) break;
    }
    if(regexPattern[i] == "\\"){ 
      //If the current character is a back slash, then the next character is escaped and therefore doesn't count
      i += 1;
    }
  }
  if(validationArray[0]!=validationArray[1]||validationArray[2]!=validationArray[3]){
    regexPattern = "\\(" * validationArray[0]; //If there are mismatched ()[], make up a pattern that doesn't match anything
  }
  if(regexPattern[regexPattern.length - 1]=="\\"){
    regexPattern = regexPattern.substr(0,regexPattern.length - 1);
  }

  return regexPattern;
}

function doTransform(code,row){
  var doExecution = true;
  var loop = false;
  if(row["Control"]){//Check if the JSON has a "Control"
    if(!code.match(new RegExp(row["Condition"],row["CFlags"]))){//If the condition doesn't apply, don't execute the regex
      doExecution = false;
    }
    else if(row["Control"]=="while"){ //If the statement is a while statement and the condition is met
      loop = true;              //Read the same line again next time
    }
  }
  if(row["Method"]==="replace" && doExecution){
    // If the code is going to change, change it, otherwise, make sure you don't loop, or else infinite looping
    if(code != smolReplace(code,row["Pattern"],row["Flags"],row["Output"])){
      code = smolReplace(code,row["Pattern"],row["Flags"],row["Output"])
    }
    else{
      loop = false;
    }
  }
  else if(row["Method"]==="list" && doExecution){
    if(code != smolList(code,row["Pattern"],row["Flags"],row["Output"])){
      code = smolList(code,row["Pattern"],row["Flags"],row["Output"])
    }
    else{
      loop = false;
    }
  }
  else if(row["Method"]==="reverse" && doExecution){
    if(code != smolReverse(code,row["Pattern"],row["Flags"],row["Output"])){
      code = smolReverse(code,row["Pattern"],row["Flags"],row["Output"])
    }
    else{
      loop = false;
    }
  }
  else{
    loop = false;
  }
  return loop?doTransform(code,row):code; //If we flagged this for looping, do the transform again until it just returns code;
}