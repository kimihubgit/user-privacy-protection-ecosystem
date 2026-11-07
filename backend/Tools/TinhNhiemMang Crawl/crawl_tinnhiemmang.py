import os
import re
import sys
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import Request, urlopen
from pymongo import MongoClient
from pymongo.errors import BulkWriteError

# Settings
MONGO_URI = os.environ.get("MONGO_URI", "mongodb+srv://vkhai2k5_db_user:16UKwC39liXlh1Gi@payment.oc6hemx.mongodb.net/")
DB_NAME = os.environ.get("MONGO_DB", "blocklist")
COLLECTION_NAME = "whitelist"
TOKEN = "CkPRVxqMmvBqgFG59ZEJcGNqXR3xvYmQp7h2IyPb"
COOKIE = '_gid=GA1.2.1310903116.1784211223; cf_clearance=y5HsTd14mr4WmTg7hR9kdPopVpYrIJVKuzdhx3YP_gI-1784211222-1.2.1.1-aq1pQDqzXqjKjQ7zKasKsfmun6mlyXhAyTHM12liu9T7OGNmUPmwZ9ko98QWVkysIYS43vBYYTTui95DzlwE2EW80YQJICxop8m.S0vtuqBlT4IpkxBAsM9J_Eby1Scs_Mh6PUD1YndDoRWXj2QaymUQMokJyDeEnREoW7xywIzb.sEtawOTqumTbr72AmqdonEPIAjzIA4fUF3cQy128fFOe0ApwiSvd40R8rdA1DHiJLO4ZytZk2wG0gGe4iawubpWM9EHgBkZYnqbYe_.MWNzVn1krLz3r7Oc8BVXKViPogKCVydJ4I8mDCl9sWeSEY2jh637qq3G31hcDmlRww; _ga_VPBY0Y4RX7=GS2.1.s1784211222$o1$g1$t1784211234$j48$l0$h0; _ga=GA1.1.2029885215.1784211223; XSRF-TOKEN=eyJpdiI6ImlPUElZLytXTDFBQkJibGVnNFhjZkE9PSIsInZhbHVlIjoieEl1VExiZnNZNit2MTlSeW5zV1hJOXA3MzltZFR3MnNFZlRRZUQ1T0xmMnpSak1oU0F0WFZheXZHR0VsbHZ4YWpTanZSVFp3UldGaHlhbE5UQkVQUy8zZmc4ajE4bC9BMEg4dW5oMURyNnZqRlZpK2lhMjhIY3BtUko1QU1IWjYiLCJtYWMiOiI3ZTYxZTBjNzI3NjgzNWM0ODU1YWRiNDI2MGI3NzhkZTMxZjliMjEwNTNjZmY5NzA2Y2E0MmI5OWM2YjZlYjNiIiwidGFnIjoiIn0%3D; tinnhiemmang_session=eyJpdiI6IjF4VnNpYVl5YUJtOVJDcURvSXA2WlE9PSIsInZhbHVlIjoicnhXZjZ5TGJMZk5OTlFiRXdXaDdTSnVQNU9NbUs5L3JBT0w3bG9nMnNhemhpMEFHRDZ0TDh4UWx0Z3dDc3JCUyt4VlAxTmlNZFlzWUJ0a29kaGliK3p2TFpSMFR6QktCYkN0QTV1NEtEVVR0RWxJL01yajA0b1RjYUlQc1AvdlYiLCJtYWMiOiJhNDkzZDZiOWQ0NDI5YjhlMGZiZDgyNzM1ZjdkY2Q1ZjY1MWQ5ZjRmYTQ2NTMxOTQzYTIyNzkxNDM2YWQ4YjAwIiwidGFnIjoiIn0%3D; XSRF-TOKEN=eyJpdiI6IjhleHhTYkliV1FHcU84T3pyMnlONEE9PSIsInZhbHVlIjoiUmZrWk5TdlRCbWpENGliZENaWVR3d0M1dUhiOThKUFBKdHNjYXUxcjdoQkdzY3JxTWMzbUVFUEUwK2x3SUVNV3d6SUtIWHkremMzeVd4WFJFUW1SRXFYR0ltamVGdkg3QmZmZ2lrdmd2UElGOWxTRzBWUjRET0FCd2VZU0ozVFEiLCJtYWMiOiI5NDFiM2E0YmUyYThhYmVlMDhiMWRlZTJkNWRkMWFlM2FlZjFjYzk4ZjcxZmFmZGYwOTc4ZTVjM2Q3NzljYjU4IiwidGFnIjoiIn0%3D; tinnhiemmang_session=eyJpdiI6ImVlaS9BUEF1N0tVMnQwWnRXWStnSnc9PSIsInZhbHVlIjoiSzNwcU1WT28vRk9hVGxyU0hhYUJWQnNQSHZDeUROTVRFUi9FMCs1bDdSWG8wNDEzc1JDcmZLZVErMUtWK2dJY1ZoMnlQTlNYanZIOW9KME92WmZJL1NEeWdGeVFLU0tqa1JVampKYkZ6dzVPR20wamxzRTV5RzJFNmhPSmIxbUYiLCJtYWMiOiJkNDZlNWZkMGZhODZhY2IyYTc4ODhjZTAzMDc4YzY3OTNhNWQyZTlhYzk3NjlmZDE5MWZlNjBjYzJjOWRkNGI1IiwidGFnIjoiIn0%3D'

MAX_WORKERS = 5  # Safe rate limit for Cloudflare bypass

def fetch_page_domains(page_num):
    url = f"https://tinnhiemmang.vn/filterObj?_token={TOKEN}&name_obj=&type=web&page={page_num}&_={int(time.time() * 1000)}"
    headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
        'cache-control': 'no-cache',
        'referer': 'https://tinnhiemmang.vn/website-tin-nhiem',
        'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36',
        'x-csrf-token': TOKEN,
        'x-requested-with': 'XMLHttpRequest',
        'Cookie': COOKIE
    }
    
    req = Request(url, headers=headers)
    try:
        # Fetch HTML snippet from tinnhiemmang.vn
        with urlopen(req, timeout=20) as response:
            html = response.read().decode('utf-8')
            # Extract domains inside list anchor nodes
            domains = re.findall(r'href="[^"]+danh-ba-tin-nhiem/[^"]+"\s+class="sf-semibold[^"]*">\s*<span>\s*([a-zA-Z0-9.-]+)\s*</span>', html)
            cleaned = []
            for d in domains:
                if not d:
                    continue
                d = d.strip().lower()
                d = d.replace("https://", "").replace("http://", "").replace("www.", "")
                if "tinnhiemmang.vn" in d:
                    continue
                if '.' in d and len(d) > 3:
                    cleaned.append(d)
            return page_num, list(set(cleaned))
    except Exception as e:
        print(f"Error crawling page {page_num}: {e}", file=sys.stderr)
        return page_num, []

def import_scraped_domains_to_mongo():
    print(f"Connecting to MongoDB at {MONGO_URI}...")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
        client.server_info()
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}", file=sys.stderr)
        sys.exit(1)

    print("Starting crawler (pages 1 to 610) with thread pool...")
    start_time = time.time()
    
    scraped_domains = set()
    completed_pages = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all 610 pages
        futures = {executor.submit(fetch_page_domains, page): page for page in range(1, 611)}
        
        for fut in as_completed(futures):
            page_num, domains = fut.result()
            scraped_domains.update(domains)
            completed_pages += 1
            if completed_pages % 20 == 0 or completed_pages == 610:
                print(f"Progress: {completed_pages}/610 pages crawled. Unique domains found so far: {len(scraped_domains):,}")
            
            # Tiny sleep to stay within Cloudflare safety thresholds
            time.sleep(0.05)

    print(f"\nCrawling complete. Found {len(scraped_domains):,} total unique domains in {time.time() - start_time:.2f} seconds.")
    
    if not scraped_domains:
        print("No domains found. Please verify your cookie/token values and try again.", file=sys.stderr)
        sys.exit(1)

    # Insert into database
    print(f"Inserting domains into collection '{COLLECTION_NAME}'...")
    db_start_time = time.time()
    
    batch = []
    total_inserted = 0
    total_duplicates = 0
    batch_size = 5000

    for domain in scraped_domains:
        now = datetime.utcnow()
        batch.append({
            "url": domain,
            "domain": domain,
            "description": "gov-vn",
            "created_at": now,
            "updated_at": now
        })

        if len(batch) >= batch_size:
            try:
                res = collection.insert_many(batch, ordered=False)
                total_inserted += len(res.inserted_ids)
            except BulkWriteError as bwe:
                total_inserted += bwe.details.get('nInserted', 0)
                write_errors = bwe.details.get('writeErrors', [])
                total_duplicates += sum(1 for e in write_errors if e.get('code') == 11000)
            batch = []

    if batch:
        try:
            res = collection.insert_many(batch, ordered=False)
            total_inserted += len(res.inserted_ids)
        except BulkWriteError as bwe:
            total_inserted += bwe.details.get('nInserted', 0)
            write_errors = bwe.details.get('writeErrors', [])
            total_duplicates += sum(1 for e in write_errors if e.get('code') == 11000)

    print(f"\nDone! DB operation completed in {time.time() - db_start_time:.2f} seconds.")
    print(f"Successfully inserted (new): {total_inserted:,}")
    print(f"Duplicates skipped (pre-existing): {total_duplicates:,}")

if __name__ == "__main__":
    import_scraped_domains_to_mongo()
