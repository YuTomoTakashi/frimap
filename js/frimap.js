var Map = React.createClass({displayName: "Map",
  componentDidMount: function () {
    var map = new BMap.Map("map");

    map.centerAndZoom(new BMap.Point(104.737059, 36.394564), 5);
    map.enableScrollWheelZoom();
    map.addControl(new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT}));
    map.addControl(new BMap.NavigationControl({
      enableGeolocation: true
    }));
    map.addControl(new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP]}));

    // 利用浏览器定位
    var geolocation = new BMap.Geolocation();
    var _this = this;
    geolocation.getCurrentPosition(function (r) {
      if (this.getStatus() == BMAP_STATUS_SUCCESS) {
        var pt = r.point;
        var mk = new BMap.Marker(pt);
        map.addOverlay(mk);
        map.panTo(pt);

        var geoc = new BMap.Geocoder();
        geoc.getLocation(r.point, function (rs) {
          var addComp = rs.addressComponents;
          document.getElementById("finder").value =
            addComp.province + ", " + addComp.city
            + ", " + addComp.district + ", " + addComp.street
            + ", " + addComp.streetNumber;
        });
        _this.setLngLat(pt.lng, pt.lat);
      } else {
        alert('自动定位失败：' + this.getStatus());
      }
    }, {enableHighAccuracy: true});
    // 智能搜索
    var ac = new BMap.Autocomplete({
      "input": "finder",
      "location": map
    });

    ac.addEventListener("onhighlight", function (e) {  //鼠标放在下拉列表上的事件
      var str;
      var _value = e.fromitem.value;
      var value = "";
      if (e.fromitem.index > -1) {
        value = _value.province + _value.city + _value.district + _value.street + _value.business;
      }
      str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

      value = "";
      if (e.toitem.index > -1) {
        _value = e.toitem.value;
        value = _value.province + _value.city + _value.district + _value.street + _value.business;
      }
      str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
      document.getElementById("searchResultPanel").innerHTML = str;
    });
    ac.addEventListener("onconfirm", function (e) {    //鼠标点击下拉列表后的事件
      var _value = e.item.value;
      var myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
      document.getElementById("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
      //map.clearOverlays();    //清除地图上所有覆盖物
      var local = new BMap.LocalSearch(map, { //智能搜索
        onSearchComplete: function () {
          var pp = local.getResults().getPoi(0).point;
          map.centerAndZoom(pp, 15);
          map.addOverlay(new BMap.Marker(pp));

          _this.setLngLat(pp.lng, pp.lat);
        }
      });
      local.search(myValue);
    });
    // 右键菜单
    var menu = new BMap.ContextMenu();
    var txtMenuItem = [{
      text: "我在这里",
      callback: function (e) {
        var pt = new BMap.Point(e.lng, e.lat);
        var geoc = new BMap.Geocoder();
        geoc.getLocation(pt, function (rs) {
          var addComp = rs.addressComponents;
          document.getElementById("finder").value =
            addComp.province + ", " + addComp.city
            + ", " + addComp.district + ", " + addComp.street
            + ", " + addComp.streetNumber;
          var marker = new BMap.Marker(pt);
          map.addOverlay(marker);
        });
        this.setLngLat(e.lng, e.lat);
      }.bind(this)
    }];

    for (var i = 0; i < txtMenuItem.length; i++) {
      menu.addItem(new BMap.MenuItem(txtMenuItem[i].text, txtMenuItem[i].callback, 100));
    }
    map.addContextMenu(menu);

    $.ajax({
      url: "/friends",
      method: "GET",
      dataType: "json",
      success: function (json) {
        if (typeof(json) != "undefined") {
          json.map(function (friend) {
            var point = new BMap.Point(friend.lng, friend.lat);
            var marker = new BMap.Marker(point);
            map.addOverlay(marker);
            var label = new BMap.Label(friend.username, {
              position: point,
              offset: new BMap.Size(10, -30)
            });
            label.setStyle({
              color: "red",
              fontSize: "12px",
              height: "20px",
              lineHeight: "18px",
              fontFamily: "微软雅黑"
            });
            map.addOverlay(label);
          });
        }
      }.bind(this)
    });
  },
  setLngLat: function (lng, lat) {
    React.findDOMNode(this.refs.lng).value = lng;
    React.findDOMNode(this.refs.lat).value = lat;
  },
  render: function () {
    return (
      React.createElement("div", null, 
        React.createElement("input", {type: "hidden", ref: "lng", name: "lng"}), 
        React.createElement("input", {type: "hidden", ref: "lat", name: "lat"}), 

        React.createElement("div", {id: "map", style: {width:"100%", height:"700px", border:"1px solid #DCDCDC"}})
      )
    );
  }
});

var Notes = React.createClass({displayName: "Notes",
  render: function () {
    return (
      React.createElement("ul", {className: "am-list am-list-static am-list-border am-list-striped"}, 
        React.createElement("li", null, "1. 请先输入自己的ID"), 
        React.createElement("li", null, "2. 请允许浏览器获取你的位置"), 
        React.createElement("li", null, "3. 如果自动定位有错误，请手动键入自己的位置，或者在地图上使用右键标示自己的位置"), 
        React.createElement("li", null, "4. 请勿冒用他人ID")
      )
    );
  }
});

var Register = React.createClass({displayName: "Register",
  componentDidMount: function () {
    React.findDOMNode(this.refs.id).focus();
    React.findDOMNode(this.refs.submit).setAttribute("disabled", "disabled");
  },
  getInitialState: function () {
    return {
      level_pending: false
    };
  },
  handleGetLevel: function () {
    if (!this.state.level_pending) {
      var text_level = React.findDOMNode(this.refs.level);
      var text_id = React.findDOMNode(this.refs.id);
      var btn_submit = React.findDOMNode(this.refs.submit);

      btn_submit.setAttribute("disabled", "disabled");

      if (text_id.value.trim() == "") {
        text_id.focus();
        text_id.setAttribute("placeholder", "ID不能为空");
        return;
      } else {
        text_id.setAttribute("placeholder", "ID");
      }

      text_level.setAttribute("disabled", "disabled");
      text_level.value = "等级获取中...";
      this.setState({level_pending: true});
      $.ajax({
        url: "/level?id=" + text_id.value.trim(),
        method: "GET",
        dataType: "json",
        success: function (json) {
          if (parseInt(json.level) == -1) {
            text_level.value = "获取失败";
          } else {
            var level = parseInt(json.level);
            text_level.value = level;
            if (level < config.level) {
              text_level.setAttribute("placeholder", "等级[" + level + "]未达到要求");
              text_level.value = "";
            } else {
              var btn_submit = React.findDOMNode(this.refs.submit);
              btn_submit.removeAttribute("disabled");
            }
          }
        }.bind(this),
        complete: function () {
          this.setState({level_pending: false});
        }.bind(this)
      });
    }
  },
  handleSubmit: function () {
    if (!this.state.level_pending) {
      var btn_submit = React.findDOMNode(this.refs.submit);
      var text_id = React.findDOMNode(this.refs.id);
      var tip = React.findDOMNode(this.refs.tip);

      var pos_lng = $("input[name=lng]").val();
      var pos_lat = $("input[name=lat]").val();

      btn_submit.innerText = "请稍后...";
      btn_submit.setAttribute("disabled", "disabled");

      $.ajax({
        url: "/",
        method: "POST",
        dataType: "json",
        data: {id: text_id.value.trim(), lng: pos_lng, lat: pos_lat},
        success: function (json) {
          //console.log(json);
          if (typeof(json) != "undefined") {
            if (json.no == 0) {
              location.href = location.href;
            } else {
              if (json.msg[1] == 19) {
                tip.innerText = "已经登记过了";
              } else {
                tip.innerText = json.msg[2];
              }
            }
          }
        }.bind(this),
        complete: function () {
          btn_submit.innerText = "填好了";
          btn_submit.removeAttribute("disabled");
        }.bind(this)
      });
      return false;
    }
  },
  render: function () {
    var styleSearchResultPanel = {
      border: "1px solid #C0C0C0",
      backgroundColor: "#fff",
      width: "150px",
      height: "auto",
      display: "none"
    };
    return (
      React.createElement("section", {className: "am-panel am-panel-default"}, 
        React.createElement("header", {className: "am-panel-hd"}, 
          React.createElement("h3", {className: "am-panel-title am-text-center"}, "位置登记")
        ), 
        React.createElement("div", {className: "am-panel-bd"}, 
          React.createElement(Notes, null), 
          React.createElement("label", null, "等级验证"), 

          React.createElement("form", {className: "am-form am-form-inline"}, 
            React.createElement("div", {className: "am-form-group am-form-icon"}, 
              React.createElement("i", {className: "am-icon-list"}), 
              React.createElement("input", {type: "text", className: "am-form-field", disabled: true, placeholder: "贴吧", value: config.forum})
            ), 
            " ", 
            React.createElement("div", {className: "am-form-group am-form-icon"}, 
              React.createElement("i", {className: "am-icon-user"}), 
              React.createElement("input", {type: "text", className: "am-form-field", placeholder: "ID", maxLength: "20", 
                     onBlur: this.handleGetLevel, 
                     ref: "id"})
            ), 
            " ", 
            React.createElement("div", {className: "am-form-group am-form-icon"}, 
              React.createElement("i", {className: "am-icon-bar-chart"}), 
              React.createElement("input", {type: "text", className: "am-form-field", placeholder: "等级 > " + (config.level - 1).toString(), disabled: true, 
                     ref: "level"})
            )
          ), 

          React.createElement("label", null, "坐标定位"), 
          React.createElement("input", {type: "text", className: "am-form-field", placeholder: "自动定位中...", id: "finder"}), 

          React.createElement("div", {id: "searchResultPanel", style: styleSearchResultPanel}), 
          React.createElement("button", {type: "button", className: "am-btn am-btn-primary", style: {zIndex:"999"}, 
                  ref: "submit", 
                  onClick: this.handleSubmit}, "填好了"
          ), 
          " ", React.createElement("span", {className: "am-text-warning", ref: "tip"})
        )
      )
    );
  }
});

var Container = React.createClass({displayName: "Container",
  render: function () {
    return (
      React.createElement("div", null, 
        React.createElement(Header, null), 
        React.createElement(Map, null), 
        React.createElement("br", null), 
        React.createElement(Register, null), 
        React.createElement(Footer, null)
      )
    );
  }
});

React.render(React.createElement(Container, null), document.getElementById("container"));