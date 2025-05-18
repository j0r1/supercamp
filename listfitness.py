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
      node["leisure"="fitness_centre"](area.country);
      way["leisure"="fitness_centre"](area.country);
      relation["leisure"="fitness_centre"](area.country);
      
      // Also include sports centers that specify fitness
      node["leisure"="sports_centre"]["sport"="fitness"](area.country);
      way["leisure"="sports_centre"]["sport"="fitness"](area.country);
      relation["leisure"="sports_centre"]["sport"="fitness"](area.country);
    );
    out body;
    >;
    out skel qt;
    """

    data = utils.queryOsm(query, responseFn)
    allPlaces = utils.getAllPlaces(data)

    print("Number of fitness centra:", len(allPlaces))
    json.dump(allPlaces, open(parsedFn, "wt"), indent=4)

def main():
    run("NL", "response_fitness_nl.json", "parsed_fitness_nl.json")
    run("BE", "response_fitness_be.json", "parsed_fitness_be.json")

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
