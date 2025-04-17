import requests
import json
import os

def mergeInto(dest, toMerge):
    for x in toMerge:
        if not x in dest:
            dest[x] = toMerge[x]
        else:
            if dest[x] != toMerge[x]:
                print("Dest:")
                pprint.pprint(dest)
                print("To merge:")
                pprint.pprint(toMerge)
                raise Exception(f"Conflicting entries for {x}!")

def queryOsm(query, fn):

    if not os.path.exists(fn):
        print("Querying OSM database")

        response = requests.get("https://overpass-api.de/api/interpreter", params={'data': query})
        data = response.json()
        open(fn, "wt").write(json.dumps(data, indent=4))
    else:
        print("Loading campsite data from", fn)
        data = json.load(open(fn, "rt"))

    return data

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

def getAllPlaces(receivedData):
    elements = receivedData["elements"]

    allNodes = { }
    allWays = { }
    for e in elements:
        if e["type"] == "node":
            nodeId = e["id"]
            if nodeId in allNodes:
                print("Node", nodeId, "already present, merging")
                mergeInto(allNodes[nodeId], e)

            allNodes[nodeId] = e

        elif e["type"] == "way":
            wayId = e["id"]
            allWays[wayId] = e

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
            nodes = []
            relId = e["id"]
            for m in e["members"]:
                if m["type"] == "way":
                    wayId = m["ref"]
                    nodes += allWays[wayId]["nodes"]
                elif m["type"] == "node":
                    nodeId = m["ref"]
                    nodes.append(nodeId)
                else:
                    assert False

            allPlaces[f"rel-{relId}"] = {
                "tags": e["tags"],
                "coord": calcCoord(allNodes, nodes)
            }

    return allPlaces

