import json
import os
import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Load quotes from JSON file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QUOTES_FILE = os.path.join(BASE_DIR, "quotes.json")

def get_all_quotes():
    with open(QUOTES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

ALL_QUOTES = get_all_quotes()

def filter_quotes(quotes, category=None, author=None, search=None):
    results = quotes
    if category and category.strip():
        cat_lower = category.strip().lower()
        results = [q for q in results if q["category"].lower() == cat_lower]

    if author and author.strip():
        author_lower = author.strip().lower()
        results = [q for q in results if author_lower in q["author"].lower()]

    if search and search.strip():
        search_lower = search.strip().lower()
        results = [
            q for q in results
            if search_lower in q["quote"].lower()
            or search_lower in q["author"].lower()
            or search_lower in q["category"].lower()
        ]

    return results

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/quotes/random", methods=["GET"])
def get_random_quote():
    category = request.args.get("category")
    author = request.args.get("author")
    search = request.args.get("search")
    exclude_id = request.args.get("exclude_id", type=int)

    filtered = filter_quotes(ALL_QUOTES, category=category, author=author, search=search)

    if not filtered:
        return jsonify({
            "success": False,
            "error": "No quotes found matching the specified criteria.",
            "matching_count": 0
        }), 404

    # Pick a random quote; avoid returning the same quote if multiple matches exist
    pool = [q for q in filtered if q["id"] != exclude_id] if (len(filtered) > 1 and exclude_id) else filtered
    selected = random.choice(pool)

    return jsonify({
        "success": True,
        "quote": selected,
        "matching_count": len(filtered)
    })

@app.route("/api/quotes", methods=["GET"])
def get_quotes():
    category = request.args.get("category")
    author = request.args.get("author")
    search = request.args.get("search")
    limit = request.args.get("limit", default=None, type=int)
    offset = request.args.get("offset", default=0, type=int)

    filtered = filter_quotes(ALL_QUOTES, category=category, author=author, search=search)

    paginated = filtered[offset:offset + limit] if limit is not None else filtered[offset:]

    return jsonify({
        "success": True,
        "total": len(filtered),
        "count": len(paginated),
        "offset": offset,
        "quotes": paginated
    })

@app.route("/api/categories", methods=["GET"])
def get_categories():
    categories_dict = {}
    for q in ALL_QUOTES:
        cat = q["category"]
        categories_dict[cat] = categories_dict.get(cat, 0) + 1

    sorted_categories = sorted(
        [{"name": k, "count": v} for k, v in categories_dict.items()],
        key=lambda x: x["name"]
    )
    return jsonify({
        "success": True,
        "categories": sorted_categories
    })

@app.route("/api/authors", methods=["GET"])
def get_authors():
    authors_dict = {}
    for q in ALL_QUOTES:
        author = q["author"]
        authors_dict[author] = authors_dict.get(author, 0) + 1

    sorted_authors = sorted(
        [{"name": k, "count": v} for k, v in authors_dict.items()],
        key=lambda x: x["name"]
    )
    return jsonify({
        "success": True,
        "authors": sorted_authors
    })

@app.route("/api/stats", methods=["GET"])
def get_stats():
    categories = {q["category"] for q in ALL_QUOTES}
    authors = {q["author"] for q in ALL_QUOTES}
    return jsonify({
        "success": True,
        "total_quotes": len(ALL_QUOTES),
        "total_categories": len(categories),
        "total_authors": len(authors)
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
