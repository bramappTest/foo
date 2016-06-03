var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(require('chai-json-schema'));
chai.use(chaiHttp);
var expect = require('chai').expect;
var qApi = require('../qubixApi');
var server = qApi.server;
//var t = require('./t');


describe('GET', function(){
    it('get a single bridge at /bridges/:id GET', function(done){
        chai.request(server)
        .get('/qubixApi/bridge/1')
        .end(function(err, res){
          //console.log(res);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property('id');
          expect(res.body.id).to.equal('1');
          done();
        });
    });
    it('get bridges of type at /bridges/type/:type?limit=1', function(done){
        chai.request(server)
        .get('/qubixApi/bridges/type/bics?limit=1')
        .end(function(err, res){
          //console.log(res);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body[0]).to.have.property('id');
          expect(res.body[0].id).to.equal('1');
          expect(res.body[0]).to.have.property('type');
          expect(res.body[0].type).to.equal('bics');
          expect(res).to.have.header('Link');
          expect(res.getHeader('Link')).to.contain("skip").and.contain("limit");
          done();
        });
    });
});

/*
describe('test', function(){
    it('Totes', function(){
        expect(t.fnc()).to.be.a('string');
    });
});

describe('getBridgeByType', function(){
    var types = ["bics","pbcs",""," ","something wrong"];
    
    qApi.readCSV('api test data.csv');
    console.log(qApi.lineNumber);
    console.log(Object.keys(qApi.getBridges()));
    
    it('returns a object', function(){
        
        for(type in types){
            expect(qApi.getBridgeByType(type)).to.be.a('object');
        }
    });
    it('conforms to the pageSchema', function(){
        
        for(type in types){
            expect(qApi.getBridgeByType(type)).to.be.jsonSchema(pageSchema);
        }
    });
    it('paginates correctly', function(){
        
        for(type in types){
            expect(iteratePages(type, 1, 0)).to.be.true;
            expect(iteratePages(type, 3, 0)).to.be.true;
            expect(iteratePages(type, 10, 0)).to.be.true;
        }        
    });
    
    function iteratePages(type, limit, skip){  //will recursively call for next page
        correct = true;
        page = qApi.getBridgeByType(type, limit, skip)
        //console.log(skip);
        if(page.queryForNext.length>0){
            correct = iteratePages(page.skip, page.limit);
        }
        if(page.totalItems<skip){
            correct = false;
            throw ("Skip is larger than number of items");
        }
        if(page.queryForNext){
            correct = page.queryForNext === ("skip="+page.skip+"&limit="+page.limit);
            if(!correct){
                throw "The queryForNext is not right";
            }
        }
        return correct;
    }
});


var errorSchema = {
	"title": "Schema for errors",
	"type": "object",
	"required": ["Error", "URL", "JSON"],
	"properties": {
		"Error": {
			"type": "string"
		},
		"URL": {
			"type": "string"
		},
		"JSON": {
			"type": "string"
		}
	}
};
var pageSchema = {
	"title": "Schema for pages",
	"type": "object",
	"required": ["queryForNext", "limit", "skip", "foundItems"],
	"properties": {
		"queryForNext": {
			"type": "string"
		},
		"limit": {
			"type": "number",
            "minimum": 0
		},
		"skip": {
			"type": "number",
            "minimum": 0
		},
        "foundItems": {
			"type": "array"
		}
	}
};
*/