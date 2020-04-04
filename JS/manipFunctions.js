function smolReplace(input,pattern,flags,output){
  try{
    output = output.replace(/\\n/g,"~~n");
    output = output.replace(/\\t/g,"~~t");
    input = input.replace(new RegExp(pattern,flags),output);
    input = input.replace(new RegExp("~~t","g"),"\t");
    input = input.replace(new RegExp("~~n","g"),"\n");
    return input;
  }
  catch(err){
    return input; //If there are any issues, pretend the line doesn't exist
  }
}

function smolList(input,pattern,flags,output){
  output = output.replace(/\\n/g,"~~n");
  output = output.replace(/\\t/g,"~~t");
  groupList = input.match(new RegExp(pattern,flags));
  if(!groupList) return "";

  var result = "";
  if(flags.indexOf("g")>-1){
    flags = flags.replace(/g/,''); //Remove the g flag so we can find capture groups in each match
    for(let i = 0; i < groupList.length; i++){
      var subMatch = groupList[i].match(new RegExp(pattern,flags));
      result = result + matchGroups(subMatch,output);
    }
    result = result.replace(new RegExp("~~t","g"),"\t");
    result = result.replace(new RegExp("~~n","g"),"\n");
    return result;
  }
  else{
    result = matchGroups(groupList,output);
    result = result.replace(new RegExp("~~t","g"),"\t");
    result = result.replace(new RegExp("~~n","g"),"\n");
    return result;
  }
}

function smolTab(input,pattern,flags,output){
  if(flags.indexOf("g")>-1){
    var sections = input.match(new RegExp(pattern,flags));
    if(sections === null) return input;

    for(i in sections){
      var section = i[0]; //Grab the section we're tabbing
      section = section.replace(/^/gm,"\t");   //Add the tab to the beginning of each line
      input = input.replace(new RegExp(pattern,flags),section); //replace the section we selected with our new tabulated section
    }
  }
  else{
    var selection = input.match(new RegExp(pattern,flags)); //Grab the section we're tabbing
    if(selection === null) return input; //If there was no match, return the original input
    else section = selection[0];
    section = section.replace(/^/gm,"\t");   //Add the tab to the beginning of each line
    input = input.replace(new RegExp(pattern,flags),section); //replace the section we selected with our new tabulated section
  }
  
  return input;
}

function matchGroups(groupList,output){
  var tempOutput = output;
  for(let i = 0; i < groupList.length; i++){
    tempOutput = tempOutput.replace(new RegExp("\\$"+i,"g"),groupList[i]);
  }
  return tempOutput;
}

function smolReverse(input,pattern,flags,output){
  //Get each match as a list
  groupList = input.match(new RegExp(pattern,flags));
  if(!groupList) return input;

  if(flags.indexOf("g")>-1){ //If this is a global pattern, we need to find all matches
    for(let i = 0; i < groupList.length; i++){
      input = input.replace(groupList[i],reverse(groupList[i]))
    }
  }
  else{//If this isn't a global pattern, we can simply do one replace
    //replace the matched pattern with the reverse of the matched pattern
    input = input.replace(new RegExp(pattern,flags),reverse(groupList[0]));
  }
  return input;
}

function reverse(s) {
  return s.split('').reverse().join('');
}