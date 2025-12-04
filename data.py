import json

new = \
[
  {
    "rank": -1,
    "title": "Miku birth",
    "date": "2007-08-31",
    "type": "event",
    "desc": "",
    "impact": ""
  },
  {
    "rank": -2,
    "title": "LOLA",
    "date": "2004-01-15",
    "type": "event",
    "desc": "The first two Vocaloid voicebanks were released by the British company Zero-G; they were English-exclusive. Marked the commercial launch of Vocaloid, originating in the West with English voicebanks, preceding the Japanese releases",
    "videoId": ""
  },
  {
    "rank": -3,
    "title": "MIKUNOPOLIS",
    "date": "2011-07-02",
    "type": "event",
    "desc": "Hatsune Miku performed her first North American concert at the Nokia Theater in Los Angeles as part of Anime Expo. Brought the virtual idol concert experience to a significant Western audience for the first time",
    "videoId": ""
  },
  {"rank":-4,
  "title": "Release of Oliver",
  "date": "2011-12-21",
  "type": "event",
  "desc": "Released by PowerFX and VocaTone, Oliver was a popular English Vocaloid 3 voicebank with a unique character design and high-quality voice. Oliver gained a large following and is often cited as a key Western-developed Vocaloid, demonstrating strong creative output outside of Japan",
  "videoId": ""
},
{"rank": -5,
"title": "Miku V3 English voicebank release",
"date": "2013-08-31",
"type": "event",
"desc": "Crypton Future Media released an official English version of Hatsune Miku's voicebank. Greatly lowered the language barrier for Western producers to create original English songs using the most famous Vocaloid character",
"videoId": ""
},
{
  "rank": -6,
  "title": "Pharell Williams remixes 'Last Night, Good Night' in 2014",
  "date": "2014-03-24",
  "type": "event",
  "desc": "American musician and producer Pharrell Williams released a remix of livetune's Hatsune Miku song for Re:Dial",
  "videoId": "0-LuF-hPcTw"
},
{
  "rank": -7,
  "title": "Lady Gaga's ArtRave",
  "date": "2014-05-06",
  "type": "event",
  "desc": "Hatsune Miku was the opening act for several dates of Lady Gaga's North American tour; massive mainstream exposure for Hatsune Miku to a broad pop music audience across the United States and Canada",
  "videoId": ""
},
{
  "rank": -8,
  "title": "Project DIVA Western release",
  "date": "2014-01-01",
  "type": "event",
  "desc": "Starting with Hatsune Miku: Project DIVA F 2nd, SEGA began consistently releasing the Vocaloid rhythm games in English on Western consoles, significantly increasing the visibility and accessibility of Vocaloid music and characters to the Western gaming community",
  "videoId": ""
},
{
  "rank": -9,
  "title": "Release of CYBER DIVA",
  "date": "2015-02-04",
  "type": "event",
  "desc": "Released by Yamaha, this was the first English-exclusive Vocaloid 4 voicebank developed by Yamaha themselves. Showed a renewed commitment from the Vocaloid engine developers to high-quality, professional English voicebanks for the Western market",
  "videoId": ""
}
]

print(new)

filename = "./app/data/data.json"

with open(filename, "r+", encoding="utf-8") as file:
    file_data = json.load(file)
    file_data.extend(new)

with open(filename, "w", encoding="utf-8") as file:
    file.truncate(0)
    json.dump(file_data, file, indent=2)
