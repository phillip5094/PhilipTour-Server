var express = require('express');
var url = require('url');
var fs = require('fs');
var bodyParser = require('body-parser');
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

var PTConstants = require('./PTConstants.js');
var PTResponse = require('./PTResponse.js');
var PTUser = require('./PTUser.js');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1111',
    database : 'PhilipTour'
});

var app =express();
connection.connect();

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.get('/', function(req,res){
	console.log("GET /");  
	var html = fs.readFile('./index.html', function(err, html){
		html = "" + html;
		if (err) throw err;
		res.writeHead(200, {"Content-Type":"text/html"});
		res.write(html);
		res.end();
	});
});

app.get('/user/login', function(req, res){
	console.log("GET /user/login");

	let userid = req.query.userid;
	let userpw = req.query.userpw;

	checkValidLogin(userid, userpw, (response) => {
		res.send(response);
	});
});

app.get('/user/searchpw', function(req, res){
	console.log("GET /user/searchpw");
	
	let userid = req.query.userid;

	searchPassword(userid, (response) => {
		res.send(response);
	});
});

app.get('/user/join', function(req, res){
	console.log("GET /user/join");
	
	let userid = req.query.userid;
	let userpw = req.query.userpw;
	
	joinUser(userid, userpw, (response) => {
		res.send(response);
	});
});

app.listen(8080, function(){
  console.log("Start Server");
});

function checkValidLogin(userid, userpw, callback) {
	var resultCode;
	var resultMessage;
	var resultData;

	sqlFindUser(userid, (result) => {
		if (result == null) {
			resultCode = PTConstants.PT_ERROR_AUTH_NOT_EXIST_USER;
			resultData = null;
		} else {
			if (userpw == result.userpw) {
				resultCode = PTConstants.PT_SUCCESS;
				resultData = new PTUser(result.idx, result.username, result.userid, result.userpw, result.regdate);
			} else {
				resultCode = PTConstants.PT_ERROR_AUTH_PASSWORD_MISSMATCH;
				resultData = null;
			}
		}
		resultMessage = errorMessage(resultCode);
		let response = new PTResponse(resultCode, resultMessage, resultData);
		callback(response);
	});
}

function joinUser(userid, userpw, callback) {
	var resultCode;
	var resultMessage;
	var resultData;

	sqlFindUser(userid, (result) => {
		if (result == null) {
			sqlInsertUser(userid, userpw, (result) => {
				if (result == null) {
					resultCode = PTConstants.PT_ERROR_AUTH_SERVER_ERROR;
					resultData = null;
				} else {
					resultCode = PTConstants.PT_SUCCESS;
					resultData = null;
				}
				resultMessage = errorMessage(resultCode);
				let response = new PTResponse(resultCode, resultMessage, resultData);
				callback(response);
			});
		} else {
			resultCode = PTConstants.PT_ERROR_AUTH_DUPLICATE_USERID;
			resultData = null;
			resultMessage = errorMessage(resultCode);
			let response = new PTResponse(resultCode, resultMessage, resultData);
			callback(response);
		}
	});
}

function searchPassword(userid, callback) {
	var resultCode;
	var resultMessage;
	var resultData;

	sqlFindUser(userid, (result) => {
		if (result == null) {
			resultCode = PTConstants.PT_ERROR_AUTH_NOT_EXIST_USER;
			resultData = null;
		} else {
			resultCode = PTConstants.PT_SUCCESS;
			resultData = new PTUser(result.idx, result.username, result.userid, result.userpw, result.regdate);
		}
		resultMessage = errorMessage(resultCode);
		let response = new PTResponse(resultCode, resultMessage, resultData);
		callback(response);
	});
}

function sqlFindUser(userid, callback) {
	let sql = "SELECT * from user where userid = ?";

	connection.query(sql, [userid], (error, results) => {
		if (results.length <= 0) {
			callback(null);
		} else {
			callback(results[0]);
		}
	});
}

function sqlInsertUser(userid, userpw, callback) {
	let regdate = moment().format("YYYY-MM-DD HH:mm:ss");

	let sql = "insert into user (userid, userpw, regdate) values (?, ?, ?)";

	connection.query(sql, [userid, userpw, regdate], (error, result) => {
		if (error) {
			callback(null);
		} else {
			callback(result);	
		}
	});

}

function errorMessage(errorCode) {
    switch(errorCode) {
        case PTConstants.PT_SUCCESS: 
            return "success";
        case PTConstants.PT_ERROR_AUTH_NOT_EXIST_USER:
            return "not exist user";
        case PTConstants.PT_ERROR_AUTH_INCORRECT_PASSWORD:
            return "incorrect password";
        case PTConstants.PT_ERROR_AUTH_INVALID_PARAMETER:
            return "invalid parameter";
        case PTConstants.PT_ERROR_AUTH_DUPLICATE_USERID:
            return "duplicate userID";
        case PTConstants.PT_ERROR_AUTH_PASSWORD_MISSMATCH:
            return "password missmatch";
        case PTConstants.PT_ERROR_AUTH_SERVER_ERROR:
            return "server error";
    }
}
