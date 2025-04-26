'use strict'

let data = { msg: '' }
// const apiBaseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'
const dbRoot = document.getElementById('db-container')
const db = ReactDOM.createRoot(dbRoot)

function DBInterface() {
    const [numberInput, setNumberInput] = React.useState('')
    const [bodyInput, setBodyInput] = React.useState('')

    async function makeRequest(method) {
        const id = numberInput.trim()
        const isDocRoute = id === '' || id === '0'
        const endpoint = `${apiBaseUrl}/db${isDocRoute ? '' : `/${id}`}`

        let options = {
            method,
            headers: {}
        }

        if (['POST', 'PUT'].includes(method)) {
            try {
                options.headers['Content-Type'] = 'application/json'
                options.body = JSON.stringify(JSON.parse(bodyInput))
            } catch (err) {
                data.msg = 'Invalid JSON in provided body.'
                return db.render(React.createElement(DBInterface))
            }
        }

        if (method === 'POST' && !isDocRoute) {
            data.msg = 'POST not allowed with specified album'
            return db.render(React.createElement(DBInterface))
        }

        try {
            const res = await fetch(endpoint, options)
            console.log(res)
            const resJSON = await res.json()
            console.log(resJSON)
            const content = resJSON.msg ? resJSON.msg : `${method} completed.`
            console.log(resJSON.msg)
            data.msg = content
            if (!res.ok) throw resJSON
            
        } catch (err) {
            err.msg ? data.msg = err.msg : ''
        }
        db.render(React.createElement(DBInterface))
    }

    return React.createElement('div', { className: 'text album-text add-text' },
        React.createElement('div', { className: 'title' }, 'MongoDB UI'),
        React.createElement('div', { className: 'subtitle db-subtitle add-form' },
            React.createElement('input', {
                className: 'add-form-input',
                type: 'number',
                placeholder: 'Album ID (or empty)',
                value: numberInput,
                onChange: (e) => setNumberInput(e.target.value)
            }),
            React.createElement('textarea', {
                className: 'add-form-input',
                rows: 10,
                placeholder: 'JSON body (POST & PUT)',
                value: bodyInput,
                onChange: (e) => setBodyInput(e.target.value)
            }),
            React.createElement('div', { className: 'edit-div album-edit-div' },
                React.createElement('button', {
                    className: 'form-submit nav-button', onClick: () => makeRequest('GET')
                }, 'GET'),
                React.createElement('button', {
                    className: 'form-submit nav-button', onClick: () => makeRequest('POST')
                }, 'POST'),
                React.createElement('button', {
                    className: 'form-submit nav-button', onClick: () => makeRequest('PUT')
                }, 'PUT'),
                React.createElement('button', {
                    className: 'form-submit nav-button', onClick: () => makeRequest('DELETE')
                }, 'DELETE')
            )
        ),
        data.msg && React.createElement('div', { className: 'subtitle page-num add-error' }, `${data.msg}`)
    )
}

db.render(React.createElement(DBInterface))
