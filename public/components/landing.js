'use strict';

let data
// const apiBaseUrl = window.location.hostname == 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'

function reactSentenceList(components) {
    const result = [];
  
    components.forEach((el, i) => {
      if (i > 0 && i === components.length - 1) {
        result.push(' & ')
      } else if (i > 0) {
        result.push(', ')
      }
      result.push(el)
    })
  
    return result
}

function landingPage() {
    return React.createElement('div', { className: 'text' },
        React.createElement('div', { className: 'title' }, 'MIUS-IC'),
        React.createElement('div', { className: 'subtitle' }, "A web application to track Mius Thomas' top albums and artists."),
        React.createElement('div', { className: 'subtitle landing-subtitle' },
            data && React.createElement('div', { className: 'subtitle album-subtitle' },
                `Mius is currently listening to `,
                React.createElement('a', { className: 'bold' }, data.track_name),
                `  by `,
                ...reactSentenceList(
                    data.artists.map((album, i) =>
                      React.createElement('a', { key: i, className: 'nav-button bold' }, album)
                    )
                  ),
                '.'
            ), 
            React.createElement('a', { className: 'spotify-link nav-button bold', href: data.profile }, "Mius' Spotify",
                React.createElement('div', { className: 'hyperlink-arrow' }, '↗')
            ),
            
        )
    );
}


async function apiCall() {
    try {
        console.log(`requesting ${apiBaseUrl}/spotify`)
        const res = await fetch(`${apiBaseUrl}/spotify`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
        })
        console.log(res)
        const data = await res.json();
        console.log(data)
        return data
    } catch (err) {
        console.error('There was a problem with the request:', err);
        return { err: "problem with API call: " + err }
    }
    
}

function resHandler(res) {
    if (Object.keys(res).includes("err")) {
        //err handling
        return false 
    }
    return true
}


// console.log(apiBaseUrl)
apiCall().then(spotifyData => {
    console.log(spotifyData)
    if (resHandler(spotifyData)) {
        data = spotifyData.currListeningData
        console.log(data)
    } else {
        //err handling
        //edit 'data' that will be rendered fields to reflect error
    }
    const landingNode = document.getElementById('landing-container')
    const landing = ReactDOM.createRoot(landingNode)
    landing.render(React.createElement(landingPage))
})

setInterval(() => {
    apiCall().then(spotifyData => {
        if (resHandler(spotifyData)) {
            data = spotifyData == {} ? null : spotifyData
        } 
        const landingNode = document.getElementById('landing-container')
        const landing = ReactDOM.createRoot(landingNode)
        landing.render(React.createElement(landingPage))
    })
    console.log("refreshed current listening data (2 minutes elapsed)")
  }, 120000)