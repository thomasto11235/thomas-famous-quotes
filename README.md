# Echoes of Wisdom — 100 Famous Quotes Web App

An elegant, responsive web application displaying a curated collection of **100 celebrated quotes** across philosophy, science, art, literature, and life. Built with a **Python Flask** backend, semantic **HTML5/CSS3**, and pure **vanilla JavaScript**.

---

## Features

- 🎲 **Random Quote Generator**: Smooth transitions between inspiring quotes with keyboard shortcut support (<kbd>Space</kbd> or <kbd>R</kbd>).
- 🔍 **Author Search**: Live search with autocomplete datalist suggestions across 62 unique authors.
- 🏷️ **Category Filtering**: Filter across 10 categories (*Wisdom, Inspiration, Courage, Science, Philosophy, Humor, Love, Creativity, Success, Life*) with interactive filter pills.
- 📋 **One-Click Clipboard**: Instant copy with active visual feedback.
- 🔊 **Text-to-Speech**: Listen to quotes read aloud using the native Web Speech API.
- 🌙 **Dark & Light Mode**: Seamless theme switching with system preference detection.
- 📂 **Browse Mode**: Expandable drawer to explore and click through all matching quotes in a responsive card grid.
- ♿ **Accessible**: Semantic `<search>` landmarks, visible labels, and `aria-live` screen-reader announcements.

---

## Project Structure

```text
├── app.py                  # Flask backend API & routes
├── quotes.json             # Curated dataset of 100 quotes
├── requirements.txt        # Python dependencies
├── .gitignore              # Git ignore rules
├── templates/
│   └── index.html          # Semantic HTML5 template
├── static/
│   ├── css/
│   │   └── style.css       # Fluid responsive styles & theme definitions
│   └── js/
│       └── app.js          # Pure vanilla JavaScript client logic
└── tests/
    └── test_app.py         # Pytest test suite (11 unit/integration tests)
```

---

## Getting Started

### Prerequisites

- Python 3.10+ (or [uv](https://github.com/astral-sh/uv))

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/thomas-famous-quotes.git
   cd thomas-famous-quotes
   ```

2. **Create a virtual environment & install dependencies**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   python app.py
   ```
   Open your browser at `http://127.0.0.1:5000`.

### Running Tests

```bash
pytest tests/ -v
```

---

## API Endpoints

| Endpoint | Method | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | Single Page Web App | — |
| `/api/quotes/random` | `GET` | Get a random quote | `category`, `author`, `search`, `exclude_id` |
| `/api/quotes` | `GET` | List matching quotes | `category`, `author`, `search`, `limit`, `offset` |
| `/api/categories` | `GET` | List distinct categories & counts | — |
| `/api/authors` | `GET` | List distinct authors & counts | — |
| `/api/stats` | `GET` | Get total counts overview | — |

---

## License

MIT
