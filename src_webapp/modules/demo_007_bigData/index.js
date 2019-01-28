(function($, window) {
  function Monitor(opts) {
    var me = this;
    me.map_id = opts.Map_id;

    // 配置项
    me.conf = {
      // -----------------------地图的设置
      zoom: 4,

      // 最大最下层级限制
      maxZoom: 30,
      minZoom: 4,

      midZoom: 16,
      // 中心点
      center: [116.3979606203, 39.9081927703],





      // ==============================天地图的设置
      // 高图层
      index_1: 60,
      // 低图层
      index_0: 50,



      // ================================前端页面的参数设置
      // 前端的页面刷新的视角
      web_time: 3000,
      web_timer: null,

      // 宏观数据的实时
      hong_time: 5000,
      hong_timer: null,

      // 微观的实时数据
      wei_time: 3000,
      wei_timer: null,




      // 宏观样式
      hong_style: new ol.style.Style({
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


      wei_style: new ol.style.Style({
        // 设置一个标识
        image: new ol.style.Icon({
          src: './img/user_1.png',

          // 这个是相当于是进行切图了
          // size: [50,50],
          // 注意这个，竟然是比例 左上[0,0]  左下[0,1]  右下[1，1]
          anchor: [0.5, 0.5],
          // 这个直接就可以控制大小了
          scale: 0.5,
          // 开启转向
          rotateWithView: true,
          // rotation: ele.rotation||3.14 * Math.random(),
        }),
        text: new ol.style.Text({
          // 对其方式
          textAlign: 'center',
          // 基准线
          textBaseline: 'middle',
          offsetY: -25,
          // 文字样式
          font: 'normal 16px 黑体',
          // 文本内容
          text: `name:admin`,
          // 文本填充样式
          fill: new ol.style.Fill({
            color: 'rgba(255,255,255,1)'
          }),
          padding: [5, 5, 5, 5],
          backgroundFill: new ol.style.Fill({
            color: 'rgba(0,0,0,0.6)'
          }),
        })
      }),
    };


    // 聚合的对象体
    me.all_obj = {
      // 地图图层的一些设置
      map_layer: {

      },

      // 宏观层的东西
      hong: {
        // 层容器
        layer: null,
        // 数据层
        data_c: null,

        // 第一次加载
        fit_key: false,
      },

      // 微观层
      wei: {
        // 层容器
        layer: null,
        // 数据层
        data_c: null,
      },


      // 层级的数据
      z_data: {

      }
    };


    // 
    me.api = {
      // 通过层级拿到数据
      hong_data: {
        url: '/tmpstation/findStationsByLevel.do'
      },

      // 单个用户信息
      wei_data: {
        url: '/tmpstation/findStations.do'
      },
    };

  };
  Monitor.prototype = {
    init: function() {
      var me = this;
      me._bind();
      me._map();
    },
    _bind: function() {
      var me = this;
      var fn = {
        // 最优视图
        _map_ps_fit: function(data) {
          var p = null;
          var min_lng = data.getFeatures()[0].getGeometry().flatCoordinates[0];
          var min_lat = data.getFeatures()[0].getGeometry().flatCoordinates[1];

          var max_lng = data.getFeatures()[0].getGeometry().flatCoordinates[0];
          var max_lat = data.getFeatures()[0].getGeometry().flatCoordinates[1];
          // 单个
          if (data.getFeatures().length == 1) {

            // console.log();
            me.map.getView()
              .centerOn(
                data.getFeatures()[0].getGeometry().getCoordinates(),
                me.map.getSize(), [$(document).width() / 2, $(document).height() / 2]);

            me.map.getView().setZoom(15);
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


            me.map.getView()
              .fit([min_lng, min_lat, max_lng, max_lat], {
                size: me.map.getSize(),
                padding: [100, 100, 100, 100],
                constrainResolution: false
              });
          }
        },
        // 地图层的设置
        _map_layer: function() {
          // 普通图
          me.all_obj.map_layer.tdt_pt = new ol.layer.Tile({
            source: me._map_source_get("vec_c"),
            zIndex: me.conf.index_1
          });

          // 
          // me.all_obj.map_layer.chang_j = new ol.layer.Tile({
          //   source: new ol.source.TileWMS({
          //     url: 'http://172.168.2.164:8080/geoserver/NHHY/wms?service=WMS&version=1.1.0&request=GetMap&layers=NHHY:cj&styles=&bbox=1.1636145E7,3335033.999999999,1.358618E7,3811091.4999999986&width=768&height=330&srs=EPSG:3857&format=application/openlayers',
          //   }),
          //   projection: 'EPSG:4326',
          //   zIndex: me.conf.index_1 + 1,
          // });

        },
        // 地图层的获取
        _map_source_get: function(type) {
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
        // 地图
        _map: function() {
          me._map_layer();

          me.map = new ol.Map({
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
              me.all_obj.map_layer.tdt_pt,
              // 长江
              // me.all_obj.map_layer.chang_j
            ],
          });

          // 
          me._hong();
          me._wei();

          // 地图事件
          me._map_ev();
        },
        // 点击事件
        _map_ev: function() {
          var str = ''
            // 滚动事件
          me.map.getView().on('change:resolution', function(e) {         
            str = me.map.getView().getZoom() + "";
            // 
            if (str.indexOf(".") != -1) {
              return;
            }
            // 拿到当前层级
            me.conf.zoom = me.map.getView().getZoom();

            console.log('层级：' + me.conf.zoom)
            // 宏观渲染一次
            me._hong_onec();

            // // 微观渲染一次
            me._wei_data_once();
          });

          // 
          me.map.on('moveend', function(event) {

            // 这个是找数据的
            str = me.map.getView().getZoom() + "";
            // 
            if (str.indexOf(".") != -1) {
              return;
            }
            // 拿到当前层级
            me.conf.zoom = me.map.getView().getZoom();

            // console.log(1);
            // 微观渲染一次
            me._wei_data_once();
          });
        },







        // 微观数据
        _wei: function() {
          // 开启层
          me._wei_layer();

          me._wei_time();
        },
        _wei_layer: function() {
          // 矢量容器层
          me.all_obj.wei.layer = new ol.layer.Vector({
            zIndex: 99
          });

          // 数据层--可以注入多个Feature，每个feature有自己的数据和样式
          me.all_obj.wei.data_c = new ol.source.Vector();

          // 注入数据层
          me.all_obj.wei.layer.setSource(me.all_obj.wei.data_c);

          // 注入地图
          me.map.addLayer(me.all_obj.wei.layer);
        },
        // 初始化话
        _wei_time: function() {
          me.conf.wei_timer = setInterval(function() {
            me._wei_data_once();
          }, me.conf.wei_time);
        },
        // 获取数据
        _wei_data_once: function() {
          // console.log(me.conf.zoom);
          // 在设置的左边：宏观模式
          if (me.conf.zoom < me.conf.midZoom) {
            // 地图清除数据
            me.all_obj.wei.data_c.clear();
            return;
          }

          // me.api.wei_data.data = {
          //   ltLng: me.map.getView().calculateExtent(me.map.getSize())[0],
          //   ltLat: me.map.getView().calculateExtent(me.map.getSize())[3],
          //   rbLng: me.map.getView().calculateExtent(me.map.getSize())[2],
          //   rbLat: me.map.getView().calculateExtent(me.map.getSize())[1],
          // };
          // //
          // FN.ajax(me.api.wei_data)
          //   .done(function(data) {
          //     // console.log(data);



          //   });
          // **************************************************测试数据
          w_min[0] = me.map.getView().calculateExtent(me.map.getSize())[0];
          w_min[1] = me.map.getView().calculateExtent(me.map.getSize())[1];
          w_max[0] = me.map.getView().calculateExtent(me.map.getSize())[2];
          w_max[1] = me.map.getView().calculateExtent(me.map.getSize())[3];
          var numb = 100;
          var arr = new Array(numb);
          for (var i = 0; i < arr.length; i++) {
            arr[i] = {
              id: i,
              lnglat: [w_min[0] + (w_max[0] - w_min[0]) * Math.random(), w_min[1] + (w_max[1] - w_min[1]) * Math.random()],
              rotation: 3.14 * Math.random(),
              name: i
            };
          }
          // **************************************************测试数据
          Wei_data = arr;
          console.log(`微观：${Wei_data.length}条数据`);

          // 数据渲染
          me._wei_data_render();
        },
        // 数据渲染
        _wei_data_render: function() {
          // 清除数据
          me.all_obj.wei.data_c.clear();

          // 
          Wei_data.forEach(function(ele, index) {
            me._wei_marker(ele);
          });
        },
        // 打点
        _wei_marker: function(ele) {
          var p_data = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point(ele.lnglat),
          });

          // 属性挂载
          p_data._id = ele.id;

          // 样式
          p_data.setStyle(me.conf.wei_style);

          // 注入地图
          me.all_obj.wei.data_c.addFeature(p_data);

          // 回收
          p_data = null;
        },





        _hong: function() {
          // 数据的设置
          me._hong_data_time();

          // 开启设备层
          me._hong_layer();

          // 开启实时
          me._hong_time();
        },
        // ===========================================
        // 数据的实时
        _hong_data_time: function() {
          me._hong_data_all();
          me.conf.hong_timer = setInterval(function() {
            // 存取全部数据
            me._hong_data_all();

            // console.log(me.all_obj.z_data);
          }, me.conf.hong_time);
        },
        // 存取全部数据
        _hong_data_all: function() {
          for (var i = me.conf.minZoom; i < me.conf.midZoom + 1; i++) {
            (function(zoom) {
              me._hong_data_one(zoom);
            })(i);
          }
        },
        // 存取层级的数据
        _hong_data_one: function(zoom) {
          // me.api.hong_data.data = {
          //   level: zoom,
          // };
          // //
          // FN.ajax(me.api.hong_data)
          //   .done(function(data) {
          //     // console.log(data);


          //     // arr = null;

          //   });

          // **************************************************测试数据
          var numb = 1000;
          var arr = new Array(numb * zoom);
          for (var i = 0; i < arr.length; i++) {
            arr[i] = {
              id: i,
              lnglat: [min[0] + (max[0] - min[0]) * Math.random(), min[1] + (max[1] - min[1]) * Math.random()],
            };
          }
          // **************************************************测试数据

          // console.log(JSON.stringify(arr));
          // arr.length = 0;
          // arr = null;

          me.all_obj.z_data[zoom] = arr;
        },
        // ===========================================
        // 单点渲染层生成
        _hong_layer: function() {

          // 矢量容器层
          me.all_obj.hong.layer = new ol.layer.Vector({
            zIndex: 99
          });

          // 数据层--可以注入多个Feature，每个feature有自己的数据和样式
          me.all_obj.hong.data_c = new ol.source.Vector();

          // 注入数据层
          me.all_obj.hong.layer.setSource(me.all_obj.hong.data_c);

          // 注入地图
          me.map.addLayer(me.all_obj.hong.layer);
        },
        // ===========================================
        // 地图数据打点
        _hong_time: function() {

          me._hong_onec();
          me.conf.web_timer = setInterval(function() {
            me._hong_onec();
          }, me.conf.web_time);
        },
        // 渲染一次
        _hong_onec: function() {

          // 获取数据
          me._hong_data_get(function() {
            console.log(`宏观：${Hong_data.length}条数据`);
            // 渲染设备数据
            me._hong_data_render();
          });
        },
        // 数据的获取
        _hong_data_get: function(cb) {

          // 在设置的右边：微观模式
          if (me.conf.zoom >= me.conf.midZoom) {
            // 地图清除数据
            me.all_obj.hong.data_c.clear();
            return;
          }

          // 拿到数据
          Hong_data = me.all_obj.z_data[me.conf.zoom];


          // 没有数据
          if (Hong_data.length == 0) {
            layer.msg('当前层级没有数据');
            me.all_obj.hong.data_c.clear();
          }
          // 有数据
          else {
            cb();
          }
        },
        // 渲染设备数据
        _hong_data_render: function() {
          // 清除数据
          me.all_obj.hong.data_c.clear();

          // 图标
          Hong_data.forEach(function(ele, index) {
            me._hong_marker(ele);
          });

          // 一次优化
          if (!me.all_obj.hong.fit_key) {
            me.all_obj.hong.fit_key = true;
            me._map_ps_fit(me.all_obj.hong.data_c);
          }
        },
        // 打点
        _hong_marker: function(ele) {
          var p_data = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point(ele.lnglat),
          });

          // 属性挂载
          p_data._id = ele.id;

          // 样式
          p_data.setStyle(me.conf.hong_style);

          // 注入地图
          me.all_obj.hong.data_c.addFeature(p_data);

          // 回收
          p_data = null;
        },
















        // 点击事件
        _hong_marker_ev: function(feature) {
          // 记录
          me.all_obj.hong.ac = feature;

          // dangq
          me.all_obj.hong.ac.setStyle(me.conf.style_ac);

          me._hong_one_inj();
        },





































































        // 聚合
        _juhe: function() {
          // 开启层
          // me._juhe_layer();

          //


          // 初始化数据
          me._juhe_init();
        },
        // 地图数据打点
        _juhe_init: function() {

          // FN.ajax(me.api.all_hong)
          //   .done(function(data) {


          //   });
          console.time('clusters_time');
          // Hong_data = data.data;
          // *****************************************模拟数据
          // var one_hong = Hong_data[0];
          var min = [61.974303, 13.103665];
          var max = [156.586507, 49.133313];
          Hong_data.length = 0;
          for (var i = 0; i < 200000; i++) {
            Hong_data.push({
              id: i,
              lnglat: [min[0] + (max[0] - min[0]) * Math.random(), min[1] + (max[1] - min[1]) * Math.random()],
              name: i,
            })
          }
          // *****************************************模拟数据


          var features = [];
          // 图标
          Hong_data.forEach(function(ele, index) {
            // me._juhe_marker(ele);
            features.push(new ol.Feature(new ol.geom.Point(ele.lnglat)))
          });


          //  数据层--可以注入多个Feature，每个feature有自己的数据和样式
          me.all_obj.juhe.data_c = new ol.source.Vector({
            features: features
          });


          // 矢量容器层
          me.all_obj.juhe.layer = new ol.source.Cluster({
            //标注元素之间的间距
            distance: 40,
            //注入数据层
            source: me.all_obj.juhe.data_c
          });



          //样式缓存
          var styleCache = {};
          //初始化矢量图层
          var clusters = new ol.layer.Vector({
            //数据源
            source: me.all_obj.juhe.layer,
            //样式
            style: function(feature, resolution) {
              //当前聚合标注数据源的要素大小
              var size = feature.get('features').length;
              //定义样式
              var style = styleCache[size];
              //如果当前样式不存在则创建
              if (!style) {
                style = [
                  //初始化样式
                  new ol.style.Style({
                    //点样式
                    image: new ol.style.Circle({
                      //点的半径
                      radius: 10,
                      //笔触
                      stroke: new ol.style.Stroke({
                        color: '#fff'
                      }),
                      //填充
                      fill: new ol.style.Fill({
                        color: '#3399cc'
                      })
                    }),
                    //文本样式
                    text: new ol.style.Text({
                      //文本内容
                      text: size.toString(),
                      //填充
                      fill: new ol.style.Fill({
                        color: '#fff'
                      })
                    })
                  })
                ];
                styleCache[size] = style;
              }
              return style;
            },
            zIndex: 90
          });
          //将聚合标注图层添加到map中
          me.map.addLayer(clusters);


          console.timeEnd('clusters_time');


          // 注入地图
          // me.map.addLayer(me.all_obj.juhe.layer);





          // 地图数据
          // me._juhe_data_init();
        },
        // 打点
        _juhe_marker: function(ele) {
          var p_data = new ol.Feature({
            // 就一个参数啊，定义坐标
            geometry: new ol.geom.Point(ele.lnglat),
          });

          // 属性挂载
          p_data._id = ele.id;


          // p_data.setStyle(me.conf['style_' + ele.status]);

          // 注入地图
          me.all_obj.juhe.data_c.addFeature(p_data);

          // 回收
          p_data = null;
        },

      };
      for (var k in fn) {
        me[k] = fn[k];
      };
    },
  };
  conf.module["Monitor"] = Monitor;
})(jQuery, window);
