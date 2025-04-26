'use strict';

let data
// const apiBaseUrl = window.location.hostname == 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'
const albumDetailsNode = document.getElementById('album-details-container');
const albumDetails = ReactDOM.createRoot(albumDetailsNode);

function AlbumDetails() {
    return React.createElement('div', { className: 'text album-text' },
        React.createElement('div', { className: 'album-num' }, `#${data.album_num || "?"}:`),
        React.createElement('div', { className: 'album-title' }, data.album_title || "Error!"),
        React.createElement('div', { className: 'artist nav-button' },
            React.createElement('a', { className: 'artist nav-button', onClick: () => artistFocus() }, data.artist || data.err)
        ),
        data.err ? "" : React.createElement('div', { className: 'subtitle album-subtitle' },
            `Mius has listened to tracks from this album `,
            React.createElement('a', { className: 'album-listens' }, data.listen_count),
            ` times.`
        ),
        data.err ? "" : React.createElement('div', { className: 'edit-div album-edit-div' },
            React.createElement('a', { className: 'form-submit nav-button', onClick: () => updateAlbumDetails()}, 'Update Data'),
            React.createElement('a', { className: 'form-submit nav-button', onClick: () => resetAlbumDetails() }, 'Reset Data'),
            React.createElement('a', { className: 'form-submit nav-button delete', onClick: () => deleteAlbum() }, 'Delete Data'),
        ),
        data.msg && React.createElement('div', { className: 'subtitle page-num add-error' }, data.msg)
    );
}

function artistFocus() {
    console.log(data)
    if (data.artist && localStorage.getItem("artist") && data.artist == localStorage.getItem("artist")) {
        // localStorage.removeItem('albumId')
        // localStorage.removeItem('albumName')
        window.location.href = `${apiBaseUrl}/artist.html`
    }
}

function updateAlbumDetails() {
    localStorage.setItem("albumId", data.album_num)
    localStorage.setItem("albumName", data.album_title)
    localStorage.setItem("albumListens", data.listen_count)
    localStorage.setItem("artist", data.artist)

    window.location.href = `${apiBaseUrl}/update.html`
}   

async function resetAlbumDetails() {
    try {
        const res = await fetch(`${apiBaseUrl}/albums/${data.album_num}/reset`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            }
        })
        if (!res.ok) { throw res }
        const newData = await res.json();
        data.album_num = newData.rank
        data.album_title = newData.album_title
        data.listen_count = newData.listens
        data.msg = "Data Reset Successfully :D"
        albumDetails.render(React.createElement(AlbumDetails));
    } catch (err) {
        console.error('There was a problem with the request:', err);
        // return { err: `problem with API call, ${err.status} status`}
        data.msg = err.json().msg
        albumDetails.render(React.createElement(albumDetails))
    }
}

async function deleteAlbum() {
    if(!confirm('Are you sure you want to delete this album?')) {
        return;
    }
    try {
        const res = await fetch(`${apiBaseUrl}/albums/${data.albumNum}/`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
        })
        const newData = await res.json();
        if (!res.ok) {
            data.msg = newData.msg
            throw res
        }
        window.location.href = `${apiBaseUrl}/albums.html`
    } catch (err) {
        console.error('There was a problem with the request:', err);
        albumDetails.render(React.createElement(albumDetails))
    }

}

async function apiCall() {
    try {
        const albumId = localStorage.getItem('albumId')
        const albumName = localStorage.getItem('albumName')
        if (!albumId && !albumName) { return { err: "problem with API call: no ID/name query" } }
        // console.log(`id: ${albumId}, name:${albumName}`)
        const identifier = albumId ? albumId : albumName
        // console.log(`identifier: ${identifier}`)
        console.log(`requesting ${apiBaseUrl}/albums/${identifier}${identifier == albumName ? "?name=true" : ""}`)
        const res = await fetch(`${apiBaseUrl}/albums/${identifier}${identifier == albumName ? "?name=true" : ""}`, {
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
apiCall().then(albumDetailsData => {
    console.log(albumDetailsData)
    if (resHandler(albumDetailsData)) {
        data = albumDetailsData
        data.msg = localStorage.getItem('msg')
    } else {
        //err handling
        //edit 'data' that will be rendered fields to reflect error
        data = { err: "Couldn't find requested album."}
    }
    albumDetails.render(React.createElement(AlbumDetails));
});
