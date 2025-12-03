import json

data = json.loads(open("./app/data/data.json", "r", encoding="utf-8").read())

types = {(item["type"], item["rank"]) for item in data}
print(types)