'use strict';

let data = {errorMsg : ""}
// const apiBaseUrl = window.location.hostname == 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'
const updateRoot = document.getElementById('update-container')
const update = ReactDOM.createRoot(updateRoot)

function UpdateAlbum() {
    const currentAlbumId = localStorage.getItem('albumId')
    const currentAlbumName = localStorage.getItem('albumName')
    const currentAlbumListens = localStorage.getItem('albumListens')
    const currentArtist = localStorage.getItem('artist')

    const [albumName, setAlbumName] = React.useState('');
    const [artist, setArtist] = React.useState('');
    const [listens, setListens] = React.useState('');

    async function handleSubmit(event) {
        try {
            event.preventDefault();
            const formData = {
                album_name: albumName,
                artist: artist,
                listens: listens
            }
            const res = await fetch(`${apiBaseUrl}/albums/${currentAlbumId || ''}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) { throw res }
            
            const resData = await res.json()
            // console.log(formData)
            if (currentAlbumId) {
                // console.log("RA")
                localStorage.removeItem("albumListens")
                localStorage.setItem("albumName", formData.album_name || currentAlbumName)
                localStorage.setItem("artist", formData.artist || currentArtist)
                window.location.href = `${apiBaseUrl}/album.html`
            } else {
                // console.log(":(")
                window.location.href = `${apiBaseUrl}/albums.html`
            }
        } catch (err) {
            console.error('There was a problem with the request:', err);
            // return { err: `problem with API call, ${err.status} status`}
            data.errorMsg = err.msg
            update.render(React.createElement(UpdateAlbum))
        }
        
    }

    return React.createElement('div', { className: 'text album-text add-text' },
        React.createElement('div', { className: 'title' }, 
            currentAlbumId ? `Update Album #${currentAlbumId}` : 'Update All Albums'
        ),
        React.createElement('form', { className: 'subtitle album-subtitle add-form', onSubmit: handleSubmit },
            React.createElement('input', {
                type: 'hidden',
                name: '_method',
                value: 'PUT'
            }),
            React.createElement('input', {
                className: 'add-form-input',
                type: 'text',
                name: 'album_name',
                placeholder: `Title ${currentAlbumName ? "( " + currentAlbumName + " )" : ""}`,
                value: albumName,
                onChange: (e) => setAlbumName(e.target.value)
            }),
            React.createElement('input', {
                className: 'add-form-input',
                type: 'text',
                name: 'artist',
                placeholder: `Artist ${currentArtist ? "( " + currentArtist + " )" : ""}`,
                value: artist,
                onChange: (e) => setArtist(e.target.value)
            }),
            React.createElement('input', {
                className: 'add-form-input',
                type: 'number',
                name: 'listens',
                placeholder: `Listens ${currentAlbumListens ? "( " + currentAlbumListens + " )" : ""}`,
                value: listens,
                onChange: (e) => setListens(e.target.value)
            }),
            React.createElement('button', { className: 'form-submit nav-button', type: 'submit' }, 'Submit')
        ),
        data.msg && React.createElement('div', { className: 'subtitle page-num add-error' }, data.msg)
    );
}

update.render(React.createElement(UpdateAlbum));