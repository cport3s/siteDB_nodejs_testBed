/* -------------------------------------------------------Library imports------------------------------------------------------- */
const http = require('http');
var filesystem = require('fs');
var url = require('url');
var mysql = require('mysql');

/* ---------------------------------------------------------Global vars--------------------------------------------------------- */
let ltac;
let sql_siteid;
let port = 8080;
const db_con = mysql.createConnection({
  host: 'bscserver',
  user: 'sitedb',
  password: 'BSCAltice.123',
  database: 'alticedr_sitedb'
});

/* ----------------------------------------------------------Main Code---------------------------------------------------------- */
 const server = http.createServer(function(request, response) {
  /* Parse URL */
  var route = url.parse(request.url, true);
  /* Build filepath based on the URL */
  var filepath = "." + route.pathname;
  var be_siteid = route.query['fe_siteid'];
  if (typeof be_siteid == 'string') {
    /* Database connection */
    db_con.connect(function(err) {
      if (err) {
        throw err;
      }
      console.log('Connected to DB!');
      db_con.query("select * from ltecellpara where enbid = '" + be_siteid + "';", function(err, results, fields) {
        if (err) {
          throw err;
        }
        sql_siteid = results[0]['enbname'].toString();
        ltac = results[0]['tac'].toString();
        console.log(sql_siteid);
        console.log(ltac);
      });
    });
  }
  /* Check if the URL came on root dir, and convert filepath to main.html file */
  if (filepath == "./") {
    filepath = "./main.html"
  }
  filesystem.readFile(filepath, function(err, data) {
    /* If filename in filepath not found, then.... */
    if (err) {
      response.writeHead(404, {'Content-Type': 'text/html'});
      return response.end("404 Not Found");
    } else {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(data);
      response.write('<section style="background-color: black; color: white;">');
      response.write('<p>eNodeB Name: ' + sql_siteid + '</p>');
      response.write('<p>TAC: ' + ltac + '</p>');
      response.write('</section>');
      response.end();
    }
  })
});

server.listen(function(port) {
  console.log('Server running at port 8080...')
});