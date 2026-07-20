import os
import json
import sys
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from pymongo import MongoClient
from pymongo.errors import BulkWriteError

# Performance configuration
BATCH_SIZE = 10000  # Sub-batches to optimize network payload
MAX_WORKERS = 4     # Number of concurrent insertion threads

def insert_batch(collection, batch):
    try:
        res = collection.insert_many(batch, ordered=False)
        return len(res.inserted_ids), 0
    except BulkWriteError as bwe:
        inserted = bwe.details.get('nInserted', 0)
        write_errors = bwe.details.get('writeErrors', [])
        # Code 11000 is Duplicate Key Error in MongoDB (unique index constraint)
        dup_count = sum(1 for e in write_errors if e.get('code') == 11000)
        return inserted, dup_count
    except Exception as e:
        print(f"\nError in batch insert: {e}", file=sys.stderr)
        return 0, 0

def import_json_to_mongo(json_path):
    # MongoDB settings from env or defaults (matching user's blocklist configuration)
    mongo_uri = os.environ.get("MONGO_URI", "mongodb+srv://vkhai2k5_db_user:16UKwC39liXlh1Gi@payment.oc6hemx.mongodb.net/")
    db_name = os.environ.get("MONGO_DB", "blocklist")
    collection_name = "whitelist"

    print(f"Connecting to MongoDB at {mongo_uri}...")
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=10000)
        client.server_info()  # Connection check
        db = client[db_name]
        collection = db[collection_name]
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Reading JSON file: {json_path}...")
    if not os.path.exists(json_path):
        print(f"Error: File {json_path} does not exist.", file=sys.stderr)
        sys.exit(1)

    # Load JSON file
    try:
        with open(json_path, mode='r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error parsing JSON file: {e}", file=sys.stderr)
        sys.exit(1)

    # Extract items array
    items = []
    if isinstance(data, dict):
        # Handle { "data": { "items": [...] } }
        inner_data = data.get("data", {})
        if isinstance(inner_data, dict):
            items = inner_data.get("items", [])
        else:
            # Handle { "items": [...] }
            items = data.get("items", [])
    elif isinstance(data, list):
        items = data

    if not isinstance(items, list) or len(items) == 0:
        print("Error: No items found in the JSON file matching key 'data.items' or list root format.", file=sys.stderr)
        sys.exit(1)

    print(f"Successfully loaded {len(items):,} items from JSON. Starting parallel import...")

    start_time = time.time()
    total_processed = 0
    total_inserted = 0
    total_duplicates = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = []
        current_batch = []

        for item in items:
            if not isinstance(item, dict):
                continue
            
            domain = item.get("domain")
            if not domain or not isinstance(domain, str):
                continue
            
            domain = domain.strip().lower()
            if not domain or '.' not in domain:
                continue

            now = datetime.utcnow()
            current_batch.append({
                "url": domain,
                "domain": domain,
                "description": "gov-vn",
                "created_at": now,
                "updated_at": now
            })

            if len(current_batch) >= BATCH_SIZE:
                batch_to_submit = current_batch
                current_batch = []
                
                futures.append(executor.submit(insert_batch, collection, batch_to_submit))
                total_processed += len(batch_to_submit)

                # Keep queue bounded
                if len(futures) >= MAX_WORKERS * 2:
                    for fut in futures[:MAX_WORKERS]:
                        ins, dups = fut.result()
                        total_inserted += ins
                        total_duplicates += dups
                    futures = futures[MAX_WORKERS:]
                    
                    elapsed = time.time() - start_time
                    speed = total_processed / elapsed if elapsed > 0 else 0
                    print(f"Processed: {total_processed:,} | Inserted: {total_inserted:,} | Duplicates skipped: {total_duplicates:,} | Speed: {speed:.1f} doc/sec")

        # Submit remaining batch
        if current_batch:
            futures.append(executor.submit(insert_batch, collection, current_batch))
            total_processed += len(current_batch)

        # Gather remaining futures
        for fut in futures:
            ins, dups = fut.result()
            total_inserted += ins
            total_duplicates += dups

    total_time = time.time() - start_time
    final_speed = total_processed / total_time if total_time > 0 else 0
    print(f"\nDone! Completed in {total_time:.2f} seconds!")
    print(f"Total processed in JSON: {total_processed:,}")
    print(f"Successfully inserted (new): {total_inserted:,}")
    print(f"Duplicates skipped (pre-existing): {total_duplicates:,}")
    print(f"Average throughput: {final_speed:.1f} doc/sec")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_json.py <path_to_json_file>")
        sys.exit(1)

    import_json_to_mongo(sys.argv[1])
