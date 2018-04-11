import json

statelist = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
    "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "DC", "WV", "WI", "WY"]

stateindex = {"AL": 0, "AK": 1, "AZ": 2, "AR": 3, "CA": 4, "CO": 5, "CT": 6,
    "DE": 7, "FL": 8, "GA": 9, "HI": 10, "ID": 11, "IL": 12, "IN": 13,
    "IA": 14, "KS": 15, "KY": 16, "LA": 17, "ME": 18, "MD": 19, "MA": 20,
    "MI": 21, "MN": 22, "MS": 23, "MO": 24, "MT": 25, "NE": 26, "NV": 27,
    "NH": 28, "NJ": 29, "NM": 30, "NY": 31, "NC": 32, "ND": 33, "OH": 34,
    "OK": 35, "OR": 36, "PA": 37, "RI": 38, "SC": 39, "SD": 40, "TN": 41,
    "TX": 42, "UT": 43, "VT": 44, "VA": 45, "WA": 46, "DC": 47, "WV": 48,
    "WI": 49, "WY": 50}

if __name__ == "__main__":
    
    print("Collecting criminals' crime and state data...")
    
    statefile = open("wanted_in.txt", "r")
    crimefile = open("wanted_for.txt", "r")
    cs = json.load(statefile)
    cc = json.load(crimefile)
    
    #{state, criminals, crimes}
    result = [{"state": state, "criminals": [], "crimes": set()} for state in statelist]
    
    ids_used = set()
    for e in cs:
        id = e["criminal_id"]
        index = stateindex[e["state"]]
        result[index]["criminals"].append(id)
        ids_used.add(id)
        
    for e in cc:
        id = e["criminal_id"]
        if(id in ids_used):
            for e2 in result:
                if(id in e2["criminals"]):
                    e2["crimes"].add(e["crime_id"])
                    
    for e in result:
        e["crimes"] = list(e["crimes"])
        e["crimes"].sort()
        
    outfile = open("scc.txt", "w")
    json.dump(result, outfile)
    
    print("Done.\n")
    for e in result:
        print(e)
    