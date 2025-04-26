

let coverArt
let radial
// const apiBaseUrl = window.location.hostname == 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'
const vinylNode = document.getElementById("vinyl-container")
const vinyl = ReactDOM.createRoot(vinylNode)

function Vinyl() { 
    return (
        React.createElement("div", {className: "vinyl-component vinyl-active vinyl-perm"}, 
            React.createElement("img", {className: "vinyl", src: "blackVinyl4.png"}),
            coverArt && React.createElement("img", {className: "vinyl-art", src: coverArt}),
        )
    )
}

async function getCoverArt(id, name) {
    try {
        const identifier = id ? id : name
        console.log(`requesting ${apiBaseUrl}/art/${identifier}${identifier == name ? "?name=true" : ""}`)
        const res = await fetch(`${apiBaseUrl}/art/${identifier}${identifier == name ? "?name=true" : ""}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
        const artData = await res.json();
        console.log(artData)
        if (!res.ok) { 
            console.log(artData.msg)
            throw res 
        }
        return artData.art
    } catch (err) {
        console.error('There was a problem with the request:', err)
        return null
    }
}

async function getCurrListeningCoverArt() {
    try {
        console.log(`requesting ${apiBaseUrl}/currListening`)
        const res = await fetch(`${apiBaseUrl}/currListening`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
            })
        const currListeningData = await res.json();
        console.log(currListeningData)
        if (!res.ok) { 
            console.log(currListeningData.msg)
            throw res 
        }
        if (res.status == 204) {
            return null
        }
        return currListeningData.currListeningData.art
    } catch (err) {
        console.error('There was a problem with the request:', err)
        return null
    }
}

let albumId = localStorage.getItem('albumId')
let albumName = localStorage.getItem('albumName')
let path = window.location.pathname
console.log(path)
vinyl.render(React.createElement(Vinyl))
if ((albumId || albumName) && (path == `${window.location.hostname == 'localhost' ? "" : "/node"}/album.html`)) {
    getCoverArt(albumId, albumName).then(art => {
        console.log(art)
        coverArt = art
        vinyl.render(React.createElement(Vinyl))
    })
} else if (path == `${window.location.hostname == 'localhost' ? "/" : "/node/"}`) {
    setTimeout(() => {
        getCurrListeningCoverArt().then(art => {
            console.log(art)
            if (art != null) {
                coverArt = art
            }
            vinyl.render(React.createElement(Vinyl))
        })
      }, 250)
    
    setInterval(() => {
        getCurrListeningCoverArt().then(art => {
            console.log(art)
            if (art != null) {
                coverArt = art
            }
            vinyl.render(React.createElement(Vinyl))
        });
        console.log("refreshed vinyl (2 minutes elapsed)")
      }, 120100)
}
