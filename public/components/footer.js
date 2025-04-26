function Footer() {
    return React.createElement(
      "footer",
      null,
      "BUILT BY ",
      React.createElement(
        "a",
        { className: "nav-button footer-link", target: "_blank", href: "https://miles-thomas.com" },
        "MIUS THOMAS"
      ),
      React.createElement("div", { className: "hyperlink-arrow" }, "↗")
    )
  }

const footerNode = document.getElementById("footer-container")
const footer = ReactDOM.createRoot(footerNode)
footer.render(React.createElement(Footer))