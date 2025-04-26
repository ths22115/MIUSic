'use strict';

let data
// const apiBaseUrl = window.location.hostname == 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'
const artistsRoot = document.getElementById('artists-container');
const artists = ReactDOM.createRoot(artistsRoot);

function ArtistsList() {
    return React.createElement('div', { className: 'text album-text' },
        React.createElement('div', { className: 'title albums' }, 'Artists'),
        React.createElement('div', { className: 'subtitle album-list' },
            data.artists.map((artist, index) =>
                React.createElement('div', { className: 'album-li', key: index },
                    React.createElement('a', { className: 'nav-button albums-title', onClick: () => artistFocus(artist) }, artist)
                )
            )
        ),
        React.createElement('div', { className: 'pagination-buttons' },
            !data.firstPage && React.createElement('div', { className: 'pag-button' },
                React.createElement('a', { className: 'pag-button', onClick: () => paginate(data.currentPage - 1) }, '<')
            ),
            React.createElement('div', { className: 'subtitle page-num' }, data.currentPage),
            !data.lastPage && React.createElement('div', { className: 'pag-button' },
                React.createElement('a', { className: 'pag-button', onClick: () => paginate(data.currentPage + 1) }, '>')
            )
        ),
        (data.errorMsg || data.successMsg) && React.createElement('div', { className: 'subtitle page-num add-error' }, data.errorMsg || data.successMsg)
    );
}

function artistFocus(artist) {
    localStorage.clear()
    localStorage.setItem('artist', artist)
    window.location.href = `${apiBaseUrl}/artist.html`
}

async function apiCall(page) {
    try {
        const res = await fetch(`${apiBaseUrl}/artists${page ? '?page='+page : ''}`, {
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


function paginate(page) {
    apiCall(page).then(newAlbumData => {
        if (resHandler(newAlbumData)) {
            data = newAlbumData
        }
        artists.render(React.createElement(ArtistsList))
    })
}


// console.log(apiBaseUrl)
apiCall().then(artistData => {
    console.log(artistData);
    if (resHandler(artistData)) {
        data = artistData
    } else {
        //err handling
        //edit 'data' that will be rendered fields to reflect error
    }
    artists.render(React.createElement(ArtistsList))
  });

