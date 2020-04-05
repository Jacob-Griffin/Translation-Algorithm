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

function smolSwap(input,first,firstFlags,second,secondFlags){
	//Remove g from flags
	firstFlags = firstFlags.replace(/g/g,"");
	secondFlags = firstFlags.replace(/g/g,"");

	try{
		//get the current value of each match
		var firstSection = input.match(new RegExp(first,firstFlags))[0];
		var secondSection = input.match(new RegExp(second,secondFlags))[0];

		//Add a ~ to distinguish a replaced instance from an unreplaced instance
		input = input.replace(new RegExp(first,firstFlags),"$&~");
		input = input.replace(new RegExp(second,secondFlags),"$&~");

		//Change the pattern to also include the ~
		first = (first == "$")?"~$":first+"~";
		second = (second == "$")?"~$":second+"~";

		//Replace first~ with second and second~ with first
		input = input.replace(new RegExp(first,firstFlags),secondSection);
		input = input.replace(new RegExp(second,secondFlags),firstSection);

		//The extra tilde business prevents me from turning the first section into a match for the second section, then turning it right back
		return input;
	}
	catch(err){
		//This catches such errors as bad patterns or null matches
		return input;
	}
}

function smolTab(input,pattern,flags,output){
  if(flags.indexOf("g")>-1){
    var sections = input.match(new RegExp(pattern,flags));
    if(sections === null) return input;
    flags = flags.replace(/g/,""); //Delete the g flag so we can match each section individually
    for(let i = 0; i < sections.length; i++){
      var section = sections[i].replace(/^/gm,"\t");   //Add the tab to the beginning of each line
      input = input.replace(sections[i],section); //replace the section we selected with our new tabulated section
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

function smolDetab(input,pattern,flags,output){
  if(flags.indexOf("g")>-1){
    var sections = input.match(new RegExp(pattern,flags));
    if(sections === null) return input;
    flags = flags.replace(/g/,""); //Delete the g flag so we can match each section individually
    for(let i = 0; i < sections.length; i++){
      var section = sections[i].replace(/^\t/gm,"");   //Remove the tab from the beginning of each line
      input = input.replace(sections[i],section); //replace the section we selected with our new detabulated section
    }
  }
  else{
    var selection = input.match(new RegExp(pattern,flags)); //Grab the section we're tabbing
    if(selection === null) return input; //If there was no match, return the original input
    else section = selection[0];
    section = section.replace(/^\t/gm,"");   //Remove the tab from the beginning of each line
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