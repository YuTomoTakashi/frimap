var Form = React.createClass({displayName: "Form",
  render: function () {
    return (
      React.createElement("form", {className: "am-form-inline", role: "form", action: "/passport", method: "POST"}, 
        React.createElement("div", {className: "am-form-group am-form-icon"}, 
          React.createElement("i", {className: "am-icon-lock"}), 
          React.createElement("input", {type: "password", name: "password", className: "am-form-field", placeholder: "输入管理密码", maxLength: "20"})
        ), 
        " ", 
        React.createElement("button", {type: "submit", className: "am-btn am-btn-primary"}, "登录")
      )
    );
  }
});

var Container = React.createClass({displayName: "Container",
  render: function () {
    return (
      React.createElement("div", null, 
        React.createElement(Header, null), 
        React.createElement(Form, null), 
        React.createElement(Footer, null)
      )
    );
  }
});

React.render(React.createElement(Container, null), document.getElementById("container"));