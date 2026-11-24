import json
import os
import pytest
from app import app, QUOTES_FILE

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_quotes_json_structure():
    assert os.path.exists(QUOTES_FILE), "quotes.json file must exist"
    with open(QUOTES_FILE, "r", encoding="utf-8") as f:
        quotes = json.load(f)

    assert len(quotes) == 100, f"Expected exactly 100 quotes, found {len(quotes)}"

    expected_ids = list(range(1, 101))
    actual_ids = [q["id"] for q in quotes]
    assert actual_ids == expected_ids, "Quote IDs must be sequential integers from 1 to 100"

    categories = set()
    authors = set()

    for q in quotes:
        assert isinstance(q["id"], int)
        assert isinstance(q["quote"], str) and len(q["quote"].strip()) > 0
        assert isinstance(q["author"], str) and len(q["author"].strip()) > 0
        assert isinstance(q["category"], str) and len(q["category"].strip()) > 0

        categories.add(q["category"])
        authors.add(q["author"])

    assert len(categories) >= 8, f"Expected diverse categories, got {len(categories)}"
    assert len(authors) >= 40, f"Expected diverse authors, got {len(authors)}"

def test_index_route(client):
    response = client.get("/")
    assert response.status_code == 200
    html = response.data.decode("utf-8")
    assert "Echoes of Wisdom" in html
    assert "category-select" in html
    assert "author-input" in html
    assert "random-quote-btn" in html

def test_random_quote_endpoint(client):
    response = client.get("/api/quotes/random")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "quote" in data
    assert data["quote"]["id"] in range(1, 101)
    assert data["matching_count"] == 100

def test_random_quote_with_category_filter(client):
    response = client.get("/api/quotes/random?category=Science")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["quote"]["category"] == "Science"
    assert data["matching_count"] > 0

def test_random_quote_with_author_filter(client):
    response = client.get("/api/quotes/random?author=Einstein")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "Einstein" in data["quote"]["author"]
    assert data["matching_count"] > 0

def test_random_quote_with_keyword_search(client):
    response = client.get("/api/quotes/random?search=universe")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    text_combined = f"{data['quote']['quote']} {data['quote']['author']} {data['quote']['category']}".lower()
    assert "universe" in text_combined

def test_random_quote_not_found(client):
    response = client.get("/api/quotes/random?author=NonExistentAuthorXYZ987")
    assert response.status_code == 404
    data = response.get_json()
    assert data["success"] is False
    assert data["matching_count"] == 0

def test_get_quotes_list_and_pagination(client):
    response = client.get("/api/quotes?limit=10&offset=0")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["total"] == 100
    assert data["count"] == 10
    assert len(data["quotes"]) == 10

def test_get_categories_endpoint(client):
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    categories = data["categories"]
    assert len(categories) == 10
    total_quotes_in_cats = sum(c["count"] for c in categories)
    assert total_quotes_in_cats == 100

def test_get_authors_endpoint(client):
    response = client.get("/api/authors")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    authors = data["authors"]
    assert len(authors) > 50
    total_quotes_in_authors = sum(a["count"] for a in authors)
    assert total_quotes_in_authors == 100

def test_get_stats_endpoint(client):
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["total_quotes"] == 100
    assert data["total_categories"] == 10
    assert data["total_authors"] > 50
