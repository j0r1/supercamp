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


function processPlaces(map, obj, bounds, iconType)
{
    const urlKeys = [ "website", "contact:website", "url", "facebook", "contact:facebook" ];
    for (let key in obj)
    {
        let value = obj[key];
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

            let popupContent = `<strong>${value.tags.name}</strong>`;
            if (url)
                popupContent += `<br><a href="${url}" target="_blank">${url}</a>`;
            marker.bindPopup(popupContent);
        }
        bounds.extend([value.coord[1], value.coord[0]]);
    }
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

    const bounds = L.latLngBounds();
    processPlaces(map, campJson, bounds);
    processPlaces(map, storeJson, bounds, "red");
    map.fitBounds(bounds);
}

document.addEventListener("DOMContentLoaded", (event) => {
    main();
});