"use strict";

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

function processPlacesBounds(map, obj, bounds)
{
    for (let key in obj)
    {
        let value = obj[key];
        bounds.extend([value.coord[1], value.coord[0]]);
    }
}

let allCampSites = null;
let allSuperMarkets = null;
let allFitness = null;
let allPools = null;

const limitZoomLevel = 11;

function isOutside(lat, lon, north, south, east, west)
{
    // TODO: check is not really correct, wrapping of lat is not considered
    if (lon > north || lon < south || lat < west || lat > east)
        return true;
    return false;
}

const storeIdentifiers = {
    "AH": [ "Albert Heijn", "www.ah.nl" ],
    "Jumbo": [ "Jumbo", "www.jumbo.com" ],
    "PLUS": [ "PLUS", "www.plus.nl" ],
    "Spar": [ "SPAR", "www.spar.nl" ],
    "Lidl": [ "Lidl", "www.lidl.nl" ],
    "ALDI": [ "ALDI", "www.aldi.nl" ],
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

function addMarkersForBounds(map, north, south, east, west, places, iconType)
{
    const urlKeys = [ "website", "contact:website", "url", "facebook", "contact:facebook" ];

    for (let id in places)
    {
        if (id in addedMarkers)
            continue;

        const value = places[id];
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

            marker.bindPopup(popupContent);

            addedMarkers[id] = { coord: value["coord"], marker: marker };
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
    if (zoom < limitZoomLevel)
        return;

    const bounds = map.getBounds();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    removeOldMarkersForBounds(map, north, south, east, west);
    
    addMarkersForBounds(map, north, south, east, west, allCampSites, "green");
    addMarkersForBounds(map, north, south, east, west, allSuperMarkets, checkSuperMarket);
    addMarkersForBounds(map, north, south, east, west, allFitness, "yellow");
    addMarkersForBounds(map, north, south, east, west, allPools, "blue");
}

async function main()
{
    const map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let campResponse = await fetch("parsed_campsites_nl.json");
    let campJson = await campResponse.json();
    let storeResponse = await fetch("parsed_supermarkets_nl.json");
    let storeJson = await storeResponse.json();
    let fitnessResponse = await fetch("parsed_fitness_nl.json");
    let fitnessJson = await fitnessResponse.json();
    let poolsResponse = await fetch("parsed_pools_nl.json");
    let poolsJson = await poolsResponse.json();

    allCampSites = campJson;
    allSuperMarkets = storeJson;
    allFitness = fitnessJson;
    allPools = poolsJson;

    const bounds = L.latLngBounds();
    processPlacesBounds(map, campJson, bounds);
    processPlacesBounds(map, storeJson, bounds);
    processPlacesBounds(map, fitnessJson, bounds);
    processPlacesBounds(map, poolsJson, bounds);
    map.fitBounds(bounds);

    map.on("zoomend", () => checkViewportChange(map));
    map.on("moveend", () => checkViewportChange(map));
}

document.addEventListener("DOMContentLoaded", (event) => {
    main();
});