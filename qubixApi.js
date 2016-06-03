var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var readline = require('readline')
var fs = require('fs');

var bridges = {};   //this will store the active bridges while the app is running
var keys;        //this will hold the property names/CSV column names
var lineNumber = 0;     //will be used to check for first line of CSV, later it will be reused in for generating unique IDs without having to go through the whole object or using random
readCSV('api test data.csv');   //get some bridges

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var port = port = process.env.PORT || 6060;
var partialPath = "/qubixApi";
var router = express.Router(); 

app.use(function(err, req, res, next) {
  // Do logging and user-friendly error message display
  console.error(err);
  res.status(500).json({ "Error" : "Something went wrong. If the JSON field in this object is empty it is likely that your data could not be parsed", "URL" : req.originalUrl, "JSON" : req.body});
});

router.get('/ReadMe*', function(req, res) {
    fileName = "ReadMe.txt";
    var options = {
        root: __dirname,
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
      };
    res.sendFile(fileName, options, function (err) {
        if (err) {
          console.log(err);
          res.status(err.status).end();
        }
        else {
          console.log('Sent:', fileName);
        }
    });
});

router.post('/bridge', function(req, res) {
  
  newBridge = req.body;
  if(newBridge["id"] == "" || typeof(newBridge["id"]) == "undefined"){       //Check if request has a desired ID
    while (!bridges[lineNumber] == "" || !typeof(bridges[lineNumber]) == "undefined" ) {   //if no ID was sent make one
        lineNumber++;
    }
    newBridge["id"] = lineNumber;
  }
  if(bridges[newBridge["id"]] == "" || typeof(bridges[newBridge["id"]]) == "undefined"){       //Check that ID is not being used
    //TODO: Validation goes here
    confirmPost = {
                "Success" : "POST: "+ req.originalUrl,  
                "newBridge" : newBridge
            }
    bridges[newBridge["id"]] = newBridge;       //add bnewBrisge to Bridges
    res.json(confirmPost);
    return;
  }
  res.json({ "Error" : "id in use", "URL" : req.originalUrl, "JSON" : req.body});
});

router.get('/bridge/:id', function(req, res) {
    if(bridges[req.params.id]){
        res.json(bridges[req.params.id]);   //finds  Bridge by ID and returns it 
        return;
    }
    res.status(404).json({ "Error" : "Bridge of that ID not found", "URL" : req.originalUrl, "JSON" : req.body});
});

router.put('/bridge/:id', function(req, res) {
  if(req.body.hasOwnProperty('id')){
    if(req.body.id != req.params.id){       //check if request would change id
        res.json({ "Error" : "id can not be updated", "URL" : req.originalUrl, "JSON" : req.body});
        return;
    }
  }
  
  if(req.params.id != undefined && bridges[req.params.id] != undefined){       //Check ID
    //TODO: Validation goes here
    oldBridge= JSON.stringify(bridges[req.params.id]);
    confirmPut = {
                "Success" : "PUT: "+ req.originalUrl, 
                "update" : req.body,
                "oldBridge" : JSON.parse(oldBridge),
                "newBridge" : "will be updated"             //should be changed a few lines lower, this is here for clarity of structure
            }
    //bridges[req.params.id] = req.body;     //this will put the newBridge in the bridges object regardles of if one existed before or not.
    updateObject(bridges[req.params.id], req.body)      //parameters from the sent JSON will be added to the bridge object at the selected ID
    confirmPut["newBridge"] = bridges[req.params.id];
    res.json(confirmPut);
    return;
  }
  res.json({ "Error" : "id not found", "URL" : req.originalUrl, "JSON" : req.body});
});

router.delete('/bridge/:id', function(req, res) {
    
  if(bridges[req.params.id]){
    confirmDelete = {
                "Success" : "DELETE: "+ req.originalUrl, 
                "deletedBridge" : bridges[req.params.id]
            }
    bridges[req.params.id] = undefined;     //faster then "delete bridges[req.params.id]"
    res.json(confirmDelete);
    return;
  }  
  res.json({ "Error" : "Bridge not found", "URL" : req.originalUrl, "JSON" : req.body});
  
});

router.get('/bridges', function(req, res) {     //for testing    
    res.json(bridges); 
});

router.get('/bridges/type/:type', function(req, res) {
    maxLimit = 5;       //set a limit to requests to prevent abuse.
    if(req.query.limit > maxLimit){
        res.json({ "Error" : "The maximum limit is "+maxLimit, "URL" : req.originalUrl, "JSON" : req.body});
        return;
    }
    page = getBridgeByType(req.params.type, parseInt(req.query.limit), parseInt(req.query.skip));
    if(!page.queryForNext == ""){
        res.header( 'Link', '<'+req.protocol+'://'+req.hostname+':'+port+partialPath+'/bridges/type/'+req.params.type+'?'+page.queryForNext+ (req.query.jsonPagination ?'&jsonPagination=true':'') +'>; rel="next"' );   //If there might be more bridges of the type a link is provided in headers
    }
    if(req.query.jsonPagination){
        res.json(page);             //responds with JSON that contains information to help user make their own link for next query
        return;
    }
    res.json(page.foundItems);   //responds with only the requested information, a link to next page is provided in headers
});

router.get('/*', function(req, res) {
    res.send('hooray! welcome to my api! \nBe sure check out the ReadME.txt');   
});

app.use(partialPath, router);
var server = app.listen(port);
console.log('Listening to port: ' + port);


/*** Past here are larger functions and functions that might be repeated to keep the above code more readable ***/

function getBridgeByType(type, limit, skip){
    limit = limit || 3;
    skip = skip || 0;
    bridgesOfType = [];
    found = 0;
    queryForNext = "";
    ids = Object.keys(bridges);     //make an array of all Keys for bridges in bridges object, this will be used to to more easily travers the bridges object.
    numberOfBridges = ids.length;
    for (; found < limit && skip < numberOfBridges; skip++){        //Traverse the bridges object while skipping any previously found bridges, stop when you reach the limit of bridges returned or end of array.
        if(type == bridges[ids[skip]]["type"]){     //find bridges of type, add them to answer and count how many are found
            found++;
            bridgesOfType.push(bridges[ids[skip]]);
        }
    }
    if(skip < numberOfBridges) queryForNext = "skip="+skip+"&limit="+limit;     //this will tell which skip value to use for next set of items, limit could be changed if desired
    page = {
        "queryForNext" : queryForNext,
        "skip" : skip,
        "limit" : limit,
        "totalItems" : numberOfBridges,
        "foundItems" : bridgesOfType
    }
    //console.log(ids);
    //console.log(skip);
    //console.log(lineNumber);
    //console.log(exports.lineNumber);
    //console.log(JSON.stringify(bridgesOfType));
    return page;
}

function updateObject(object, update){
    //Validation?
    for (param in update) {       
        object[param] = update[param];
    }
}
function readCSV(file){

    //Get sample data from CSV
    var rl = readline.createInterface({
        input: fs.createReadStream(file)
    });

    rl.on('line', function (line) {
        //console.log('Line from file:', line);     //used for debug
        
        if(lineNumber == 0){    //This app assumes the first line of the CSV contains field names
            keys = line.split(",");    //This app assumes the CSV is "," delimited and does not use any commas in the content
        }else{
            bridge = {};
            content = line.split(",");      //This app assumes the CSV is "," delimited and does not use any commas in the content
            for(i=0; i<content.length; i++){
                bridge[keys[i]] = content[i];    //populates bridge object with key value pairs
            }
            //console.log(JSON.stringify(bridge,null, "\t"), "\n --------------");
            bridges[bridge["id"]] = bridge;  //puts bridge in bridges object
        }
        lineNumber++;
    });
}

exports.getBridgeByType = getBridgeByType;
exports.updateObject = updateObject;
exports.getBridges = function(){return bridges};
exports.keys = keys;
exports.lineNumber = lineNumber;
exports.readCSV = readCSV;
exports.app = app;
exports.server = server;