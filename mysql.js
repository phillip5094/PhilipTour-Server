var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'userid',
    password : 'userpw',
    database : 'PhilipTour'
});

