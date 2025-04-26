'use strict';

let data = {errorMsg : ""}
// const apiBaseUrl = window.location.hostname == 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'
const addNode = document.getElementById('add-container')
const add = ReactDOM.createRoot(addNode)

function AddAlbum() {
    const targetArtist = localStorage.getItem('artist');

    const [albumName, setAlbumName] = React.useState('');
    const [artist, setArtist] = React.useState(targetArtist);
    const [listens, setListens] = React.useState('');

    async function handleSubmit(event) {
        try {
            event.preventDefault();
            const formData = {
                album_name: albumName,
                artist: artist,
                listens: listens
            }
            const res = await fetch(`${apiBaseUrl}/albums/${targetArtist || ''}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) { throw res }
            
            const resData = await res.json()
            localStorage.removeItem("albumId")
            localStorage.setItem("albumName", albumName)
            if (!targetArtist) localStorage.setItem("artist", artist)
            window.location.href = `${apiBaseUrl}/album.html`
        } catch (err) {
            console.error('There was a problem with the request:', err);
            // return { err: `problem with API call, ${err.status} status`}
            data.errorMsg = err.json().msg
            add.render(React.createElement(AddAlbum))
        }
    }

    return React.createElement('div', { className: 'text album-text add-text' },
        React.createElement('div', { className: 'title' }, 'New Album'),
        React.createElement('form', { className: 'subtitle album-subtitle add-form', onSubmit: handleSubmit },
            React.createElement('input', {
                className: 'add-form-input',
                type: 'text',
                name: 'album_name',
                placeholder: 'Title',
                value: albumName,
                onChange: (e) => setAlbumName(e.target.value)
            }),
            targetArtist 
                ? React.createElement('input', {
                    className: 'add-form-input',
                    type: 'text',
                    name: 'artist',
                    value: artist,
                    readOnly: true
                })
                : React.createElement('input', {
                    className: 'add-form-input',
                    type: 'text',
                    name: 'artist',
                    placeholder: 'Artist',
                    value: artist,
                    onChange: (e) => setArtist(e.target.value)
                }),
            React.createElement('input', {
                className: 'add-form-input',
                type: 'number',
                name: 'listens',
                placeholder: 'Listens',
                value: listens,
                onChange: (e) => setListens(e.target.value)
            }),
            React.createElement('button', { className: 'form-submit', type: 'submit' }, 'Submit')
        ),
        (data.errorMsg || data.successMsg) && React.createElement('div', { className: 'subtitle page-num add-error' }, data.errorMsg || data.successMsg)
    );
}

add.render(React.createElement(AddAlbum));

// async function apiCall() {
//     try {
//         const urlParams = new URLSearchParams(window.location.search);
//         const artistName = urlParams.get('artist');
//         if (!artistName) { return null }

//         console.log(`requesting ${apiBaseUrl}/artist/${artistName}`)

//         const res = await fetch(`${apiBaseUrl}/artists/${artistName}`, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json'
//             }
//           })

//         if (!res.ok) { throw res }
//         const data = await res.json();
//         return data
//     } catch (err) {
//         console.error('There was a problem with the request:', err);
//         return { err: `problem with API call, ${err.status} status`}
//     }
    
// }

// function resHandler(res) {
//     if (Object.keys(res).includes("err")) {
//         //err handling
//         return false 
//     }
//     return true
// }

// // console.log(apiBaseUrl)
// apiCall().then(artistDetailsData => {
//     console.log(artistDetailsData)
//     if (resHandler(artistDetailsData)) {
//         data = artistDetailsData
//     } else {
//         //err handling
//         //edit 'data' that will be rendered fields to reflect error
//         data = { err: "Couldn't find requested artist."}
//     }
//     const artistDetailsNode = document.getElementById('artist-details-container');
//     const artistDetails = ReactDOM.createRoot(artistDetailsNode);
//     artistDetails.render(React.createElement(ArtistDetails));
// });
