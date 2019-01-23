var process = require('child_process');

function Tool() {}
Tool.prototype = {
  // 执行命令行
  _cmd: function(shell) {
    return new Promise(function(resolve, reject) {
      process.exec(shell, function(error, stdout, stderr) {
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        console.log(stdout, stderr)
        resolve();
      });
    });
  },
  // 返回日期
  _date: function(date, flag) {
    var me = this;
    if (!date) {;
      return false;
    } else {
      if (flag && flag == true) {
        var dt = new Date(date);
        return (dt.getFullYear() + "-" + me._reset_num(dt.getMonth() + 1) + "-" + me._reset_num(dt.getDate()));
      } else {
        var dt = new Date(date);
        return (dt.getFullYear() + "-" + me._reset_num(dt.getMonth() + 1) + "-" + me._reset_num(dt.getDate()) + " " + me._reset_num(dt.getHours()) + ":" + me._reset_num(dt.getMinutes()) + ':' + me._reset_num(dt.getSeconds()));
      }
    }
  },
  _reset_num: function(num) {
    if (num < 10) {
      return "0" + num;
    }
    return num;
  },
};


module.exports = Tool;
