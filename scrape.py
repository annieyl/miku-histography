import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urlparse, parse_qs

def get_video_id(url):
    if not url:
        return None
    parsed = urlparse(url)
    if parsed.hostname in ('youtu.be', 'www.youtu.be'):
        return parsed.path[1:]
    if parsed.hostname in ('youtube.com', 'www.youtube.com'):
        if parsed.path == '/watch':
            return parse_qs(parsed.query).get('v', [None])[0]
        if parsed.path.startswith('/embed/'):
            return parsed.path.split('/')[2]
    return None

def scrape(start_page=0, end_page=1):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    all_songs = []
    processed_video_ids = set()
    current_id = 1
    
    for page_num in range(start_page, end_page + 1):
        target_url = f"https://vocaloard.injpok.tokyo/en/?d=2025-10&k=1&p={page_num}"
        print(f"Scraping page {page_num}: {target_url}...")
        
        try:
            response = requests.get(target_url, headers=headers)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Error fetching page {page_num}: {e}")
            continue

        soup = BeautifulSoup(response.content, 'html.parser')
        
        #find links on page
        links = soup.find_all('a', href=True)
        #<a> tags
        
        for link in links:
            href = link['href']
            #actual link
            
            #youtube
            if 'youtube.com' in href or 'youtu.be' in href:
                video_id = get_video_id(href)
                
                # duplicates
                if not video_id or video_id in processed_video_ids:
                    continue

                #extract relevant info
                title_tag = link.find(class_="song-title")
                singers_tag = link.find(class_="singers")
                artists_tag = link.find(class_="artists")
                published_tag = link.find(class_="published")

                #skip if no title
                if not title_tag:
                    continue

                #clean
                title = title_tag.get_text(strip=True)
                
                #combine singer, producer
                singer_text = singers_tag.get_text(strip=True) if singers_tag else ""
                producer_text = artists_tag.get_text(strip=True) if artists_tag else ""
                artist_combined = ", ".join([part for part in [singer_text, producer_text] if part])

                # date formatting
                raw_date = published_tag.get_text(strip=True) if published_tag else ""
                formatted_date = raw_date.replace('/', '-') if raw_date else "Unknown"

                song_data = {
                    "rank": current_id,
                    "title": title,
                    "artist": artist_combined,
                    "date": formatted_date,
                    "type": "song",
                    "desc": "",
                    "impact": "",
                    "videoId": video_id
                }
                
                all_songs.append(song_data)
                processed_video_ids.add(video_id)
                current_id += 1
        
        time.sleep(1)

    with open("./app/data.json", "w", encoding="utf-8") as file:
        json.dump(all_songs, file, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    scrape(start_page=0, end_page=1) #first 100
    # scrape(start_page=0, end_page=0) #debugging