var http = require('http'),
    https = require('https'),
    url = require('url'),
    querystring = require('querystring');

var port = process.env.PORT || 1337;

http.createServer(function (req, res) {
  if (req.url) {
    var parsedURL = url.parse(req.url, true);

    if (parsedURL.query && parsedURL.query.type && parsedURL.query.url) {
      if (parsedURL.query.type === "googleplus") {
        console.log(parsedURL.query);
        var options = {
          host: 'plusone.google.com',
          port: 443,
          path: '/_/+1/fastbutton?url=' + parsedURL.query.url.replace(/\/$/,"") // replace trailing slash which causes google plus not to find count
        };
        var out = "";
        https.get(options, function(goores) {
          console.log("Got response: " + goores.statusCode);
          goores.on('data', function (chunk) {
            out = out + chunk;
          });
          goores.on('end', function(){
            var match = out.match(/c:\s*([\d\.]+)/),
                count = match ? parseFloat(match[1]) : 0;
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('setJSON({"type": "' + parsedURL.query.type + '", "url": "' + parsedURL.query.url + '", "count": ' + count + '});');
          });

        });
      } else if (parsedURL.query.type === "stumbleupon") {
        console.log(parsedURL.query);
        var options = {
          host: 'www.stumbleupon.com',
          port: 443,
          path: '/services/1.01/badge.getinfo?url=' + parsedURL.query.url
        };
        var out = "";
        https.get(options, function(goores) {
          console.log("Got response: " + goores.statusCode);
          goores.on('data', function (chunk) {
            out = out + chunk;
          });
          goores.on('end', function(){
            var jsonResponse = JSON.parse(out);
            var count = jsonResponse.result.views || 0;
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('setJSON({"type": "' + parsedURL.query.type + '", "url": "' + parsedURL.query.url + '", "count": ' + count + '});');
          });

        });
      } else {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Service and/or URL not specified.');
      }
    }
  }

}).listen(port, '0.0.0.0');

console.log('Server running at http://0.0.0.0:' + port + '/');
