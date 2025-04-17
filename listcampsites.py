import requests
import json
import os

def main():

    fn = "response_campsites_nl.json"
    if not os.path.exists(fn):
        print("Querying OSM database")

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

        response = requests.get("https://overpass-api.de/api/interpreter", params={'data': query})
        data = response.json()
        open(fn, "wt").write(json.dumps(data, indent=4))
    else:
        print("Loading campsite data from", fn)
        data = json.load(open(fn, "rt"))

    

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
