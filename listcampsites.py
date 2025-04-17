import requests
import json
import os
import pprint
import utils

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

    allNodes = { }

    for e in data["elements"]:
        if e["type"] != "node":
            continue

        nodeId = e["id"]
        if nodeId in allNodes:
            print("Node", nodeId, "already present, merging")
            utils.mergeInto(allNodes[nodeId], e)

        allNodes[nodeId] = e

    print("Number of nodes:", len(allNodes))

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
