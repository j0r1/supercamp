"use strict";

const icons = {
    "red": L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
}

const addedMarkers = { };

function processPlaces(map, obj, bounds, iconType)
{
    for (let key in obj)
    {
        let value = obj[key];
        bounds.extend([value.coord[1], value.coord[0]]);
    }
}

let allCampSites = null;
let allSuperMarkets = null;

const limitZoomLevel = 11;

function isOutside(lat, lon, north, south, east, west)
{
    // TODO: check is not really correct, wrapping of lat is not considered
    if (lon > north || lon < south || lat < west || lat > east)
        return true;
    return false;
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
        
        if (iconType)
            marker = L.marker([value.coord[1], value.coord[0]], {icon: icons[iconType]}).addTo(map);
        else
            marker = L.marker([value.coord[1], value.coord[0]]).addTo(map);

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
    
    addMarkersForBounds(map, north, south, east, west, allCampSites);
    addMarkersForBounds(map, north, south, east, west, allSuperMarkets, "red");
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

    allCampSites = campJson;
    allSuperMarkets = storeJson;

    const bounds = L.latLngBounds();
    processPlaces(map, campJson, bounds);
    processPlaces(map, storeJson, bounds, "red");
    map.fitBounds(bounds);

    map.on("zoomend", () => checkViewportChange(map));
    map.on("moveend", () => checkViewportChange(map));
}

document.addEventListener("DOMContentLoaded", (event) => {
    main();
});