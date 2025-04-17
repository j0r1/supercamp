import requests
import json
import os
import pprint
import utils
import pprint

def calcCoord(allNodes, nodeList):
    assert len(nodeList) > 0

    lat, lon = 0, 0
    for nodeId in nodeList:
        node = allNodes[nodeId]
        lat += node["lat"]
        lon += node["lon"]

    lat /= len(nodeList)
    lon /= len(nodeList)
    return [ lon, lat ]

def main():

    query = """
    [out:json];
    area["ISO3166-1"="NL"]["admin_level"="2"]->.country;
    (
      node["tourism"="camp_site"](area.country);
      way["tourism"="camp_site"](area.country);
      relation["tourism"="camp_site"](area.country);
    );
    out body;
    >;
    out skel qt;
    """

    data = utils.queryOsm(query, "response_campsites_nl.json")
    elements = data["elements"]

    allNodes = { }
    for e in elements:
        if e["type"] != "node":
            continue

        nodeId = e["id"]
        if nodeId in allNodes:
            print("Node", nodeId, "already present, merging")
            utils.mergeInto(allNodes[nodeId], e)

        allNodes[nodeId] = e

    allPlaces = { }

    for n in allNodes:
        node = allNodes[n]
        nodeId = node["id"]
        if "tags" in node:
            allPlaces[f"node-{nodeId}"] = {
                    "tags": node["tags"],
                    "coord": [ node["lon"], node["lat"] ]
            }
            
    for e in elements:
        if not "tags" in e:
            continue

        if e["type"] == "way":
            wayId = e["id"]
            allPlaces[f"way-{wayId}"] = {
                "tags": e["tags"],
                "coord": calcCoord(allNodes, e["nodes"])
            }
        elif e["type"] == "relation":
            pass

    pprint.pprint(allPlaces)

    print("Number of nodes:", len(allNodes))
    print("Number of places:", len(allPlaces))
if __name__ == "__main__":
    main()

# Send the request to the API


# Process the results
#for element in data['elements']:
#    if 'tags' in element:
#        tags = element['tags']
#        if 'name' in tags:
#            print(f"Store: {tags['name']}, Type: {tags.get('shop', 'Unknown')}")
#            # All metadata is in the tags dictionary
