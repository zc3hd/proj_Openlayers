(function($, window) {
  function Monitor(opts) {
    var me = this;
    me.map_id = opts.Map_id;

    // 配置项
    me.conf = {

      zoom: 4,
      // 最大最下层级限制
      maxZoom: 30,
      minZoom: 4,

      // 中心点
      center: [116.3979606203, 39.9081927703],


      // ==============================天地图的设置
      // 高图层
      index_1: 60,
      // 低图层
      index_0: 50,


      // model_style: new ol.style.Style({
      //   // 设置一个标识
      //   image: new ol.style.Icon({
      //     src: './img/icon.png',

      //     // 这个是相当于是进行切图了
      //     // size: [50,50],
      //     // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
      //     anchor: [0.5, 1],
      //     // 这个直接就可以控制大小了
      //     scale: 0.5,
      //     // 开启转向
      //     rotateWithView: true,
      //     // rotation: ele.rotation||3.14 * Math.random(),
      //   }),
      // }),

      // 样式
      model_style: new ol.style.Style({
        // 设置一个标识
        image: new ol.style.Circle({
          radius: 2,
          stroke: new ol.style.Stroke({
            color: 'rgb(0,0,0)'
          }),
          fill: new ol.style.Fill({
            color: 'rgb(0,0,0)'
          })
        }),
      }),


      // 多边形
      Polygon: new ol.style.Style({
        // 填充
        fill: new ol.style.Fill({
          color: 'rgba(0,0,255, 0.5)'
        }),
        // 线
        stroke: new ol.style.Stroke({
          color: 'rgb(0,0,0)',
          width: 2
        }),


        // 绘制的那个标记
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: 'rgb(47,79,79)'
          }),
          fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.6)'
          })
        }),
      }),
    };


    // 聚合的对象体
    me.all_obj = {
      // 地图图层的一些设置
      ol_map_layer: {

      },
      // 模型层
      model: {
        // 层容器
        layer: null,
        // 数据层
        data_c: null,
      },

      // 形成的对象
      gen: {
        // 用于收集生成模型的数据
        obj: {},
        arr: [],

        // 收集所有三角形数组的数据
        all_arr: [],
      },
    };

  };
  Monitor.prototype = {
    init: function() {
      var me = this;
      me._bind();


      me._data()
        .then(function() {
          me._ol_map();
        });

    },
    _bind: function() {
      var me = this;
      var fn = {
        _data: function() {
          return new Promise(function(resolve, reject) {
            $.get('./test.json')
              .then(function(data) {
                Model_data = data;
                resolve();
              });
          });
        },
        // 
        _gd_map: function() {

          me.gd_map = new AMap.Map("gd_map", {
            zoom: me.conf.zoom,
            zooms: [me.conf.minZoom, me.conf.maxZoom],
          });
          return new Promise(function(resolve, reject) {
            me.gd_map.on('complete', function(e) {
              resolve();
            });
          });
        },
        // 地图
        _ol_map: function() {
          me._ol_map_layer();

          me.ol_map = new ol.Map({
            // 让id为map的div作为地图的容器
            target: 'map',
            // 控件
            controls: ol.control.defaults({
              attribution: false,
              rotate: false,
              zoom: false
            }),
            // ol.View 设置显示地图的视图
            view: new ol.View({
              zoom: me.conf.zoom,
              projection: 'EPSG:4326',
              center: me.conf.center,

              maxZoom: me.conf.maxZoom,
              minZoom: me.conf.minZoom,
            }),
            // 设置地图图层
            layers: [
              // 普通
              me.all_obj.ol_map_layer.tdt_pt,
            ],
          });

          me._model();
          // me._gen();
        },







        // 数据
        _model: function() {
          // 开启层
          me._model_layer();

          // 渲染全部数据
          // me._model_data_render();

          // 数据模型生成
          me._gen();
        },
        _model_layer: function() {
          // 矢量容器层
          me.all_obj.model.layer = new ol.layer.Vector({
            zIndex: 99
          });

          // 数据层--可以注入多个Feature，每个feature有自己的数据和样式
          me.all_obj.model.data_c = new ol.source.Vector();

          // 注入数据层
          me.all_obj.model.layer.setSource(me.all_obj.model.data_c);

          // 注入地图
          me.ol_map.addLayer(me.all_obj.model.layer);
        },
        // 数据渲染
        _model_data_render: function() {
          // 清除数据
          me.all_obj.model.data_c.clear();

          // 
          Model_data.forEach(function(ele, index) {
            me._model_marker(ele);
          });

          // 
          me._ol_map_ps_fit(me.all_obj.model.data_c);
        },
        // 打点
        _model_marker: function(ele) {
          var p_data = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point([ele.lng, ele.lat]),
          });

          // 属性挂载
          p_data._id = ele.id;

          // 样式
          p_data.setStyle(me.conf.model_style);

          // 注入地图
          me.all_obj.model.data_c.addFeature(p_data);

          // 回收
          p_data = null;
        },












        // 模型生成
        _gen: function() {


          var arr = [];
          arr.push([Model_data[0].lng, Model_data[0].lat]);
          arr.push([Model_data[1].lng, Model_data[1].lat]);
          arr.push([Model_data[2].lng, Model_data[2].lat]);

          // 生成
          me._gen_ol_3Jiao(arr);


          me._gen_next(3);


        },

        // 继续生成
        _gen_next: function(index) {


          // if (condition) {
          //   // statement
          // }
          // 在上个三角形之内
          if (me._gen_gd_p_yes_no(index)) {

          }
          // 不在内部
          else {
            // 生成数据三角数据
            var arr = me._gen_data(index);
            // 生成三角形
            me._gen_ol_3Jiao(arr);

            // 回收
            arr = null;
          }

          // 循环
          index++;
          // console.log(index);
          if (index == 100) {
            // console.log(me.all_obj.gen.arr);
            return;
          }
          setTimeout(function() {
            me._gen_next(index);
          }, 1);
        },
        // =================================================
        // 判断点是否在三角形内部
        _gen_gd_p_yes_no: function(index) {
          var key = false;
          me.all_obj.gen.arr.forEach(function(ele, index) {
            key = AMap.GeometryUtil.isPointInRing(
              // 当前点
              me._gen_gd_p(index),
              // 上index个三角形的数据
              ele);
            if (key) {
              return key;
            }
          });
          return key;
        },
        // 高德点的数据
        _gen_gd_p: function(index) {
          // 下标返回的点位置
          if (typeof index == "number") {
            return new AMap.Marker({
              position: [Model_data[index].lng, Model_data[index].lat]
            }).getPosition();
          }
          // ele 返回的位置;
          return new AMap.Marker({
            position: index
          }).getPosition();
        },
        // 生成高德三角形的数据
        _gen_gd_3Jiao: function(arr) {
          return new AMap.Polygon({
            path: arr,
          }).getPath();
        },





        // =================================================
        // 生成数据
        _gen_data: function(p_index) {

          // 所有组的数据
          var all_arr = [];
          // 每个三角形的三组数据拿到
          var one_3zu = null;
          me.all_obj.gen.arr.forEach(function(ele, index) {
            // 每个模型生成三组数据
            one_3zu = me._gen_data_3jiao_3zu(ele, p_index);
            // 三组数据收集
            one_3zu.forEach(function(zu, index) {
              all_arr.push(zu);
            });
          });

          // 
          if (p_index == 5) {
            // console.log(all_arr)
          }

          // 生成组重叠的计数对象
          var all_arr_obj = {};
          all_arr.forEach(function(zu, index) {
            all_arr_obj[me._gen_data_3jiao_zu_str(zu)] = 0;
          });
          // console.log(all_arr_obj);

          // if (p_index == 5) {
          //   console.log(all_arr_obj);
          // }




          // console.log('======================================')
            // console.log()
            // 所有的组数据内循环，计数重叠的次数
          var one_die_str = null;
          // 所有模型循环
          me.all_obj.gen.arr.forEach(function(model, index) {
            // 所有组数据进行循环
            all_arr.forEach(function(zu, index) {

              // 判断是否与当前大模型重叠
              one_die_str = me._gen_data_3jiao_chongdie(model, zu);

              // 重叠
              if (one_die_str == 'yes') {
                all_arr_obj[me._gen_data_3jiao_zu_str(zu)] = all_arr_obj[me._gen_data_3jiao_zu_str(zu)] + 1;
              }


            });
          });

          



          // 找到没有重叠的组
          var all_arr_no_die = [];
          var min = all_arr_obj[me._gen_data_3jiao_zu_str(all_arr[0])];
          for (var zu_str in all_arr_obj) {
            // all_arr_no_die.push(me._gen_data_3jiao_str_zu(zu_str));
            if (min > all_arr_obj[zu_str]) {
              // 找到最小值
              min = all_arr_obj[zu_str];
            }
          }

          for (var zu_str in all_arr_obj) {
            // 
            if (all_arr_obj[zu_str]==min) {
              all_arr_no_die.push(me._gen_data_3jiao_str_zu(zu_str));
            }
          }




          // 最优的那个
          var best = null;
          best = me._gen_data_arr_best_one(all_arr_no_die);

          return best;
        },


        // 拿到三角形的三组数据
        _gen_data_3jiao_3zu: function(arr, p_index) {
          var arr_cp = arr.slice();
          // 当前点
          var p = [Model_data[p_index].lng, Model_data[p_index].lat];
          // 三个三角数据
          var arr_1 = [arr_cp[0], arr_cp[1], p];
          var arr_2 = [arr_cp[1], arr_cp[2], p];
          var arr_3 = [arr_cp[0], arr_cp[2], p];

          return [arr_1, arr_2, arr_3];
        },

        // 计算三角形是否重叠
        _gen_data_3jiao_chongdie: function(arr_f, arr_s) {
          // 父级三角形的数据
          var new_arr_f = arr_f.slice();
          var arr_data_f = me._gen_gd_3Jiao(new_arr_f);


          // 子项三角形的数据
          var new_arr_s = arr_s.slice();
          var arr_s_data = me._gen_gd_3Jiao(new_arr_s);

          // 
          var ringRingClip = AMap.GeometryUtil.ringRingClip(arr_data_f, arr_s_data);
          var ringArea = AMap.GeometryUtil.ringArea(ringRingClip);

          new_arr_f = null;
          arr_data_f = null;

          new_arr_s = null;
          arr_s_data = null;
          ringRingClip = null;


          // if (me.all_obj.gen.arr.length == 3) {
          //   // console.log(ringArea);
          // }

          // 重叠
          if (ringArea > 1) {
            ringArea = null;
            return "yes";
          }
          // 没有重叠
          else {
            ringArea = null;
            return "no";
          }
        },
        // 三角形的str
        _gen_data_3jiao_zu_str: function(arr) {
          var str = '';
          arr.forEach(function(p, index) {
            str += `${p[0]}_${p[1]}*`;
          });
          return str;
        },
        // 字符转数组
        _gen_data_3jiao_str_zu: function(str) {
          var arr = str.split("*");
          arr.length = arr.length - 1;
          // console.log(arr);

          var last = [];
          var p = null;
          arr.forEach(function(p_str, index) {
            p = p_str.split("_");
            // console.log(p);
            p.forEach(function(ele, index) {
              p[index] = ele * 1;
            });
            last.push(p);
          });
          return last;
        },


        // 数组中选出最优的那个
        _gen_data_arr_best_one: function(son_arr) {
          var bl_arr = [];
          // 变量数组
          son_arr.forEach(function(arr, index) {
            bl_arr.push({
              bl: me._gen_data_3jiao_LH_bili(arr),
              arr: arr,
            });
          });
          // console.log(bl_arr);

          // 
          var bl_min = bl_arr[0].bl;
          var bl_min_index = 0;
          bl_arr.forEach(function(ele, index) {

            if (ele.bl < bl_min) {
              bl_min = ele.bl;
              bl_min_index = index;
            }
          });

          // console.log(bl_arr,bl_min_index);

          // 返回
          return bl_arr[bl_min_index].arr;
        },
        // 得到比例，原则：到中点的距离比上垂直距离最小值，最优；
        _gen_data_3jiao_LH_bili: function(arr) {
          // 空数组 不选择
          if (arr.length == 0) {
            return 100000000;
          }

          var new_arr = arr.slice();
          var mid_p = [(new_arr[0][0] + new_arr[1][0]) / 2, (new_arr[0][1] + new_arr[1][1]) / 2];

          // 长度
          var L = me._gen_gd_p(new_arr[2]).distance(me._gen_gd_p(mid_p));

          // console.log(L,new_arr[2]);
          // 高
          var H = AMap.GeometryUtil.distanceToLine(me._gen_gd_p(new_arr[2]), [new_arr[0], new_arr[1]]);

          new_arr = mid_p = null;
          return L / H;
        },





        // 生成三角形
        _gen_ol_3Jiao: function(arr) {
          var p_1 = arr[0];
          var new_arr = arr.slice();
          new_arr.push(p_1);

          // 
          // ol模型
          var p_data = new ol.Feature({
            geometry: new ol.geom.Polygon([new_arr])
          });
          p_data.setStyle(me.conf.Polygon);
          me.all_obj.model.data_c.addFeature(p_data);


          // 收集
          me.all_obj.gen.obj[p_data.ol_uid] = arr;
          me.all_obj.gen.arr.push(arr);


          // 回收
          p_1 = null;
          new_arr = null;
          p_data = null;


          me._ol_map_ps_fit(me.all_obj.model.data_c);


          // console.log(me.all_obj.gen.obj);
        },





































































        // 最优视图
        _ol_map_ps_fit: function(data) {
          var p = null;
          var min_lng = data.getFeatures()[0].getGeometry().flatCoordinates[0];
          var min_lat = data.getFeatures()[0].getGeometry().flatCoordinates[1];

          var max_lng = data.getFeatures()[0].getGeometry().flatCoordinates[0];
          var max_lat = data.getFeatures()[0].getGeometry().flatCoordinates[1];
          // console.log(data.getFeatures());
          // 单个
          if (data.getFeatures().length == 1) {

            // console.log(data.getFeatures()[0].getGeometry().getCoordinates());
            me.ol_map.getView()
              .centerOn(
                data.getFeatures()[0].getGeometry().getCoordinates(),
                me.ol_map.getSize(), [$(document).width() / 2, $(document).height() / 2]);

            me.ol_map.getView().setZoom(15);
          }
          // 多个
          else {

            data.getFeatures().forEach(function(ele, index) {
              p = ele.getGeometry().flatCoordinates;
              // console.log(p);
              // 最小经度
              if (p[0] < min_lng) {
                min_lng = p[0];
              }

              // 最小纬度
              if (p[1] < min_lat) {
                min_lat = p[1];
              }

              // 最大经度
              if (p[0] > max_lng) {
                max_lng = p[0];
              }

              // 最大纬度
              if (p[1] > max_lat) {
                max_lat = p[1];
              }
            });

            me.ol_map.getView()
              .fit([min_lng, min_lat, max_lng, max_lat], {
                size: me.ol_map.getSize(),
                padding: [100, 100, 100, 100],
                constrainResolution: false
              });
          }
        },
        // 地图层的设置
        _ol_map_layer: function() {
          // 普通图
          me.all_obj.ol_map_layer.tdt_pt = new ol.layer.Tile({
            source: me._ol_map_source_get("vec_c"),
            zIndex: me.conf.index_1
          });
        },
        // 地图层的获取
        _ol_map_source_get: function(type) {
          var projection = ol.proj.get("EPSG:4326");
          var projectionExtent = projection.getExtent();
          var size = ol.extent.getWidth(projectionExtent) / 256;
          var resolutions = new Array(19);
          var matrixIds = new Array(19);
          for (var z = 1; z < 19; ++z) {
            // generate resolutions and matrixIds arrays for this WMTS
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = z;
          }

          return new ol.source.WMTS({
            url: 'http://t' + Math.round(Math.random() * 7) + '.tianditu.com/' + type + '/wmts?tk=' + conf.tdt,
            layer: type.substr(0, 3),
            matrixSet: type.substring(4),
            format: 'tiles',
            projection: projection,
            tileGrid: new ol.tilegrid.WMTS({
              origin: ol.extent.getTopLeft(projectionExtent),
              resolutions: resolutions,
              matrixIds: matrixIds
            }),
            style: 'default',
            wrapX: true
          });
        },
      };
      for (var k in fn) {
        me[k] = fn[k];
      };
    },
  };
  conf.module["Monitor"] = Monitor;
})(jQuery, window);
