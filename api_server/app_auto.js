var nodemon = require('gulp-nodemon');
var path = require('path');
nodemon({
  script: path.join(__dirname,'./app.js'),
  ignore: [
    path.join(__dirname,'../src_webapp/'),
    path.join(__dirname,'../webapp/'),
    path.join(__dirname,'../gulpfile.js'),
    path.join(__dirname,'../cmd.js'),
  ],
  env: { 'NODE_ENV': 'development' }
});
