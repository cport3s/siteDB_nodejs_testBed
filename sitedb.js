/* -------------------------------------------------------Library imports------------------------------------------------------- */
const http = require('http');
var filesystem = require('fs');
var url = require('url');
var mysql = require('mysql');

/* ---------------------------------------------------------Global vars--------------------------------------------------------- */
let queryResults = [];
let port = 8080;
const db_con = mysql.createConnection({
  host: 'bscserver',
  user: 'sitedb',
  password: 'BSCAltice.123',
  database: 'alticedr_sitedb'
});

/* ----------------------------------------------------------Main Code---------------------------------------------------------- */
/* Database connection: must establish db connection before starting server. Avoid repeated connections. */
db_con.connect(function(err) {
    if (err) {
      throw err;
    };
    console.log('Started web server on port ' + port)
    console.log('Connected to DB!');
});

 const server = http.createServer(function(request, response) {
    /* Parse URL */
    var route = url.parse(request.url, true);
    /* Build filepath based on the URL */
    var filepath = "." + route.pathname;
    var siteID = route.query['fe_siteid'];
    if (typeof siteID == 'string') {
        db_con.query("select * from ltecellpara where enbid = '" + siteID + "';", function(err, results, fields) {
            if (err) {
              throw err;
            };
            // Need to parse the query results as a list on querResults variable
            for (let i = 0; i < results.length; i++){
                queryResults.push(results[i]);
            };
        });
      };
      /* End databse connection */
      //db_con.end();
    /* Check if the URL came on root dir, and convert filepath to main.html file */
    if (filepath == "./") {
      filepath = "./main.html"
    };
    filesystem.readFile(filepath, function(err, data) {
        /* If filename in filepath not found, then.... */
        if (err) {
            response.writeHead(404, {'Content-Type': 'text/html'});
            return response.end("404 Not Found");
        } else {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data);
            response.write('<section class="flexContainer">');
            response.write('<div class="flexItem">Cell Name</div>');
            response.write('<div class="flexItem">PCI</div>');
            response.write('<div class="flexItem">PRACH</div>');
            for (let i = 0; i < queryResults.length; i++) {
                response.write('<div class="flexItem">' + queryResults[i]['cellname'] + '</div>');
                response.write('<div class="flexItem">' + queryResults[i]['pci'] + '</div>');
                response.write('<div class="flexItem">' + queryResults[i]['prach'] + '</div>');
            };
            response.write('</section>');
            response.end();
        };
    });
});

server.listen(port);