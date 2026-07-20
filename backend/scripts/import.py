import os
import csv
import sys
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from pymongo import MongoClient
from pymongo.errors import BulkWriteError

# Performance configuration
BATCH_SIZE = 15000  # Sub-batches to fit Mongo payload limit
MAX_WORKERS = 8     # Concurrent WAN upload threads

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

def import_csv_to_mongo(csv_path):
    # MongoDB settings from env or defaults (Atlas URI provided by user)
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

    print(f"Preparing to process CSV file: {csv_path}...")
    if not os.path.exists(csv_path):
        print(f"Error: File {csv_path} does not exist.", file=sys.stderr)
        sys.exit(1)

    start_time = time.time()
    total_processed = 0
    total_inserted = 0
    total_duplicates = 0

    print(f"Running high-speed import with {MAX_WORKERS} parallel threads...")
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = []
        current_batch = []

        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)

            # Simple header check
            first_row = next(reader, None)
            if first_row:
                if len(first_row) > 0 and not first_row[0].isdigit() and '.' not in first_row[0]:
                    print(f"Skipping CSV header row: {first_row}")
                else:
                    domain = first_row[1].strip().lower() if len(first_row) > 1 else ""
                    if domain and '.' in domain:
                        now = datetime.utcnow()
                        current_batch.append({
                            "url": domain,
                            "domain": domain,
                            "description": "tranco-list.eu",
                            "created_at": now,
                            "updated_at": now
                        })

            for row in reader:
                if not row or len(row) < 2:
                    continue

                domain = row[1].strip().lower()
                if not domain or '.' not in domain:
                    continue

                now = datetime.utcnow()
                current_batch.append({
                    "url": domain,
                    "domain": domain,
                    "description": "tranco-list.eu",
                    "created_at": now,
                    "updated_at": now
                })

                if len(current_batch) >= BATCH_SIZE:
                    batch_to_submit = current_batch
                    current_batch = []
                    
                    futures.append(executor.submit(insert_batch, collection, batch_to_submit))
                    total_processed += len(batch_to_submit)

                    # Bounded queue to prevent memory blowup with 1M rows
                    if len(futures) >= MAX_WORKERS * 2:
                        for fut in futures[:MAX_WORKERS]:
                            ins, dups = fut.result()
                            total_inserted += ins
                            total_duplicates += dups
                        futures = futures[MAX_WORKERS:]
                        
                        elapsed = time.time() - start_time
                        speed = total_processed / elapsed if elapsed > 0 else 0
                        print(f"Processed: {total_processed:,} | Inserted: {total_inserted:,} | Dups skipped: {total_duplicates:,} | Speed: {speed:.1f} doc/sec")

            # Submit final batch
            if current_batch:
                futures.append(executor.submit(insert_batch, collection, current_batch))
                total_processed += len(current_batch)

        # Wait for remaining tasks to complete
        for fut in futures:
            ins, dups = fut.result()
            total_inserted += ins
            total_duplicates += dups

    total_time = time.time() - start_time
    final_speed = total_processed / total_time if total_time > 0 else 0
    print(f"\nDone! Completed in {total_time:.2f} seconds!")
    print(f"Total processed in CSV: {total_processed:,}")
    print(f"Successfully inserted: {total_inserted:,}")
    print(f"Duplicates skipped: {total_duplicates:,}")
    print(f"Average throughput: {final_speed:.1f} doc/sec")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import.py <path_to_csv_file>")
        sys.exit(1)

    import_csv_to_mongo(sys.argv[1])
