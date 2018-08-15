'use strict';




// ***************************************监控状态的模拟数据
var ps_arr = [];
for (var i = 0; i < 10; i++) {
  ps_arr.push({
    id: i + 1,
    name: 'icon-' + i,
    lnglat: [115.9 + Math.random() * 0.5, 39.5 + Math.random() * 0.5],
    state: (Math.random() > 0.5 ? 1 : 0)
  });
}
// *********************************************************



// ***************************************历史轨迹的模拟数据
var lines_arr = [];

// 添加一个点
var lines_0 = [116.06, 39.67];
lines_arr.push(lines_0);
var new_p = null;
for (var j = 0; j < 20; j++) {
  // console.log(lines_arr[lines_arr.length-1]);
  new_p = [lines_arr[lines_arr.length - 1][0] + Math.random() * 0.01, lines_arr[lines_arr.length - 1][1] + Math.random() * 0.01];
  lines_arr.push(new_p);
}
// *********************************************************




// ****************************************围栏数据
var fence_data = [];
