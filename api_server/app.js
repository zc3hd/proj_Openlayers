var express = require('express');
var path = require('path');
var conf = require('../conf.js');

var app = express();
app.use(express.static(path.join(__dirname, '../webapp/')));

// api
// 测试API
app.post(conf.test_api, function(req, res) {
  res.send({
    ret:1
  });
});


app.post('/api/js_demo/font.do', function(req, res) {
  var size = Math.floor(Math.random() * 200);
  if (size < 60) {
    size = 60;
  }
  var color = Math.floor(Math.random() * 1000000);

  res.send({
    size: size,
    color: color,
  });
});





app.listen(conf.api_port);
console.log("server running at " + conf.api_port);
