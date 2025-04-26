'use strict';

let data
// const apiBaseUrl = window.location.hostname == 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'

function ArtistDetails() {
    return React.createElement('div', { className: 'text album-text' },
        React.createElement('div', { className: 'album-title' }, data.artist || "Error :("),
        React.createElement('div', { className: 'subtitle album-list artist-albums' },
            React.createElement('a', { className: 'albums-artist' }, data.err ? "Couldn't find requested artist." : 'Mius has listened to...'),
            data.err ? "" : data.albums.map((album, index) =>
                React.createElement('div', { className: 'album-li nav-button', key: index },
                    React.createElement('a', { className: 'nav-button albums-title artist-album', onClick: () => albumFocus(null, album) }, album)
                )
            )
        ),
        data.err ? "" : (
        React.createElement('div', { className: 'edit-div artist-edit-div' },
            React.createElement('a', { className: 'form-submit nav-button', href: `${apiBaseUrl}/add.html` }, 'Add Artist Album')
        )),
        data.msg && React.createElement('div', { className: 'subtitle page-num add-error' }, data.msg)
    );
}

function albumFocus(id, name) {
    if (!(id || name)) {
        data.msg = "Can't focus the selected album, please try again later."
    } else {
        // localStorage.removeItem('artist')
        id ? localStorage.setItem('albumId', id) : localStorage.removeItem('albumId')
        name ? localStorage.setItem('albumName', name) : localStorage.removeItem('albumName')
        window.location.href = `${apiBaseUrl}/album.html`
    }
}

async function apiCall() {
    try {
        const artistName = localStorage.getItem('artist')
        console.log(`requesting ${apiBaseUrl}/artist/${artistName}`)
        if (!artistName) { return { err: "problem with API call: no name query" } }

        const res = await fetch(`${apiBaseUrl}/artists/${artistName}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })

        if (!res.ok) { throw res }
        const data = await res.json();
        return data
    } catch (err) {
        console.error('There was a problem with the request:', err);
        return { err: `problem with API call, ${err.status} status`}
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
apiCall().then(artistDetailsData => {
    console.log(artistDetailsData)
    if (resHandler(artistDetailsData)) {
        data = artistDetailsData
    } else {
        //err handling
        //edit 'data' that will be rendered fields to reflect error
        data = { err: "Couldn't find requested artist."}
    }
    const artistDetailsNode = document.getElementById('artist-details-container');
    const artistDetails = ReactDOM.createRoot(artistDetailsNode);
    artistDetails.render(React.createElement(ArtistDetails));
});






