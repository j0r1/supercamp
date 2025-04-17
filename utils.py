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
