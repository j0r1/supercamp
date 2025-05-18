"use strict";

class MapGrid
{
    constructor(numLat = 720, numLong = 1440)
    {
        this.cells = new Map();
        this.numLat = numLat;
        this.numLong = numLong;
        this.bounds = L.latLngBounds();
    }

    getBounds()
    {
        return this.bounds;
    }

    getGridKeys(north, south, east, west)
    {
        const sw = this.getKeyFor(south, west);
        const ne = this.getKeyFor(north, east);
        const allKeys = [];
        for (let y = sw[0] ; y <= ne[0] ; y++)
            for (let x = sw[1] ; x <= ne[1] ; x++)
                allKeys.push([y,x]);
        return allKeys;
    }

    toKeyStr(key)
    {
        return `${key}`;
    }

    getObjectsForGridKey(key)
    {
        if (!this.cells.has(this.toKeyStr(key)))
            return [];
        return this.cells.get(this.toKeyStr(key));
    }

    getKeyFor(lat, long)
    {
        lat += 90;
        long += 180;
        if (lat < 0 || long < 0)
            throw new Error(`Unexpected error, expecting positive longitude ${lon} and latitude ${lat}`)

        lat /= 180;
        long /= 360;

        let latBin = Math.floor(lat*this.numLat);
        let longBin = Math.floor(long*this.numLong);
        if (latBin == this.numLat)
            latBin = this.numLat-1;
        if (longBin == this.numLong)
            longBin = this.numLong-1;

        if (latBin >= this.numLat || longBin >= this.numLong)
            throw new Error(`Unexpected error, expecting ${longBin} < ${this.numLong} and ${latBin} < ${this.numLat}`);
        return [latBin, longBin];
    }

    process(obj, type)
    {
        let lat = obj.coord[1]
        let long = obj.coord[0];
        let key = this.getKeyFor(lat, long);

        const map = this.cells;
        if (!map.has(this.toKeyStr(key)))
            map.set(this.toKeyStr(key), {});

        let binProps = map.get(this.toKeyStr(key));
        if (!(type in binProps))
            binProps[type] = [];

        binProps[type].push(obj);

        this.bounds.extend([lat, long]);
    }

    processAll(objs, type)
    {
        for (let key in objs) // objs is a dictionary where the keys are different nodes
        {
            let obj = objs[key];
            obj.id = key;
            this.process(obj, type);
        }
    }
};

const mainGrid = new MapGrid();

const icons = {
    "AH": L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Albert_Heijn_Logo.svg',
        iconSize: [25, 26],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    "Jumbo": L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Jumbo_Logo.svg',
        iconSize: [54, 15],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    "PLUS": L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/PLUS_supermarket_logo.svg',
        iconSize: [61, 13],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    "Spar": L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Spar-logo.svg',
        iconSize: [63, 16],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    "Lidl": L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Lidl-Logo.svg',
        iconSize: [24, 24],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    "ALDI": L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/AldiNord-WorldwideLogo.svg',
        iconSize: [24, 24],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    "Delhaize": L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/fr/3/34/Delhaize_-_Logo.svg',
        iconSize: [65, 12],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    "Carrefour": L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/en/6/65/Carrefour_Groupe.svg',
        iconSize: [32, 20],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    "Colruyt": L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Logo_Colruyt.svg',
        iconSize: [68, 20],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    "Okay": L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/fr/1/17/OKay_logo.png',
        iconSize: [20, 20],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),

    "green": L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
    "blue": L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
    "red": L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
    "yellow": L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
}

const addedMarkers = { };

let travelStart = null;

function setTravelStart(lon, lat)
{
    travelStart = [lon, lat];

    // Make sure the destination button gets shown from now on
    document.documentElement.style.setProperty('--destbutton-ptr', 'initial');
    document.documentElement.style.setProperty('--destbutton-cursor', 'initial');
    document.documentElement.style.setProperty('--destbutton-opac', 'initial');
}

function getDirectionsTo(endLon, endLat)
{
    if (!travelStart)
        return;

    const [ startLon, startLat ] = travelStart;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLon}&destination=${endLat},${endLon}&travelmode=bicycling`;
    window.open(url, '_blank');
}

const limitZoomLevel = 11;

function isOutside(lat, lon, north, south, east, west)
{
    // TODO: check is not really correct, wrapping of lat is not considered
    if (lon > north || lon < south || lat < west || lat > east)
        return true;
    return false;
}

const storeIdentifiers = {
    "AH": [ "Albert Heijn", "www.ah.nl", "www.ah.be" ],
    "Jumbo": [ "Jumbo", "www.jumbo.com" ],
    "PLUS": [ "PLUS", "www.plus.nl" ],
    "Spar": [ "SPAR", "www.spar.nl", "www.spar.be", "Spar" ],
    "Lidl": [ "Lidl", "www.lidl.nl", "www.lidl.be" ],
    "ALDI": [ "ALDI", "www.aldi.nl", "www.aldi.be" ],
    "Delhaize": [ "Delhaize" ],
    "Carrefour": [ "Carrefour", "magasins.carrefour.eu", "magasins.carrefour.be", "winkels.carrefour.be", "winkels.carrefour.eu" ],
    "Colruyt": [ "Colruyt", "www.colruyt.be" ],
    "Okay": [ "Okay", "www.okay.be" ],
}

function checkSuperMarket(tags)
{
    for (let k in tags)
    {
        let value = tags[k];
        for (let ident in storeIdentifiers)
        {
            for (let x of storeIdentifiers[ident])
                if (value.indexOf(x) >= 0)
                    return ident;
        }
    }
    return "red";
}

function addMarkersForBounds(map, north, south, east, west, placeType, iconType)
{
    const urlKeys = [ "website", "contact:website", "url", "facebook", "contact:facebook" ];

    const gridKeys = mainGrid.getGridKeys(north, south, east, west);
    for (let key of gridKeys)
    {
        const objs = mainGrid.getObjectsForGridKey(key);
        let places = [];
        if (placeType in objs)
            places = objs[placeType];

        for (let value of places)
        {
            const id = value.id;
            if (id in addedMarkers)
                continue;

            const lon = value.coord[1];
            const lat = value.coord[0];
    
            // TODO: check is not really correct, wrapping of lat is not considered
            if (isOutside(lat, lon, north, south, east, west))
                continue;
    
            let marker = null;
            let iconName = null;
            
            if (typeof iconType === "function" && "tags" in value)
                iconName = iconType(value["tags"]);
            else
                iconName = iconType;
    
            marker = L.marker([value.coord[1], value.coord[0]], {icon: icons[iconName]}).addTo(map);
    
            if ("tags" in value)
            {
                let tags = value["tags"];
                let url = null;
                for (let uk of urlKeys)
                {
                    if (uk in tags)
                    {
                        url = tags[uk];
                        break;
                    }
                }
    
                let popupContent = "";
                if ("name" in value.tags)
                    popupContent = `<strong>${value.tags.name}</strong>`;
                else if ("brand" in value.tags)
                    popupContent = `<strong>${value.tags.brand}</strong>`;
                else
                {
                    let jsonStr = JSON.stringify(value.tags, null, 2);
                    popupContent = `<pre>${jsonStr}</pre>`;
                }
    
                if (url)
                    popupContent += `<br><a href="${url}" target="_blank">${url}</a>`;
    
                popupContent += `<br><br>Cycling: <button onclick="setTravelStart(${value.coord[0]}, ${value.coord[1]})">Set start</button>`;
                popupContent += `<button class="destbutton" onclick="getDirectionsTo(${value.coord[0]}, ${value.coord[1]})">Get directions</button>`;
    
                marker.bindPopup(popupContent);
    
                addedMarkers[id] = { coord: value["coord"], marker: marker };
            }    
        }
    }
}

function removeOldMarkersForBounds(map, north, south, east, west)
{
    let deletedMarkers = [];
    for (let mId in addedMarkers)
    {
        let value = addedMarkers[mId];
        const lon = value.coord[1];
        const lat = value.coord[0];

        if (isOutside(lat, lon, north, south, east, west))
        {
            // console.log("Removing marker " + mId + " from view");
            deletedMarkers.push(mId);
            value.marker.removeFrom(map);
        }
    }
    for (let mId of deletedMarkers)
        delete addedMarkers[mId];
}

function checkViewportChange(map)
{
    const zoom = map.getZoom();   
    const bounds = map.getBounds();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();
    const center = map.getCenter();

    localStorage["supercamp-view"] = JSON.stringify({ 
        "center": [center["lat"], center["lng"]], 
        "zoom": zoom 
    });

    if (zoom < limitZoomLevel)
        return;

    removeOldMarkersForBounds(map, north, south, east, west);
    
    addMarkersForBounds(map, north, south, east, west, "campsite", "green");
    addMarkersForBounds(map, north, south, east, west, "supermarket", checkSuperMarket);
    addMarkersForBounds(map, north, south, east, west, "fitness", "yellow");
    addMarkersForBounds(map, north, south, east, west, "pool", "blue");
}

async function main()
{
    const map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    for (let [ fn, type ] of [
        [ "parsed_campsites_nl.json", "campsite" ],
        [ "parsed_supermarkets_nl.json", "supermarket" ],
        [ "parsed_fitness_nl.json", "fitness" ],
        [ "parsed_pools_nl.json", "pool"],
        [ "parsed_campsites_be.json", "campsite" ],
        [ "parsed_supermarkets_be.json", "supermarket" ],
        [ "parsed_fitness_be.json", "fitness" ],
        [ "parsed_pools_be.json", "pool"]
    ]) {
        let response = await fetch(fn);
        let json = await response.json();
        mainGrid.processAll(json, type);
    }

    if ("supercamp-view" in localStorage)
    {
        const v = JSON.parse(localStorage["supercamp-view"]);
        map.setView(v["center"], v["zoom"]);
    }
    else
        map.fitBounds(mainGrid.getBounds());

    checkViewportChange(map);

    map.on("zoomend", () => checkViewportChange(map));
    map.on("moveend", () => checkViewportChange(map));
}

document.addEventListener("DOMContentLoaded", (event) => {
    main();
});