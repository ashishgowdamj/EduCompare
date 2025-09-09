#!/usr/bin/env python3
"""
Generic CSV/JSON importer for colleges → FastAPI bulk endpoint.

Examples:
  # From CSV file with headers Name,City,State,Website,Courses
  python backend/scripts/import_colleges.py \
    --file data.csv \
    --name-col Name --city-col City --state-col State \
    --website-col Website --courses-col Courses

  # From a published Google Sheet CSV URL
  python backend/scripts/import_colleges.py \
    --url "https://docs.google.com/spreadsheets/d/.../pub?gid=0&single=true&output=csv" \
    --name-col College --city-col City --state-col State

  # From JSON file with {"colleges": [...]}
  python backend/scripts/import_colleges.py --file backend/data/colleges_india_min.json
"""
import argparse
import csv
import io
import json
import sys
from typing import Dict, Any, List
from urllib import request


def fetch_bytes(url: str) -> bytes:
    with request.urlopen(url) as resp:
        return resp.read()


def load_input(args) -> Dict[str, Any]:
    if args.file:
        with open(args.file, 'rb') as f:
            raw = f.read()
    elif args.url:
        raw = fetch_bytes(args.url)
    else:
        raise SystemExit("Provide --file or --url")

    # Try JSON first
    try:
        data = json.loads(raw)
        if isinstance(data, dict) and 'colleges' in data:
            return data
        elif isinstance(data, list):
            return {"colleges": data}
    except Exception:
        pass

    # Fallback: treat as CSV
    text = raw.decode('utf-8', errors='replace')
    reader = csv.DictReader(io.StringIO(text), delimiter=args.delimiter)
    out: List[Dict[str, Any]] = []
    for row in reader:
        item: Dict[str, Any] = {}
        def g(col):
            return row.get(col) if col else None

        item['name'] = (g(args.name_col) or '').strip()
        item['city'] = (g(args.city_col) or '').strip()
        item['state'] = (g(args.state_col) or '').strip()
        if args.website_col:
            item['website'] = (g(args.website_col) or '').strip()
        if args.university_type_col:
            item['university_type'] = (g(args.university_type_col) or '').strip()
        if args.courses_col:
            raw_courses = (g(args.courses_col) or '').strip()
            if raw_courses:
                # split by comma or semicolon
                parts = [c.strip() for c in raw_courses.replace(';', ',').split(',') if c.strip()]
                if parts:
                    item['courses_offered'] = parts
        if not item['name'] or not item['city'] or not item['state']:
            continue
        out.append(item)
    return {"colleges": out}


def post_bulk(data: Dict[str, Any], backend: str) -> Dict[str, Any]:
    url = backend.rstrip('/') + '/api/colleges/bulk'
    payload = json.dumps(data).encode('utf-8')
    req = request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    try:
        with request.urlopen(req) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"Bulk import failed: {e}", file=sys.stderr)
        raise


def main():
    ap = argparse.ArgumentParser()
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument('--file', help='Path to CSV or JSON file')
    src.add_argument('--url', help='URL to CSV or JSON')
    ap.add_argument('--backend', default='http://localhost:8000', help='Backend base URL')
    ap.add_argument('--delimiter', default=',', help='CSV delimiter (default ,)')
    # CSV column mappings
    ap.add_argument('--name-col', default='name')
    ap.add_argument('--city-col', default='city')
    ap.add_argument('--state-col', default='state')
    ap.add_argument('--website-col', default=None)
    ap.add_argument('--university-type-col', default=None)
    ap.add_argument('--courses-col', default=None)
    args = ap.parse_args()

    data = load_input(args)
    if not data.get('colleges'):
        print('No colleges found in input.', file=sys.stderr)
        sys.exit(2)
    res = post_bulk(data, args.backend)
    print(json.dumps(res, indent=2))


if __name__ == '__main__':
    main()

