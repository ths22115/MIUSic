import express from 'express'
import path from 'path'
import axios from 'axios'
import os from 'os'
import fs from 'fs'
import methodOverride from 'method-override'
import { MongoClient, ServerApiVersion } from 'mongodb'
import "dotenv/config";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
const port = 3000

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// app.use(methodOverride('_method'))

let apiBaseUrl = process.env.API_BASE_URL
let env = process.env.NODE_ENV
const lastFMKey = process.env.LAST_FM_KEY
const lastFMUser = process.env.LAST_FM_USER
const spotifyID = process.env.SPOTIFY_ID
const spotifySecret = process.env.SPOTIFY_SECRET
const spotifyRefresh = process.env.SPOTIFY_REFRESH
const spotifyUser = process.env.SPOTIFY_USER_ID

if (!apiBaseUrl || !env) {
  const hostname = os.hostname()
  const isLocal = hostname === 'localhost' || hostname.includes('your-local-identifier')

  apiBaseUrl = isLocal ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'
  env = isLocal ? 'DEV' : 'PROD'
}
app.locals.basePath = env === 'PROD' ? '/node' : ''

const uri = process.env.MONGO_URI
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

let db, miusicCol
async function mongoConnect() {
  try {
    await client.connect()
    // console.log("Established Connection To Mongo Database")
    db = client.db("miusDB")
    miusicCol = db.collection("MIUSic-collection")
    return true
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    return false
  }
}
const isDBConnected = mongoConnect()
if (isDBConnected) {
  console.log("Established Connection To Mongo Database")
}

const dataBackup = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/dataBackup.json')))
const artistsBackup = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/artistsBackup.json')))
let data = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data.json')))
let artistData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/artists.json')))
let currListeningData = {}

app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, '/')
  console.log(`Incoming request: ${req.method} ${req.url}`)
  if (!Object.keys(req.body).length === 0) {
    console.log(`Body: `, req.body)
  }
  if (!Object.keys(req.body).length === 0 && req.body._method) {
    console.log(`Overriding method: ${req.body._method}`)
  }
  next()
})

app.use((req, res, next) => {
  if (req.body._method && req.method != req.body._method) {
      req.method = req.body._method.toUpperCase()
      console.log(`Forced method override: ${req.method} ${req.url}`)
  }
  next()
})

app.use(env == 'DEV' ? 
  (express.static('public'))
  : ('/node', express.static(path.join(__dirname, 'public'))))


app.get('/spotify', (req, res) => {
  // console.log("hi")
  let profileURL

  axios({
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Buffer.from(spotifyID + ":" + spotifySecret).toString("base64"),
    },
    data: new URLSearchParams({ grant_type:"refresh_token", refresh_token: spotifyRefresh }).toString()
  })
  .then(response => { 
      console.log(response.data); // Should log the access token
      const spotifyToken = response.data.access_token
      // get current listening details
      axios({
        method: "GET",
        url: `https://api.spotify.com/v1/me/player/currently-playing`,
        headers: {
          "Authorization": `Bearer ${spotifyToken}`, // Set the Bearer token here
          "Content-Type": "application/json",
        }
      })
        .then(response => { 
          console.log("current listening call status: " + response.status)
          // console.log("current listening call status: " + response.status)
          if (response.status == 204) { // not playing anything right now 
            currListeningData = {}
            return res.status(204).send({msg: "No data to provide."})  
          } else if (response.status != 200 || response.status != 204) {
            currListeningData = {}
            throw err
          } else {
            currListeningData.track_name = response.data.item.name
            currListeningData.album_name = response.data.item.album.name
            currListeningData.album_type = response.data.item.album.album_type
            currListeningData.artists = response.data.item.artists.map(artist => artist.name);
            currListeningData.art = response.data.item.album.images[0].url
            currListeningData.profile = "https://open.spotify.com/user/s861qg91pi85xquepp1gn15w6"
            console.log(currListeningData)
            return res.status(200).send({ currListeningData })  
          }
        })
        .catch(err => { 
          console.error("Error fetching JSON:", err.response ? err.response.data : err) 
          return res.status(500).send({msg: err.response ? err.response.data : err})
        })
  })
})
app.get('/currListening', (req, res) => {
  console.log("data:")
  console.log(currListeningData)
  if (!Object.keys(currListeningData).length || currListeningData.msg) {
    return res.status(204).send({msg: "No data to provide."})
  } else {
    return res.status(200).send({ currListeningData })
  }
})
app.get('/albums', (req, res) => {
  let page = parseInt(req.query.page);
  if (!page) {
      page = 1
  } else if (page > Math.ceil(data.length/10)) {
    res.status(400).send({msg: "Requested page out of range."})
  } else if (page == -1 ) {
    return res.status(200).send({albums: data})
  }
  
  let albums
  if (data.length % 10 != 0 && page == Math.ceil(data.length/10)) {
    albums = data.slice((10*(page-1)), data.length)
  }
  else {
    albums = data.slice((10*(page-1)), (10*(page)))
  }
  return res.status(200).send({ albums:albums, currentPage:page, firstPage: page && page == 1, lastPage: page && page == Math.ceil(data.length/10) })
})
app.get('/albums/:id', (req, res) => {
  console.log("singular album endpoint")
  // console.log(req.query.name)
  if (isNaN(req.params.id) || req.query.name == 'true') { //album name, not id
    // console.log(`name: ${req.params.id}`)
    let id = 0
    for (let i = 0; i < data.length; i++) {
      if (data[i].album_name == req.params.id) {
        id = i + 1
        break
      }
    }
    if (id == 0) {
      return res.status(400).send({msg: `No album with album_name "${req.params.id}"`})
    }
    console.log(app.locals.basePath)
    res.redirect(`${app.locals.basePath}/albums/${id}`)
  } else {
    // console.log(`id: ${req.params.id}`)
    const albumObj = data[req.params.id - 1]
    if (!albumObj) {
      return res.status(400).send({msg: `No album of id "${req.params.id}"`})
    }
    return res.status(200).send({ album_num: req.params.id, album_title: albumObj.album_name, artist: albumObj.artist, listen_count: albumObj.listens })
  }
})
app.get('/artists', (req, res) => {
  let page = parseInt(req.query.page)
  let artistNames = Object.keys(artistData).sort()

  if (!page) {
      page = 1
  } else if (page > Math.ceil(artistNames.length/10)) {
    return res.status(400).send({msg: `Requested page is out of range"`})
  }
  
  let artistArr
  if (artistNames.length % 10 != 0 && page == Math.ceil(artistNames.length/10)) {
    artistArr = artistNames.slice((10*(page-1)), artistNames.length)
  } else {
    artistArr = artistNames.slice((10*(page-1)), (10*(page)))
  }
  return res.status(200).send({ artists:artistArr, currentPage:page, firstPage:page == 1, lastPage:page == Math.ceil(artistNames.length/10) })
})
app.get('/artists/listens', (req, res) => {
  let artistListens = {}
  for (let i = 0; i < data.length; i++) {
    if (artistListens[data.artist]) {
      artistListens[data[i].artist] += data[i].listens
    } else {
      artistListens[data[i].artist] = data[i].listens
    }
  }

  const sortedAristsListens = Object.entries(artistListens)
  .map(([artist, listens]) => ({ artist, listens }))
  .sort((a, b) => b.listens - a.listens);

  return res.status(200).send({ artists:sortedAristsListens })
})
app.get('/artists/:name', (req, res) => {
  const artistAlbums = artistData[req.params.name]
  if (!artistAlbums) {
    return res.status(400).send({msg: `No artist of name "${req.params.id}"`})
  }
  res.status(200).send({ artist: req.params.name, albums: artistAlbums })
})
app.get('/art/:id', (req, res) => {
  if (isNaN(req.params.id) || req.query.name == 'true') { //album name, not id
    let id = 0
    for (let i = 0; i < data.length; i++) {
      if (data[i].album_name == req.params.id) {
        id = i + 1
        break
      }
    }
    if (id == 0) return res.status(400).send({msg: `No album with album_name "${req.params.id}"`})
    res.status(200).send({ art:  data[id - 1]['art'] })
  } else {
    // console.log(`id: ${req.params.id}`)
    const albumObj = data[req.params.id - 1]
    if (!albumObj) return res.status(400).send({msg: `No album of id "${req.params.id}"`})
    return res.status(200).send({ art: albumObj.art })
  }
})


app.put('/albums/reset', (req, res) => {
  data = [...dataBackup]
  artistData = JSON.parse(JSON.stringify(artistsBackup))
  fs.writeFileSync(path.join(__dirname, 'public/data.json'), JSON.stringify(data, null, 2))
  fs.writeFileSync(path.join(__dirname, 'public/artists.json'), JSON.stringify(artistData, null, 2))
  res.status(200).send({msg: "Reset Successful :D"})
})
app.put('/albums/:id/reset', (req, res) => {
  if (req.params.id >= data.length) {
    return res.status(400).send({msg: "Album ID is out of range."})
  } else {
    data[req.params.id - 1] = { ...dataBackup[req.params.id - 1] }
    fs.writeFileSync(path.join(__dirname, 'public/data.json'), JSON.stringify(data, null, 2))
    formattedData = {
      album_title: data[req.params.id - 1].album_name,
      artist: data[req.params.id - 1].artist,
      listen_count: data[req.params.id - 1].listens,
      album_num: data[req.params.id - 1].rank
    }
    res.status(200).send(formattedData)
  }
})
app.put('/albums', (req, res) => {
  const newAlbumData = req.body;
  console.log(newAlbumData)
  if (!newAlbumData.album_name && !newAlbumData.artist && !newAlbumData.listens) {
    return res.status(400).send({msg: "All fields are missing."})
  }
  data.forEach(album => {
    if (newAlbumData.album_name) {
      album.album_name = newAlbumData.album_name
    }
    if (newAlbumData.artist) {
      album.artist = newAlbumData.artist
    }
    if (newAlbumData.listens) {
     album.listens = newAlbumData.listens
    }
  })

  fs.writeFileSync(path.join(__dirname, 'public/data.json'), JSON.stringify(data, null, 2))
  return res.status(200).send({msg: "Album Successfully Updated :D"})
})
app.put('/albums/:id', (req, res) => {
  const newAlbumData = req.body;
  console.log(newAlbumData)
  if (!newAlbumData.album_name && !newAlbumData.artist && !newAlbumData.listens) {
    return res.status(400).send({msg: "All fields are missing."})
  } else {
    if (newAlbumData.album_name) {
      data[req.params.id - 1].album_name = newAlbumData.album_name
    }
    if (newAlbumData.artist) {
      data[req.params.id - 1].artist = newAlbumData.artist
    }
    if (newAlbumData.listens) {
      data[req.params.id - 1].listens = newAlbumData.listens
    }
  
    fs.writeFileSync(path.join(__dirname, 'public/data.json'), JSON.stringify(data, null, 2))
    return res.status(200).send({msg: "Album Successfully Updated :D"})
  }
})
app.put('/recalc', (req, res) => { 
  axios.get(`https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${lastFMUser}&api_key=${lastFMKey}&period=12month&format=json&limit=150`)
    .then(response => {
      let newArtistData = {}
      response.data.topalbums.album.forEach(album => {
        let newAlbum = {
          album_name: album.name,
          artist: album.artist.name,
          listens: parseInt(album.playcount),
          art: album.image[album.image.length-1]["#text"],
          mbid: album.mbid,
          rank: parseInt(album["@attr"].rank)
        }
        // console.log(newAlbum)
        data[parseInt(album["@attr"].rank)-1] = newAlbum

        if (newArtistData[newAlbum.artist]) {
          newArtistData[newAlbum.artist].push(newAlbum.album_name)
        } else {
          newArtistData[newAlbum.artist] = [newAlbum.album_name]
        }
      })

      if (data.length > response.data.topalbums.album.length) {
        data.length = response.data.topalbums.album.length
      }
      artistData = newArtistData

      fs.writeFileSync(path.join(__dirname, 'public/data.json'), JSON.stringify(data, null, 2))
      fs.writeFileSync(path.join(__dirname, 'public/dataBackup.json'), JSON.stringify(data, null, 2))
      
      fs.writeFileSync(path.join(__dirname, 'public/artists.json'), JSON.stringify(artistData, null, 2))
      fs.writeFileSync(path.join(__dirname, 'public/artistsBackup.json'), JSON.stringify(artistData, null, 2))

      res.status(200).send({msg: "Data Successfully Updated To Mius' Newest Listening Stats :D"})
    })
    .catch(error => {
      console.error('Error fetching JSON:', error)
      res.status(500).send({msg: "Couldn't update data."})
    })
})

app.post('/albums', (req, res) => {
  const newAlbum = req.body;
  // console.log(newAlbum)
  // console.log(req)
  if (!newAlbum.album_name || !newAlbum.artist || !newAlbum.listens) {
    return res.status(400).send({msg: "Fields are missing."})
  }
  
  if ((new Set(Object.keys(artistData))).has(newAlbum.artist) && 
  (new Set(artistData[newAlbum.artist])).has(newAlbum.album_name)) {
    return res.status(400).send({msg: "Submitted album is already present."})
  }

  newAlbum["art"] = newAlbum["mbid"] = ""
  newAlbum["rank"] = data.length + 1
  data.push(newAlbum)

  artistData[newAlbum.artist] ? 
  artistData[newAlbum.artist].push(newAlbum.album_name) 
  : artistData[newAlbum.artist] = [newAlbum.album_name]

  fs.writeFileSync(path.join(__dirname, 'public/data.json'), JSON.stringify(data, null, 2))
  fs.writeFileSync(path.join(__dirname, 'public/artists.json'), JSON.stringify(artistData, null, 2))

  return res.status(200).send({msg: "Album Successfully Added :D"})
})
app.post('/albums/:artist', (req, res) => {
  if (!(new Set(Object.keys(artistData))).has(req.params.artist)) {
    return res.status(400).send({msg: "Requested artist doesn't exist."})
  }

  let newAlbum = req.body
  console.log(req)
  if (!newAlbum.album_name || !newAlbum.listens) {
    return res.status(400).send({msg: "Fields are missing."})
  }
  if ((new Set(artistData[req.params.artist])).has(newAlbum.album_name)) {
    return res.status(400).send({msg: "Submitted album is already present."})
  }
  
  newAlbum["art"] = newAlbum["mbid"] = ""
  newAlbum["rank"] = data.length + 1

  data.push(newAlbum)
  artistData[req.params.artist].push(newAlbum.album_name)

  fs.writeFileSync(path.join(__dirname, 'public/data.json'), JSON.stringify(data, null, 2))
  fs.writeFileSync(path.join(__dirname, 'public/artists.json'), JSON.stringify(artistData, null, 2))

  return res.status(200).send({msg: "Album Successfully Added :D"})
})

app.delete('/albums/:id', (req, res) => {
  data.splice(req.params.id-1, 1)
  fs.writeFileSync(path.join(__dirname, 'public/data.json'), JSON.stringify(data, null, 2))
  res.status(200).send({msg: "Album Successfully Deleted :D"})
})

app.listen(port, () => {
	console.log('Listening on *:3000')
})


/* 
mongo routes 
*/


app.get('/db', async (req, res) => {
  try {
    const docs = await miusicCol.find({}, { projection: { rank: 1 } }).sort({ rank: 1 }).toArray();
    const numbers = docs.map(doc => doc.rank );
    res.send({ numbers: numbers, msg: `Valid numbers successfully retrieved, ranging from ${Math.min(...numbers)} to ${Math.max(...numbers)} :D` });
  } catch (err) {
    res.status(500).send({ msg: 'Failed to fetch numbers' });
  }
})
app.put('/db', async (req, res) => {
  try {
    const result = await miusicCol.updateMany({}, { $set: req.body });
    res.send({ msg: `Successfully updated all ${result.modifiedCount} documents :D` });
  } catch (err) {
    res.status(400).send({ msg: 'Bulk update failed.' });
  }
})
app.post('/db',async (req, res) => {
  try {
    const highest = await miusicCol.find().sort({ rank: -1 }).limit(1).toArray();
    const nextNumber = highest.length ? highest[0].rank + 1 : 1;

    const newDoc = { rank: nextNumber, ...req.body };
    await miusicCol.insertOne(newDoc);

    res.status(201).send({ newDoc: newDoc, msg: `Album document successfully created to db at id ${nextNumber} :D`});
  } catch (err) {
    res.status(400).send({ msg: 'Failed to create document.' });
  }
})
app.delete('/db', async (req, res) => {
  try {
    await miusicCol.deleteMany({});
    res.send({ msg: 'All documents successfully deleted :D' });
  } catch (err) {
    res.status(500).send({ msg: 'Mass delete failed.' });
  }
})

app.get('/db/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const doc = await miusicCol.findOne({ rank: id });
    if (!doc) return res.status(404).send({ msg: 'Specified document not found.' });
    res.send({doc: doc, msg: `Document ${id} successfully found :D`});
  } catch (err) {
    res.status(400).send({ msg: 'Document request failed.' });
  }
})
app.put('/db/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await miusicCol.updateOne({ rank: id }, { $set: req.body });
    if (result.matchedCount === 0) return res.status(404).send({ msg: 'Specified document not found.' });

    const updatedDoc = await miusicCol.findOne({ rank: id });
    res.send({doc: updatedDoc, msg: `Document ${id} successfully updated :D`});
  } catch (err) {
    res.status(400).send({ msg: 'Document update failed.' });
  }
})
app.post('/db/:id', (req, res) => {
  res.status(405).send({ msg: 'POST not allowed on with specified Document ID.' });
})
app.delete('/db/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await miusicCol.deleteOne({ rank: id });
    res.send({ msg: `Document ${id} successfully deleted (if it existed) :D` });
  } catch (err) {
    res.status(400).send({ msg: 'Document delete failed.' });
  }
})
