import requests
import json
import os
import pprint
import utils
import pprint

def run(countryCode, responseFn, parsedFn):

    query = f"""
    [out:json];
    area["ISO3166-1"="{countryCode}"]["admin_level"="2"]->.country;
    (
      node["tourism"="camp_site"](area.country);
      way["tourism"="camp_site"](area.country);
      relation["tourism"="camp_site"](area.country);
    );
    out body;
    >;
    out skel qt;
    """

    data = utils.queryOsm(query, responseFn)
    allPlaces = utils.getAllPlaces(data)

    print("Number of camp sites:", len(allPlaces))
    json.dump(allPlaces, open(parsedFn, "wt"), indent=4)

def main():
    run("NL", "response_campsites_nl.json", "parsed_campsites_nl.json")
    run("BE", "response_campsites_be.json", "parsed_campsites_be.json")

if __name__ == "__main__":
    main()

