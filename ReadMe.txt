# qubixApi.js

In this readMe file: 
    * DESCRIPTION 
    * ROUTS 
    * EXAMPLE 
    * ERRORS 
    * INSTRUCTIONS 
    * ADDITIONAL NOTES 
    * WHY NODE.JS 
    * CATERING TO DIFFERENT API USERS 
    * ANYTHING ELSE 
  

DESCRIPTION: 
    This is the test application I am building for Qubix, it is made following the instructions in "APITest.pdf". 
    It uses the default path "/qubixApi" and by default port 6060 is used (Or the environment PORT variable). 
  
    It's functionality is to keep a list of Bridges that users can view or edit.

ROUTS: 
    * GET: /bridge/:id          //Fetch a bridge by id 
    * GET: /bridges/type/:type       //Fetch all bridge for a specific type (should paginate) 
    * PUT: /bridge/:id          //Update an existing Bridge 
    * POST: /bridge             //Store a new Bridge    (If an ID is not provided it assigned by the API. If an ID that is   already in use is provided the API will return an error) 
    * DELETE: /bridge/:id        //Delete a Bridge (If a bridge by that ID does not exist it returns a JSON with a error and   the user sent data)

EXAMPLE: 
    * Simple get request for a bridge 
        URL: "http://localhost:6060/qubixApi/bridge/1" 
  
    * A PUT request for updating a bridge using JSON 
        URL: "http://localhost:6060/qubixApi/bridge/2" 
        HEADER: Content-Type: application/json 
        BODY: 
        { 
            "name": "nice PBCS Bridge", 
            "description": "Bridge to Load super data and metadata into the PBCS application" 
        } 
      
      
    * A POST request for adding a new bridge using URL encode 
        URL: http://localhost:6060/qubixApi/bridges 
        HEADER: Content-Type: application/x-www-form-urlencoded     
        BODY: URL encoded key value pairs         //In postmen you simply use the x-www-form-urlencoded tab. 

ERRORS: 
    Errors are returned in the form of a JSON, the structure is: 
    { 
        "Error" : "explanation", 
        "URL" : "URL requested by the user (including query parameters)", 
        "JSON" : "Any body parameters the user sent" 
    } 
  
INSTRUCTIONS: 
    To install this app you need node.js and npm package manager.
    Using CMD go to the app folder and run "npm install", the manager will install all the required packages automatically, after that run "node qubixApi.js" and the app should be running.
   
    This app works by processing HTTP requests. 
    They can be made using Postman, a browser, or another application. 
    When making requests you must use the correct port (6060 by default). 
    The types of requests you can make are described in the ROUTS section.  
    Query parameters are made by appending Key=Value pairs to the URL after an initial '?' sign, they are separated by '&'. 
    Body parameters are used when sending data to the server. They can be sent either as a JSON or URL encoded form data, but the appropriate header must be used.
  
  
ADDITIONAL NOTES: 
    GET: /bridges/type/:type 
        Supports additional query parameters: 
            * limit - tells how many items you wish to receive at most per request. The API limit is set to 3 by default and max supported value is set to 5 by the API (can be changed). 
            * skip - tells where to begin query, works like a starting index in a table. This is NOT number of bridges skipped and may not directly correspond with bridge ID. 
            * jsonPagination - if set the API will return a JSON object that also contains useful parameters for constructing the next query. The parameters are Skip, Limit and queryForNext. 
        In addition, a full link to next "page" is provided in the headers unless there are no more possible results. 
        When the number of returned bridges is 0 or no link for next query is provided there are no more bridges left to query. 
    PUT: /bridge/:id 
        I only check for ID, any additional validation is not yet included. 
      
    API accepts URLencoding (application/x-www-form-urlencoded) and JSON (application/json) 
      

WHY NODE.JS: 
    The primary reason is that is what I was told to use :) 
    Aside from that node.js is a powerful environment that is very salable with request frequency and number of connections. 
    I also use the EpressJS framework, this makes routing much simpler and more readable. 
    Lastly, I included body-parser, this parses values from request body.

CATERING TO DIFFERENT API USERS: 
    This api is very adaptable already by responding in JSON. This allows virtually any application to make use of its responses. 
    When data needs to be sent to the server the API will accept both URL encoded form data and JSON, making it easy for a variety of users. 
  
ANYTHING ELSE: 
    This has been my first Node.js application as well as my first real RESTful api, I have learned a lot from making it and hope to learn a lot more. 

