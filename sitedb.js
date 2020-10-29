/* -------------------------------------------------------Library imports------------------------------------------------------- */
const http = require('http');
var filesystem = require('fs');
var url = require('url');
var mysql = require('mysql');
var plotly = require('plotly')("caportes", "b2KoPnm59Hop40wJA06D")

/* ---------------------------------------------------------Global vars--------------------------------------------------------- */
let lteQueryResults = [];
let umtsQueryResults = [];
let gsmQueryResults = [];
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
    var siteID = route.query['siteID'];
    if (typeof siteID == 'string') {
        db_con.query("select * from ltecellpara where enbid = '" + siteID + "';", function(err, results, fields) {
            if (err) {
              throw err;
            };
            // Need to parse the query results as a list on querResults variable
            for (let i = 0; i < results.length; i++) {
                lteQueryResults.push(results[i]);
            };
        });
        db_con.query("select * from umtscellpara where unodebid = '" + siteID + "';", function(err, results, fields) {
            if (err) {
              throw err;
            };
            // Need to parse the query results as a list on querResults variable
            for (let i = 0; i < results.length; i++) {
                umtsQueryResults.push(results[i]);
            };
        });
      };
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
            // Write UMTS Information Section
            if (umtsQueryResults.length > 0) {
                response.write('<section class="flexContainer">');
                response.write('<div class="flexItem">Cell Name</div>');
                response.write('<div class="flexItem">Cell ID</div>');
                response.write('<div class="flexItem">PSC</div>');
                response.write('<div class="flexItem">DL uARFCN</div>');
                response.write('<div class="flexItem">UL uARFCN</div>');
                response.write('<div class="flexItem">Band</div>');
                response.write('<div class="flexItem">LAC</div>');
                response.write('<div class="flexItem">RAC</div>');
            };
            for (let i = 0; i < umtsQueryResults.length; i++) {
                response.write('<div class="flexItem">' + umtsQueryResults[i]['ucellname'] + '</div>');
                response.write('<div class="flexItem">' + umtsQueryResults[i]['ucellid'] + '</div>');
                response.write('<div class="flexItem">' + umtsQueryResults[i]['upsc'] + '</div>');
                response.write('<div class="flexItem">' + umtsQueryResults[i]['dlarfcn'] + '</div>');
                response.write('<div class="flexItem">' + umtsQueryResults[i]['ularfcn'] + '</div>');
                response.write('<div class="flexItem">' + umtsQueryResults[i]['uband'] + '</div>');
                response.write('<div class="flexItem">' + umtsQueryResults[i]['ulac'] + '</div>');
                response.write('<div class="flexItem">' + umtsQueryResults[i]['urac'] + '</div>');
            };
            response.write('</section>');
            // Write LTE Information Section
            if (lteQueryResults.length > 0) {
                response.write('<section class="flexContainer">');
                response.write('<div class="flexItem">Cell Name</div>');
                response.write('<div class="flexItem">Cell ID</div>');
                response.write('<div class="flexItem">PCI</div>');
                response.write('<div class="flexItem">PRACH</div>');
                response.write('<div class="flexItem">eARCFN</div>');
                response.write('<div class="flexItem">Band</div>');
                response.write('<div class="flexItem">TAC</div>');
                response.write('<div class="flexItem">Transmission Mode</div>');
                response.write('<div class="flexItem">Cell Radius</div>');
            };
            for (let i = 0; i < lteQueryResults.length; i++) {
                response.write('<div class="flexItem">' + lteQueryResults[i]['cellname'] + '</div>');
                response.write('<div class="flexItem">' + lteQueryResults[i]['cellid'] + '</div>');
                response.write('<div class="flexItem">' + lteQueryResults[i]['pci'] + '</div>');
                response.write('<div class="flexItem">' + lteQueryResults[i]['prach'] + '</div>');
                response.write('<div class="flexItem">' + lteQueryResults[i]['arfcn'] + '</div>');
                response.write('<div class="flexItem">' + lteQueryResults[i]['band'] + '</div>');
                response.write('<div class="flexItem">' + lteQueryResults[i]['tac'] + '</div>');
                response.write('<div class="flexItem">' + lteQueryResults[i]['txmode'] + '</div>');
                response.write('<div class="flexItem">' + lteQueryResults[i]['cellrad'] + '</div>');
            };
            response.write('</section>');
            response.end();
        };
    });
});

server.listen(port);