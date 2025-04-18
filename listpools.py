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
      // Standard swimming pools
      node["leisure"="swimming_pool"](area.country);
      way["leisure"="swimming_pool"](area.country);
      relation["leisure"="swimming_pool"](area.country);
      
      // Also include sports centers with swimming
      node["leisure"="sports_centre"]["sport"="swimming"](area.country);
      way["leisure"="sports_centre"]["sport"="swimming"](area.country);
      relation["leisure"="sports_centre"]["sport"="swimming"](area.country);
    );
    out body;
    >;
    out skel qt;
    """

    data = utils.queryOsm(query, "response_pools_nl.json")
    allPlaces = utils.getAllPlaces(data)

    toDelete = []
    for k in allPlaces:
        keep = True
        if "tags" in allPlaces[k]:
            tags = allPlaces[k]["tags"].copy()
            if "source" in tags and tags["source"] == "3dShapes":
                del tags["source"]

            if "access" in tags and tags["access"] == "private":
                keep = False
            
            elif "leisure" in tags and tags["leisure"] == "swimming_pool" and len(tags) == 1:
                keep = False
        else:
            keep = False

        if not keep:
            toDelete.append(k)

    for k in toDelete:
        del allPlaces[k]

    print("Number of pools:", len(allPlaces))
    json.dump(allPlaces, open("parsed_pools_nl.json", "wt"), indent=4)

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
