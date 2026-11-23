import urllib.request
import json
import os
import time

files = {
    'yamaha-nmax.jpg': 'File:Yamaha_NMAX_Turbo_155_front_side_view_in_Indonesia.jpg',
    'toyota-avanza.jpg': 'File:2021_Toyota_Avanza_1.5_G_Toyota_Safety_Sense_(Indonesia)_front_view_03.jpg',
    'mitsubishi-xpander.jpg': 'File:2021_Mitsubishi_Xpander_Ultimate_(Indonesia)_front_view.jpg',
    'honda-beat.jpg': 'File:2021_Honda_BeAT_Deluxe_110_(20220111).jpg',
    'honda-vario.jpg': 'File:2022_Honda_Vario_125_CBS-ISS_(20221105).jpg'
}

os.makedirs('.scratch/raw_vehicles', exist_ok=True)

headers = {
    'User-Agent': 'MotoRentCloudBot/1.0 (https://github.com/marzhendo/MotoRent-Cloud; student project CAK3EAB3) Python/3.12 urllib'
}

for local_name, wiki_title in files.items():
    out_path = os.path.join('.scratch/raw_vehicles', local_name)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
        print(f"Skipping {local_name}, already exists ({os.path.getsize(out_path)} bytes)")
        continue

    time.sleep(2)  # Respect rate limit
    url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={wiki_title}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data.get('query', {}).get('pages', {})
            for pid, pdata in pages.items():
                img_url = pdata.get('imageinfo', [{}])[0].get('url')
                print(f"Downloading {local_name} from {img_url}...")
                time.sleep(2)
                img_req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(img_req) as img_resp, open(out_path, 'wb') as f:
                    f.write(img_resp.read())
                print(f"Saved {local_name} ({os.path.getsize(out_path)} bytes)")
    except Exception as e:
        print(f"Error on {local_name}:", e)
