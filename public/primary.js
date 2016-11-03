
// Sends an XMLHttpRequest to the server, asking for data 
// The first argument should contain the URL on the server, with
// the query, and the second should be the name of the callback 
// function.  The callback gets one parameter, containing the 
// requested data.
function makeRequest(requestString, callbackFunction) {
    // first, make a request object
    var req = new XMLHttpRequest();
    
    // set up callback function
    // "onreadystatechange" method is called a bunch of times 
    // as the request makes its way out to the internet and back
    req.onreadystatechange = function() {
        if (req.readyState === XMLHttpRequest.DONE) {
            // the whole process is over
            if (req.status === 200) { // status 200 means all went well! 
                var resp = req.response;  // response shows up in the object
                callbackFunction(resp);     // call the callback function
            } else {
                console.log("Problem requesting data from server");
                console.log("Response code ",req.status);
            }
        }
    }

    var reqURL = "http://45.55.29.158:8369/query?"+requestString;
    req.open('GET', reqURL, true);  // load up the request string
    req.send(null);    // and send it off!
}

huffRequest();

function huffRequest()
{
        // first, make a request object
    var req = new XMLHttpRequest();
    
    // set up callback function
    // "onreadystatechange" method is called a bunch of times 
    // as the request makes its way out to the internet and back
    req.onreadystatechange = function() {
        if (req.readyState === XMLHttpRequest.DONE) {
            // the whole process is over
            if (req.status === 200) { // status 200 means all went well! 
                var resp = req.response;  // response shows up in the object
                huffCallBack(resp);     // call the callback function
            } else {
                console.log("Problem requesting data from server");
                console.log("Response code ",req.status);
            }
        }
    }

    var reqURL = "http://45.55.29.158:8369/query?getHuffData";
    req.open('GET', reqURL, true);  // load up the request string
    req.send(null);    // and send it off!
}

function newline(el){
    var br = document.createElement("br");
    el.appendChild(br);
}

function huffCallBack(response)
{
    var resp = JSON.parse(response)

    var subpop = [];
    for (i = 0; i < 3; i++)
    {
        questions = resp[i].questions;
        contest = "2016 California Democratic Presidential Primary";
        for (var j=0; j<questions.length; j++) {
            if (questions[j].name == contest) {
                subpop.push(questions[j].subpopulations);
                for (var k=0; k<subpop.length; k++) {
                    //console.log(subpop[k]);
                }
            }
        }
    }



    var pollsLeft = document.getElementById("pollsLeft");
    var pollsRight = document.getElementById("pollsRight");
    var br = document.createElement("br")
    for (i = 0; i < 3; i++)
    {
        console.log(resp[i].pollster)
        var text = document.createTextNode(resp[i].pollster + " " + resp[i].end_date);
        var hillaryText = document.createTextNode("   Hillary: " + subpop[i][0].responses[0].value + " Bernie: " + subpop[i][0].responses[1].value);
        pollsLeft.appendChild(text);
        pollsRight.appendChild(hillaryText);
        newline(pollsLeft);
        newline(pollsRight);
    }

    var textleft = document.createTextNode("Model Predicts Vote");
    pollsLeft.appendChild(textleft);
    newline(pollsLeft);
    var moreleft = document.createTextNode("Model Predicts Delegates")
    pollsLeft.appendChild(moreleft);
    newline(pollsLeft);


}



function Model(array, lowColor, highColor) {
    this.lowColor = lowColor;
    this.highColor = highColor;
    this.maxRatio = array[0];
    this.minRatio = this.maxRatio;
    this.ratios = [];
    for(var i = 0; i < array.length; i++) {
        var r = array[i];                           
        this.maxRatio = Math.max(this.maxRatio, r);  // update maxRatio
        this.minRatio = Math.min(this.minRatio, r);  // update minRatio
        this.ratios.push(r);                         // append to ratio list
    }
    
    this.colors = [];
    for(var i = 0; i < array.length; i++) {
        this.colors.push(this.calculateColor(i));   // for each ratio, calculate gradient color
    }
}



// converts this.ratios[index] to be a value between 0-1
Model.prototype.normalize = function(index) {
    return (this.ratios[index]-this.minRatio)/(this.maxRatio-this.minRatio);
}

// calculate gradient color for a given index
Model.prototype.calculateColor = function(index) {
    var norm = this.normalize(index);                // want high ratios to be gray, low ratios to be blue
    var resultColor = [0,0,0];
    for(var i = 0; i < this.lowColor.length; i++) {
        // interpolate between gray and blue
        resultColor[i] = Math.round( (this.highColor[i]-this.lowColor[i])*norm + this.lowColor[i] );
    }
    return this.colorToRGBString(resultColor);
}

Model.prototype.colorToRGBString = function(resultColor) {
    return "rgb("+resultColor.join(",")+")";
}

Model.prototype.gradientString = function() {
    return "linear-gradient(0deg,"+this.colorToRGBString(this.lowColor)+
                ","+this.colorToRGBString(this.highColor)+")";
}

// Color the map and blocks based on the model
function drawModel(resp) {
    resp = JSON.parse(resp);
    
    var bernieRatio = [];
    var totalHVotes = 0;
    var totalBVotes = 0;
    var bernieTotal = 0;
    for(var i = 0; i < resp.length; i++) {
        var current = resp[i];
        var disTotal = current.hVotes+current.bVotes;
        console.log("District " + (i+1) + " Hillary " + Math.round((current.hVotes/disTotal) * 100) + " Bernie " + Math.round((current.bVotes/disTotal) * 100));
        bernieRatio.push(current.bVotes/disTotal);
        bernieTotal += bernieRatio[i];
        totalHVotes += current.hVotes;
        totalBVotes += current.bVotes;
    }
    bernRatio = Math.round(100 * (bernieTotal/(resp.length)));
    hillRatio = 100 - bernRatio;

    var vote = document.getElementById("vote");
    vote.innerHTML = ("Hillary: " + hillRatio + " Bernie: " + bernRatio);
    newline(vote);


    var newvote = document.getElementById("delegates");
    var hilldelegates = Math.round((hillRatio/100) * 470);
    var berndelegates = 470 - hilldelegates;
    newvote.innerHTML = ("Hillary: " + hilldelegates + " Bernie: " + berndelegates);
    newline(vote);

    // create the color gradient
    var m = new Model(bernieRatio, [255,0,0], [0,0,255]);
        
    var boxList = d3.selectAll(".delegateBox");
    boxList.style("background-color", "red");
    
    var topBars = d3.selectAll(".topbar")
    topBars.style("height", function(d, i){ 
            var numBernieDelegates = Math.round(districts[i]*bernieRatio[i]);
            return numBernieDelegates*5+"px";})
    
    var landTitles = d3.selectAll("path.land title");
    landTitles.text(function(d, i) {return d.id});
    
    var paths = d3.selectAll("path.land");
    paths.style("fill", function(d){return m.colors[d.id-1]});
    
    var stateDelegates = d3.selectAll(".stateBox");
    var percentBernieVotes = totalBVotes/(totalHVotes+totalBVotes);
    total = Math.round(percentBernieVotes*stateWide.length);
    stateDelegates.style("background-color", 
        function(d, i){
            if(i<total)
                return"rgb(0,0,255)" ;
            else 
                return "rgb(255,0,0)";})
            
    updateScale(m);
}
