function smolReplace(input,pattern,flags,output){
  output = output.replace(/\\n/g,"~~n");
  output = output.replace(/\\t/g,"~~t");
  input = input.replace(new RegExp(pattern,flags),output);
  input = input.replace(new RegExp("~~t","g"),"\t");
  input = input.replace(new RegExp("~~n","g"),"\n");
  return input;
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