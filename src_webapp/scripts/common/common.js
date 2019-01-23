/**
 * Created on 2017/12/13 BY zhanghongc
 */
var FN = {
  //获取cookie
  getCookie: function(c_name) {
    if (document.cookie.length > 0) {
      c_start = document.cookie.indexOf(c_name + "=");
      if (c_start != -1) {
        c_start = c_start + c_name.length + 1;
        c_end = document.cookie.indexOf(";", c_start);
        if (c_end == -1)
          c_end = document.cookie.length;
        return unescape(document.cookie.substring(c_start, c_end))
      }
    }
    return ""
  },
  //设置cookie
  setCookie: function(c_name, value, expiredays, path) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + ((path == null) ? "" : ";path=" + path + ";domain=capcare.com.cn");
  },
  //清除cookie
  clearCookie: function() {
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    if (keys) {
      for (var i = keys.length; i--;)
        document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
    }
  },
  //-------------------------------------------------获取浏览器url的参数
  getParam: function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
      return unescape(r[2]);
    return null;
  },
  //-------------------------------------------------数字保留两位小数 
  toDecimal: function(obj) {
    if (isNaN(obj.value)) {
      obj.value = ""
    } else {
      if (obj.getAttribute("data-name") == 1) {
        if (obj.value >= 1000) {
          obj.value = "999.99"
        }
      }
      obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
    }
  },
  //-------------------------------------------------时间戳转日期
  f_miao_str: function(date, flag) {
    var me = this;
    if (!date) {;
      return false;
    } else {
      if (flag && flag == true) {
        var dt = new Date(date);
        return (dt.getFullYear() + "-" + me.checkNum(dt.getMonth() + 1) + "-" + me.checkNum(dt.getDate()));
      } else {
        var dt = new Date(date);
        return (dt.getFullYear() + "-" + me.checkNum(dt.getMonth() + 1) + "-" + me.checkNum(dt.getDate()) + " " + me.checkNum(dt.getHours()) + ":" + me.checkNum(dt.getMinutes()) + ':' + me.checkNum(dt.getSeconds()));
      }
    }
  },
  //日期转时间戳
  f_str_miao: function(str) {
    var me = this;
    var ser = new Date(str);
    var miao = Date.parse(ser);
    return miao;
  },

  checkNum: function(num) {
    if (num < 10) {
      return "0" + num;
    }
    return num;
  },
  // ---------------------------------------------时分秒修正 time h m s
  _time_fix: function(obj) {
    obj.h = obj.time.getHours() + '';
    obj.m = obj.time.getMinutes() + '';
    obj.s = obj.time.getSeconds() + '';

    if (obj.h.length == 1) {
      obj.h = '0' + obj.h;
    } else {
      obj.h = obj.h + '';
    }
    if (obj.m.length == 1) {
      obj.m = '0' + obj.m;
    } else {
      obj.m = obj.m + '';
    }
    if (obj.s.length == 1) {
      obj.s = '0' + obj.s;
    } else {
      obj.s = obj.s + '';
    }
  },
  //------------------------------------*------------设置datagrid中文显示
  setLangChina: function(id) {
    $('#' + id + '').datagrid('getPager').pagination({ //分页栏下方文字显示
      beforePageText: '第', //页数文本框前显示的汉字
      afterPageText: '页    共 {pages} 页',
      displayMsg: '当前显示：从第{from}条到{to}条 共{total}条记录',
      onBeforeRefresh: function(pageNumber, pageSize) {
        $(this).pagination('loading');
        //alert('pageNumber:'+pageNumber+',pageSize:'+pageSize);
        $(this).pagination('loaded');
      }
    });
  },
  //-------------------------------------------------坐标转换
  // convertWgsToGcj02: function(x, y) {
  //   var x1, tempx, y1, tempy;
  //   x1 = x * 3686400.0;
  //   y1 = y * 3686400.0;
  //   var gpsWeek = 0;
  //   var gpsWeekTime = 0;
  //   var gpsHeight = 0;

  //   var point = wgtochina_lb(1, Math.floor(x1), Math.floor(y1), Math.floor(gpsHeight),
  //     Math.floor(gpsWeek), Math.floor(gpsWeekTime));
  //   if (point == null) {
  //     return false
  //   } else {
  //     tempx = point.x;
  //     tempy = point.y;
  //     tempx = tempx / 3686400.0;
  //     tempy = tempy / 3686400.0;

  //     point.longitude = tempx;
  //     point.latitude = tempy;
  //     return point;
  //   }
  // },
  // convertGcj02ToBd09: function(gg_lon, gg_lat) {
  //   var x = gg_lon,
  //     y = gg_lat;
  //   var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  //   var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);

  //   var p = {};
  //   p.longitude = z * Math.cos(theta) + 0.0065;
  //   p.latitude = z * Math.sin(theta) + 0.006;

  //   return p;
  // },
  // wgtochina_lb: function(wg_flag, wg_lng, wg_lat, wg_heit, wg_week, wg_time) {
  //   var x_add;
  //   var y_add;
  //   var h_add;
  //   var x_l;
  //   var y_l;
  //   var casm_v;
  //   var t1_t2;
  //   var x1_x2;
  //   var y1_y2;
  //   var point = null;
  //   if (wg_heit > 5000) {
  //     return point;
  //   }
  //   x_l = wg_lng;
  //   x_l = x_l / 3686400.0;
  //   y_l = wg_lat;
  //   y_l = y_l / 3686400.0;
  //   if (x_l < 72.004) {
  //     return point;
  //   }
  //   if (x_l > 137.8347) {
  //     return point;
  //   }
  //   if (y_l < 0.8293) {
  //     return point;
  //   }
  //   if (y_l > 55.8271) {
  //     return point;
  //   }
  //   if (wg_flag == 0) {
  //     IniCasm(wg_time, wg_lng, wg_lat);
  //     point = {};
  //     point.latitude = wg_lng;
  //     point.longitude = wg_lat;
  //     return point;
  //   }
  //   casm_t2 = wg_time;
  //   t1_t2 = (casm_t2 - casm_t1) / 1000.0;
  //   if (t1_t2 <= 0) {
  //     casm_t1 = casm_t2;
  //     casm_f = casm_f + 1;
  //     casm_x1 = casm_x2;
  //     casm_f = casm_f + 1;
  //     casm_y1 = casm_y2;
  //     casm_f = casm_f + 1;
  //   } else {
  //     if (t1_t2 > 120) {
  //       if (casm_f == 3) {
  //         casm_f = 0;
  //         casm_x2 = wg_lng;
  //         casm_y2 = wg_lat;
  //         x1_x2 = casm_x2 - casm_x1;
  //         y1_y2 = casm_y2 - casm_y1;
  //         casm_v = Math.sqrt(x1_x2 * x1_x2 + y1_y2 * y1_y2) / t1_t2;
  //         if (casm_v > 3185) {
  //           return (point);
  //         }
  //       }
  //       casm_t1 = casm_t2;
  //       casm_f = casm_f + 1;
  //       casm_x1 = casm_x2;
  //       casm_f = casm_f + 1;
  //       casm_y1 = casm_y2;
  //       casm_f = casm_f + 1;
  //     }
  //   }
  //   x_add = Transform_yj5(x_l - 105, y_l - 35);
  //   y_add = Transform_yjy5(x_l - 105, y_l - 35);
  //   h_add = wg_heit;
  //   x_add = x_add + h_add * 0.001 + yj_sin2(wg_time * 0.0174532925199433) + random_yj();
  //   y_add = y_add + h_add * 0.001 + yj_sin2(wg_time * 0.0174532925199433) + random_yj();
  //   point = {};
  //   point.x = (x_l + Transform_jy5(y_l, x_add)) * 3686400;
  //   point.y = (y_l + Transform_jyj5(y_l, y_add)) * 3686400;
  //   return point;
  // },
  //-------------------------------------------------获取窗口视口的大小
  getClient: function() {
    if (window.innerWidth != null) {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      }
    } else if (document.compatMode == "CSS1Compat") {
      return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      }
    } else {
      return {
        width: document.body.clientWidth,
        height: document.body.clientHeight
      }
    }
  },
  //-------------------------------------------------md5加密
  md5: function(psw) {
    return $.md5(psw.toLowerCase()).toLowerCase();
  },
  //-------------------------------------------------验证手机号码
  checkPhone: function(phone) {
    if (!(/^1[3|4|5|7|8]\d{9}$/.test(phone))) {
      layer.msg('手机号码有误，请重新填写', { icon: 0, time: 1500 });
      return false;
    }
    return true;
  },
  // -------------------------------------------------测试ajax接口
  // -------------------------------------------------测试ajax接口
  // -------------------------------------------------测试ajax接口
  // -------------------------------------------------测试ajax接口
  test_ajax: function(root_path, arr) {
    arr.forEach(function(ele, index) {
      ele.url = root_path + ele.url;
      (function(ele) {
        var opt = {
          url: ele.url,
          dataType: "json",
          type: "POST",
        };
        if (ele.data) {
          opt.data = ele.data
        }
        $.ajax(opt)
          .done(function(data) {
            console.log(ele.name + '---done');
            console.log(data);
            console.log('\n');
          })
          .fail(function(data) {
            console.log(ele.name + '>>>-----fail');
          })
      })(ele)
    });
  },
  // -------------------------------------------------同源 or 跨域-AJAX发送
  // -------------------------------------------------同源 or 跨域-AJAX发送
  // -------------------------------------------------同源 or 跨域-AJAX发送
  // -------------------------------------------------同源 or 跨域-AJAX发送
  ajax: function(obj) {

    // ----同源请求
    // ----同源请求
    if (!conf.cors_key) {
      // 默认全部是POST请求
      var opts = {
        url: conf.root_path + obj.url,
        dataType: "json",
        type: "POST",
        // data: obj
      };

      // 存在
      if (obj.data != undefined) {
        opts.data = obj.data;
      }
      return $.ajax(opts);
    }
    // ----跨域请求
    // ----跨域请求
    else {

      var xhr = getHttpObj();

      xhr.open("post", "http://localhost:" + conf.cors_port + conf.root_path + obj.url, true);
      //缺少这句，后台无法获取参数  
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");

      // 存在参数
      if (obj.data != undefined) {
        var content = "";
        // var content = "appid=11111&sign=222222222";
        for (var key in obj.data) {
          content += key + '=' + obj.data[key] + '&';
        }
        content = content.slice(0, content.length - 1);
        xhr.send(content);
      }
      // 没有参数
      else {
        xhr.send();
      }


      var timer = null;
      // 自己写的函数
      xhr.done = function(cb) {
        timer = setInterval(function() {
          // 拿到请求
          if (xhr.readyState == 4 && xhr.status == 200) {
            cb(JSON.parse(xhr.responseText));
            clearInterval(timer);
          }
          // 没有拿到数据
          else {

          }
        }, 1);
      };
      return xhr;

      // 响应的函数
      // xhr.onreadystatechange = function() {

      //   if (xhr.readyState == 4 && xhr.status == 200) {

      //     var arr = JSON.parse(xhr.responseText);

      //     // console.log(arr);
      //   }
      // };
    }


    function getHttpObj() {
      var httpobj = null;
      try {
        httpobj = new ActiveXObject("Msxml2.XMLHTTP");
      }
      // 
      catch (e) {
        try {
          httpobj = new ActiveXObject("Microsoft.XMLHTTP");
        }
        // 
        catch (e1) {
          httpobj = new XMLHttpRequest();
        }
      }
      return httpobj;
    }
  },

  // ------------------------------------------------返回load加载层
  load: function() {
    /* body... */
    return layer.load(conf.load_sty, {
      shade: 0.6
    });
  },
  // ------------------------------------------------获取dom的视图高度
  dom_height: function(sel) {
    // 不存在该dom
    if ($(sel).length == 0) {
      return 0;
    } else {
      return $(sel).css('height').replace('px', '') * 1;
    }
  },
  // 视图宽度
  dom_width: function(sel) {
    // 不存在该dom
    if ($(sel).length == 0) {
      return 0;
    } else {
      return $(sel).css('width').replace('px', '') * 1;
    }
  },
  // ------------------------------------------------设置BOX的padding值
  _box_padding: function() {
    var pt = 0;
    if (FN.dom_height('.header') != 0) {
      pt += FN.dom_height('.header');
      pt += 5;
    }
    if (FN.dom_height('.tool') != 0) {
      pt += FN.dom_height('.tool');
      pt += 5;
    }
    $('.app>.box').css('paddingTop', pt + 'px');
  },


};
