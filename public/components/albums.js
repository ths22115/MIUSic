'use strict';

let data = {msg: ""}
// const apiBaseUrl = window.location.hostname == 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'
const albumsRoot = document.getElementById('albums-container');
const albums = ReactDOM.createRoot(albumsRoot);

function AlbumApp() {
    return React.createElement('div', { className: 'text album-text' },
        React.createElement('div', { className: 'title albums' }, 'Albums'),
        React.createElement('div', { className: 'subtitle album-list' }, 
            data.albums.map((album, index) =>
                React.createElement('div', { className: 'album-li', key: index, onClick: () => albumFocus(10*(data.currentPage - 1) + index + 1, album.album_name, album.artist) },
                    React.createElement('a', { className: 'nav-button'}, `#${10 * (data.currentPage - 1) + index + 1}`),
                    React.createElement('a', { className: 'nav-button albums-title'}, album.album_name),
                    React.createElement('a', { className: 'nav-button albums-artist'}, album.artist)
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
        React.createElement('div', { className: 'edit-div album-edit-div' },
            React.createElement('a', { className: 'form-submit nav-button', href: `${apiBaseUrl}/add.html` }, 'Add Album'),
            React.createElement('a', { className: 'form-submit nav-button', onClick: () => updateAllAlbums() }, 'Edit All Data'),
            React.createElement('a', { className: 'form-submit album-reset nav-button', onClick: () => resetAllAlbums() }, 'Reset All Data'),
            React.createElement('a', { className: 'form-submit nav-button recalc', onClick: () => recalcAllAlbums() }, 'Render Latest Stats')
        ),
        React.createElement('div', { className: 'subtitle page-num add-error' }, data.msg || "lol") 
    );
}

function albumFocus(id, name, artist) {
    localStorage.clear()
    localStorage.setItem('albumId', id)
    localStorage.setItem('albumName', name)
    localStorage.setItem('artist', artist)
    window.location.href = `${apiBaseUrl}/album.html`
}

function updateAllAlbums() {
    localStorage.clear()
    window.location.href = `${apiBaseUrl}/update.html`
}

async function resetAllAlbums() {
    try {
        const res = await fetch(`${apiBaseUrl}/albums/reset`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const newData = await res.json()
        if (!res.ok) { throw res }
        paginate(1)
        data.msg = newData.msg ? newData.msg : "Data Reset Successfully :D"
        albums.render(React.createElement(AlbumApp))
    } catch (err) {
        console.error('There was a problem with the request:', err);
        albums.render(React.createElement(AlbumApp))
    }
}

async function recalcAllAlbums() {
    try {
        const res = await fetch(`${apiBaseUrl}/recalc/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const newData = await res.json()
        console.log(newData) 
        paginate(1)
        data["msg"] = newData.msg
        if (!res.ok) { throw res }
        console.log(data.msg + '\n' + newData.msg)
        albums.render(React.createElement(AlbumApp))
    } catch (err) {
        console.error('There was a problem with the request:', err);
        albums.render(React.createElement(AlbumApp))
    }
}

async function apiCall(page) {
    try {
        const res = await fetch(`${apiBaseUrl}/albums${page ? '?page='+page : ''}`, {
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
        albums.render(React.createElement(AlbumApp))
    })
}


// console.log(apiBaseUrl)
apiCall().then(albumData => {
    console.log(albumData);
    if (resHandler(albumData)) {
        data = albumData
    } else {
        //err handling
        //edit 'data' that will be rendered fields to reflect error
    }
    albums.render(React.createElement(AlbumApp))
  });

