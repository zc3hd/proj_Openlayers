var conf = require('./conf.js');
var path = require('path');
var Tool = require('./tool.js');
var tool = new Tool();

var _path = "./";
// =================================一键上传本地数据库--->online
if (process.env.NODE_ENV == 'esc_db') {
  // 导出的路径、压缩、删除、上传
  tool
  // 导出文件夹
    ._cmd(`mongodump -h 127.0.0.1:27017 -d ${conf.db} -o ${_path}`)
    .then(function() {
      console.log('导出文件夹完成');
      // 压缩为tar包
      return tool._cmd(`tar -zcvf ${_path}${conf.db}.tar.gz ${_path}${conf.db}`)
    })
    .then(function() {
      console.log('压缩tar.gz完成');
      // 删除文件夹
      return tool._cmd(`rm -r ${_path}${conf.db}`)
    })
    .then(function() {
      console.log('删除文件夹完成');
      // 上传
      return tool._cmd(`scp -P ${conf.login_port} ${_path}${conf.db}.tar.gz ${conf.user}@${conf.ip}:/home/${conf.user}/${conf.db_to_olDir}/`)
    })
    .then(function() {
      console.log('上传完成');
      // 删除文件夹
      return tool._cmd(`rm ${_path}${conf.db}.tar.gz`)
    })
    .then(function() {
      console.log('删除tar.gz完成完成');
    });
}
// 
// =================================一键下载本地数据库-->根目录数据库文件夹
else if (process.env.NODE_ENV == 'db_dn') {
  tool
  // 导出文件夹
    ._cmd(`mongodump -h 127.0.0.1:27017 -d ${conf.db} -o ${_path}`)
    .then(function() {
      console.log('导出文件夹完成');
    });
}
// 
// =================================一键上传 根目录数据库文件夹-->本地数据库
else if (process.env.NODE_ENV == 'db_up') {
  tool
  // 删除原来的数据库
    ._cmd(`mongo --host 127.0.0.1:27017 ${conf.db} --eval "db.dropDatabase()"`)
    .then(function() {
      // 导入
      return tool._cmd(`mongorestore --host 127.0.0.1:27017 -d ${conf.db} ./${conf.db}/`);
    });
}
// 
// =================================一键上传文件到github
else if (process.env.NODE_ENV == 'git') {
  // 获取当前时间戳
  var timestamp = Date.parse(new Date());

  // 要提交的目录
  var _url = path.join(__dirname, './');

  var os = require('os');


  // 要提交的源的名字
  var origin = (os.hostname() == "LAPTOP-UJ33NHEM" ? "origin" : "name");



  tool
  // 导出数据库
    ._cmd(`git add ${_url}`)
    // 
    // .then(function() {
    //   return tool._cmd(`git add ${_url}`);
    // })
    .then(function() {
      return tool._cmd(`git commit -m "date:${tool._date(timestamp)}"`);
    })
    .then(function() {
      return tool._cmd(`git push -u ${origin} master`)
    })
    .then(function() {
      console.log('上传git完成');
    });
}
