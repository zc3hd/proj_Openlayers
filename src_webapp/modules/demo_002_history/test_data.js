'use strict';




// ***************************************历史轨迹的模拟数据
var lines_arr = [];

// 添加一个点
var lines_0 = [116.06, 39.67];
lines_arr.push(lines_0);
var new_p = null;
var x_num = 0.05;
for (var j = 0; j < 50; j++) {
  // console.log(lines_arr[lines_arr.length-1]);
  new_p = [
    Math.random() > 0.5 ? (lines_arr[lines_arr.length - 1][0] + Math.random() * x_num) : (lines_arr[lines_arr.length - 1][0] - Math.random() * x_num),
    lines_arr[lines_arr.length - 1][1] + Math.random() * x_num
  ];
  lines_arr.push(new_p);
}
