const apiBaseUrl = window.location.hostname == 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'

function Header() {
    // const apiBaseUrl = window.location.hostname == 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'
    return React.createElement(
      "header",
      null,
      React.createElement(
        "div",
        { className: "nav-button" },
        React.createElement("a", { className: "nav-button", href: `${apiBaseUrl}/` }, "HOME")
      ),
      React.createElement(
        "div",
        { className: "nav-button" },
        React.createElement("a", { className: "nav-button", href: `${apiBaseUrl}/albums.html` }, "ALBUMS")
      ),
      React.createElement(
        "div",
        { className: "nav-button" },
        React.createElement("a", { className: "nav-button", href: `${apiBaseUrl}/artists.html` }, "ARTISTS")
      ),
      React.createElement(
        "div",
        { className: "nav-button" },
        React.createElement("a", { className: "nav-button", href: `${apiBaseUrl}/visuals.html` }, "VISUALS")
      ),
      React.createElement(
        "div",
        { className: "nav-button" },
        React.createElement("a", { className: "nav-button", href: `${apiBaseUrl}/db.html` }, "DB")
      ),
    )
  }
  
const headerNode = document.getElementById("header-container");
const header = ReactDOM.createRoot(headerNode);
header.render(React.createElement(Header));
