import requests
import json
import os
import pprint
import utils

def run(countryCode, responseFn, parsedFn):

    query = f"""
	[out:json];
    area["ISO3166-1"="{countryCode}"]["admin_level"="2"]->.country;
    (
	  node["shop"~"supermarket|grocery|convenience"](area.country);
  	  way["shop"~"supermarket|grocery|convenience"](area.country);
  	  relation["shop"~"supermarket|grocery|convenience"](area.country);
    );
    out body;
    >;
    out skel qt;
    """

    data = utils.queryOsm(query, responseFn)
    allPlaces = utils.getAllPlaces(data)

    print("Number of supermarkets:", len(allPlaces))
    json.dump(allPlaces, open(parsedFn, "wt"), indent=4)

def main():
    run("NL", "response_supermarkets_nl.json", "parsed_supermarkets_nl.json")
    run("BE", "response_supermarkets_be.json", "parsed_supermarkets_be.json")

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
