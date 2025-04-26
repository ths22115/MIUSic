
// const apiBaseUrl = window.location.hostname == 'localhost' ? 'http://localhost:3000' : 'https://thomam13.eastus.cloudapp.azure.com/node'
const albumVinylNode = document.getElementById("album-vinyl-container")
const artistVinylNode = document.getElementById("artist-vinyl-container")
const albumVinyl = ReactDOM.createRoot(albumVinylNode)
const artistVinyl = ReactDOM.createRoot(artistVinylNode)
let albumActive = true


function AlbumVinyl() { 
    return (
        React.createElement("div", {className: "album-vinyl vinyl-component vinyl-active", onClick: (e) => vinylFocusToggle(e, true)}, 
            React.createElement("img", {className: "vinyl", src: "blackVinyl4-trans.png"}),
            React.createElement("div", {className: "album-radial-label radial-label"}, "listens per",
                React.createElement("a", {className: "radial-label-x"}, "ALBUM")
            ),
            React.createElement("div", {id: "album-radial", className: "vinyl-radial"}))
    )
}

function ArtistVinyl() { 
    return (
        React.createElement("div", {className: "artist-vinyl vinyl-component", onClick: (e) => vinylFocusToggle(e, false)}, 
            React.createElement("img", {className: "vinyl", src: "blackVinyl4-trans.png"}),
            React.createElement("div", {className: "artist-radial-label radial-label"}, "listens per",
                React.createElement("a", {className: "radial-label-x"}, "ARTIST")
            ),
            React.createElement("div", {id: "artist-radial", className: "vinyl-radial"}))
    )
}

function vinylFocusToggle(event, isAlbumTarget) {
    event.stopPropagation()
    const album = document.querySelector(".album-vinyl")
    const artist = document.querySelector(".artist-vinyl")

    console.log(isAlbumTarget)
    if (albumActive != isAlbumTarget) { 
        if (isAlbumTarget) { // switch to album
            console.log("switch to album")
            album.classList.add('vinyl-active')
            artist.classList.remove('vinyl-active')
            albumActive = true
        } else { // switch to artist
            console.log("switch to artist")
            artist.classList.add('vinyl-active')
            album.classList.remove('vinyl-active')
            albumActive = false
        }
        
    } 
}

// album.addEventListener('click', function(event) {
//     console.log('Event listener on album vinyl triggered');
// });
// artist.addEventListener('click', function(event) {
//     console.log('Event listener on artist vinyl triggered');
// });


async function listensPerAlbum() {
    try {
        const res = await fetch(`${apiBaseUrl}/albums?page=-1`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
        const data = await res.json();
        if (!res.ok) { throw res }
        return data
    } catch (err) {
        console.error('There was a problem with the request:', err);
        return { err: `problem with API call, ${err.status} status`}
    }
}

async function listensPerArtist() {
    try {
        const res = await fetch(`${apiBaseUrl}/artists/listens`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
        const data = await res.json();
        if (!res.ok) { throw res }
        return data
    } catch (err) {
        console.error('There was a problem with the request:', err);
        return { err: `problem with API call, ${err.status} status`}
    }
}
  
function albumRadial() {
    // set the dimensions and margins of the graph
    var height = width = (window.innerWidth) * .73,
    innerRadius = (window.innerWidth) * .22,
    outerRadius = height / 2;   // the outerRadius goes from the middle of the SVG area to the border

    const radialContainer = document.getElementById("album-radial");
    radialContainer.textContent = '';

    // append the svg object to the body of the page
    var svg = d3.select("#album-radial")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + (width / 2 ) + "," + (height / 2 ) + ")");


    listensPerAlbum().then(albumData => {
        if (albumData.err) return false
        const albums = albumData.albums;
        console.log(albums)

        // Scales
        var x = d3.scaleBand()
            .range([0, 2 * Math.PI])
            .align(0)
            .domain(albums.map(d => d.album_name));

        var y = d3.scaleRadial()
            .range([innerRadius, outerRadius - d3.max(albums, d => d.listens)*.25])
            .domain([0, d3.max(albums, d => d.listens)]);

        // Example ring values – change or generate dynamically if needed
        const ringValues = [100, 200, 300, 400];

        const ringGroup = svg.append("g").attr("class", "rings");

        ringGroup.selectAll("circle")
            .data(ringValues)
            .enter()
            .append("circle")
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-dasharray", "2,2") // dashed rings
            .attr("r", d => y(d));

        // Add labels for each ring
        ringGroup.selectAll("text")
            .data(ringValues)
            .enter()
            .append("text")
            .attr("y", d => -y(d)) // position on top of each ring
            .attr("dy", "-0.35em")
            .attr("x", 5)
            .text(d => d)
            .style("font-size", "10px")
            .style("fill", "#999");


        // Add the bars
        svg.append("g")
            .selectAll("path")
            .data(albums)
            .enter()
            .append("path")
            .attr("fill", "white")
            .attr("d", d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(d => y(d.listens))
                .startAngle(d => x(d.album_name))
                .endAngle(d => x(d.album_name) + x.bandwidth())
                .padAngle(0.01)
                .padRadius(innerRadius)
            );

        // Add the labels
        svg.append("g")
            .selectAll("g")
            .data(albums)
            .enter()
            .append("g")
            .attr("text-anchor", "start")
            .attr("transform", d =>
                `rotate(${(x(d.album_name) + x.bandwidth() / 2) * 180 / Math.PI - 90})translate(${y(d.listens) + 10},0)`
            )
            .append("text")
            .text(d => `(${d.listens}) ${d.album_name}`)
                .style("font-size", "11px")
                .style("font-weight", "800")
                .style("fill", "#eaeaea")
                .attr("alignment-baseline", "middle");
            });
        return true
}

function artistRadial() {
    // set the dimensions and margins of the graph
    var height = width = (window.innerWidth) * .85,
    innerRadius = (window.innerWidth) * .22,
    outerRadius = height / 2;   // the outerRadius goes from the middle of the SVG area to the border
    
    const radialContainer = document.getElementById("artist-radial");
    radialContainer.textContent = '';
    
    // append the svg object to the body of the page
    var svg = d3.select("#artist-radial")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + (width / 2 ) + "," + (height / 2 ) + ")");
    
    
    listensPerArtist().then(artistData => {
        if (artistData.err) return false
        const artists = artistData.artists;
        console.log(artists)
    
        // Scales
        var x = d3.scaleBand()
            .range([0, 2 * Math.PI])
            .align(0)
            .domain(artists.map(d => d.artist));
    
        var y = d3.scaleRadial()
            .range([innerRadius, outerRadius - d3.max(artists, d => d.listens)*.4])
            .domain([0, d3.max(artists, d => d.listens)]);
    
        // Example ring values – change or generate dynamically if needed
        const ringValues = [100, 200, 300];
    
        const ringGroup = svg.append("g").attr("class", "rings");
    
        ringGroup.selectAll("circle")
            .data(ringValues)
            .enter()
            .append("circle")
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-dasharray", "2,2") // dashed rings
            .attr("r", d => y(d));
    
        // Add labels for each ring
        ringGroup.selectAll("text")
            .data(ringValues)
            .enter()
            .append("text")
            .attr("y", d => -y(d)) // position on top of each ring
            .attr("dy", "-0.35em")
            .attr("x", 5)
            .text(d => d)
            .style("font-size", "10px")
            .style("fill", "#999");
    
    
        // Add the bars
        svg.append("g")
            .selectAll("path")
            .data(artists)
            .enter()
            .append("path")
            .attr("fill", "white")
            .attr("d", d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(d => y(d.listens))
                .startAngle(d => x(d.artist))
                .endAngle(d => x(d.artist) + x.bandwidth())
                .padAngle(0.01)
                .padRadius(innerRadius)
            );
    
        // Add the labels
        svg.append("g")
            .selectAll("g")
            .data(artists)
            .enter()
            .append("g")
            .attr("text-anchor", "end")
            .attr("transform", d =>
                `rotate(${(x(d.artist) + x.bandwidth() / 2) * 180 / Math.PI - 90})translate(${y(d.listens) + 10},0)`
            )
            .append("text")
            .text(d => `${d.artist} (${d.listens})`)
                .attr("transform", "rotate(180)")
                .style("font-size", "13px")
                .style("font-weight", "800")
                .style("fill", "#eaeaea")
                .attr("alignment-baseline", "middle");
            });
        return true
}

albumVinyl.render(React.createElement(AlbumVinyl))
artistVinyl.render(React.createElement(ArtistVinyl))
setTimeout(() => {
    albumRadial()
    artistRadial()
}, 50);
