const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  port: 3306,
  user     : 'root',
  password : '',
  database : '2171623'
});
 
connection.connect();
 
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
 
connection.end();