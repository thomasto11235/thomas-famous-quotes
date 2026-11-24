/**
 * Echoes of Wisdom — Random Quote Web Application
 * Vanilla JavaScript (ES6+)
 */

(() => {
  'use strict';

  // --- State ---
  const state = {
    currentQuote: null,
    filters: {
      author: '',
      category: '',
      keyword: ''
    },
    categories: [],
    authors: [],
    stats: null,
    matchingCount: 100,
    isBrowseOpen: false,
    isSpeaking: false
  };

  // --- DOM Elements ---
  const el = {
    // Header
    statsText: document.getElementById('stats-text'),
    themeToggle: document.getElementById('theme-toggle'),

    // Inputs & Filters
    authorInput: document.getElementById('author-input'),
    authorDatalist: document.getElementById('author-datalist'),
    clearAuthorBtn: document.getElementById('clear-author-btn'),
    categorySelect: document.getElementById('category-select'),
    categoryChips: document.getElementById('category-chips'),
    keywordInput: document.getElementById('keyword-input'),
    clearKeywordBtn: document.getElementById('clear-keyword-btn'),
    filterCountInfo: document.getElementById('filter-count-info'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),

    // Hero Quote Card
    quoteCard: document.getElementById('quote-card'),
    quoteNumber: document.getElementById('quote-number'),
    quoteCategory: document.getElementById('quote-category'),
    quoteText: document.getElementById('quote-text'),
    quoteAuthor: document.getElementById('quote-author'),
    quoteContext: document.getElementById('quote-context'),
    authorAvatar: document.getElementById('author-avatar'),

    // Quote Actions
    randomQuoteBtn: document.getElementById('random-quote-btn'),
    randomBtnLabel: document.getElementById('random-btn-label'),
    speakBtn: document.getElementById('speak-btn'),
    copyBtn: document.getElementById('copy-btn'),
    copyText: document.getElementById('copy-text'),
    copyIcon: document.querySelector('.copy-icon'),
    checkIcon: document.querySelector('.check-icon'),
    shareBtn: document.getElementById('share-btn'),

    // Browse Section
    toggleBrowseBtn: document.getElementById('toggle-browse-btn'),
    browseToggleLabel: document.getElementById('browse-toggle-label'),
    browseContainer: document.getElementById('browse-grid-container'),
    browseGrid: document.getElementById('browse-grid')
  };

  // --- Theme Management ---
  function initTheme() {
    const savedTheme = localStorage.getItem('quote_theme') || 'system';
    document.documentElement.setAttribute('data-theme', savedTheme);

    el.themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      let nextTheme = 'light';
      if (current === 'light') nextTheme = 'dark';
      else if (current === 'dark') nextTheme = 'system';
      else nextTheme = 'light';

      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('quote_theme', nextTheme);
    });
  }

  // --- API Helpers ---
  async function fetchJSON(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          const errData = await res.json().catch(() => ({}));
          return { error: errData.error || 'Not found', status: 404 };
        }
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error('Fetch failed for:', url, err);
      return { error: err.message };
    }
  }

  // --- Data Initialization ---
  async function initData() {
    // 1. Fetch Stats
    const statsData = await fetchJSON('/api/stats');
    if (statsData && statsData.success) {
      state.stats = statsData;
      el.statsText.textContent = `${statsData.total_quotes} Quotes • ${statsData.total_categories} Categories • ${statsData.total_authors} Authors`;
    }

    // 2. Fetch Categories
    const catData = await fetchJSON('/api/categories');
    if (catData && catData.success) {
      state.categories = catData.categories;
      populateCategories(catData.categories);
    }

    // 3. Fetch Authors
    const authorData = await fetchJSON('/api/authors');
    if (authorData && authorData.success) {
      state.authors = authorData.authors;
      populateAuthors(authorData.authors);
    }

    // 4. Load Initial Random Quote
    await getRandomQuote();
  }

  function populateCategories(categories) {
    // Select options
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = `${cat.name} (${cat.count})`;
      el.categorySelect.appendChild(opt);
    });

    // Quick chips
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.dataset.category = cat.name;
      btn.textContent = cat.name;
      btn.addEventListener('click', () => {
        selectCategory(cat.name);
      });
      el.categoryChips.appendChild(btn);
    });
  }

  function populateAuthors(authors) {
    el.authorDatalist.innerHTML = '';
    authors.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.name;
      el.authorDatalist.appendChild(opt);
    });
  }

  // --- Random Quote Generation ---
  async function getRandomQuote() {
    el.randomQuoteBtn.classList.add('spinning');
    el.randomBtnLabel.textContent = 'Seeking Wisdom...';

    const params = new URLSearchParams();
    if (state.filters.category) params.set('category', state.filters.category);
    if (state.filters.author) params.set('author', state.filters.author);
    if (state.filters.keyword) params.set('search', state.filters.keyword);
    if (state.currentQuote && state.currentQuote.id) {
      params.set('exclude_id', state.currentQuote.id);
    }

    const data = await fetchJSON(`/api/quotes/random?${params.toString()}`);

    setTimeout(() => {
      el.randomQuoteBtn.classList.remove('spinning');
      el.randomBtnLabel.textContent = 'New Random Quote';
    }, 400);

    if (data && data.success && data.quote) {
      state.currentQuote = data.quote;
      state.matchingCount = data.matching_count;
      displayQuote(data.quote);
      updateFilterStatus();
    } else {
      displayNoQuoteFound();
      updateFilterStatus(0);
    }

    // If browse section is open, refresh it as well
    if (state.isBrowseOpen) {
      loadBrowseQuotes();
    }
  }

  function displayQuote(quote) {
    // Fade out
    el.quoteText.classList.add('fade-out');

    setTimeout(() => {
      el.quoteNumber.textContent = `Quote #${quote.id} of 100`;
      el.quoteCategory.textContent = quote.category;
      el.quoteText.textContent = quote.quote;
      el.quoteAuthor.textContent = quote.author;
      el.quoteContext.textContent = `${quote.category} Perspective`;

      // Avatar initials
      const initials = quote.author
        .split(' ')
        .filter(n => n.length > 0)
        .map(n => n[0].toUpperCase())
        .slice(0, 2)
        .join('');
      el.authorAvatar.textContent = initials || 'Q';

      // Fade in
      el.quoteText.classList.remove('fade-out');
      el.quoteText.classList.add('fade-in');

      setTimeout(() => {
        el.quoteText.classList.remove('fade-in');
      }, 300);
    }, 180);
  }

  function displayNoQuoteFound() {
    el.quoteNumber.textContent = 'Quote #—';
    el.quoteCategory.textContent = 'No Matches';
    el.quoteText.textContent = 'No quotes found matching your current search or category filters. Try resetting filters!';
    el.quoteAuthor.textContent = '—';
    el.quoteContext.textContent = 'Please adjust filters';
    el.authorAvatar.textContent = '?';
  }

  // --- Filtering & Search ---
  function selectCategory(categoryName) {
    state.filters.category = categoryName;
    el.categorySelect.value = categoryName;

    // Update chips active state
    const chips = el.categoryChips.querySelectorAll('.chip');
    chips.forEach(chip => {
      if (chip.dataset.category === categoryName) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    onFilterChanged();
  }

  function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  const debouncedFilter = debounce(() => {
    onFilterChanged();
  }, 280);

  async function onFilterChanged() {
    checkClearButtons();
    await getRandomQuote();
  }

  function checkClearButtons() {
    el.clearAuthorBtn.classList.toggle('hidden', !state.filters.author);
    el.clearKeywordBtn.classList.toggle('hidden', !state.filters.keyword);

    const hasAnyFilter = Boolean(state.filters.author || state.filters.category || state.filters.keyword);
    el.resetFiltersBtn.classList.toggle('hidden', !hasAnyFilter);
  }

  function updateFilterStatus(overrideCount) {
    const count = overrideCount !== undefined ? overrideCount : state.matchingCount;
    const hasAnyFilter = Boolean(state.filters.author || state.filters.category || state.filters.keyword);

    if (!hasAnyFilter) {
      el.filterCountInfo.textContent = `Showing random from all 100 quotes`;
    } else {
      const parts = [];
      if (state.filters.category) parts.push(`Category: "${state.filters.category}"`);
      if (state.filters.author) parts.push(`Author: "${state.filters.author}"`);
      if (state.filters.keyword) parts.push(`Keyword: "${state.filters.keyword}"`);

      el.filterCountInfo.textContent = `${count} ${count === 1 ? 'quote' : 'quotes'} found matching ${parts.join(', ')}`;
    }

    el.browseToggleLabel.textContent = `Browse All Matching Quotes (${count})`;
  }

  function resetAllFilters() {
    state.filters.author = '';
    state.filters.category = '';
    state.filters.keyword = '';

    el.authorInput.value = '';
    el.categorySelect.value = '';
    el.keywordInput.value = '';

    const chips = el.categoryChips.querySelectorAll('.chip');
    chips.forEach(c => c.classList.toggle('active', c.dataset.category === ''));

    checkClearButtons();
    getRandomQuote();
  }

  // --- Browse All Matching Quotes ---
  async function loadBrowseQuotes() {
    const params = new URLSearchParams();
    if (state.filters.category) params.set('category', state.filters.category);
    if (state.filters.author) params.set('author', state.filters.author);
    if (state.filters.keyword) params.set('search', state.filters.keyword);

    el.browseGrid.innerHTML = '<p style="padding:1rem;color:var(--text-muted);">Loading quotes...</p>';

    const data = await fetchJSON(`/api/quotes?${params.toString()}`);
    if (data && data.success && data.quotes && data.quotes.length > 0) {
      el.browseGrid.innerHTML = '';
      data.quotes.forEach(q => {
        const item = document.createElement('div');
        item.className = 'mini-quote-card';
        if (state.currentQuote && state.currentQuote.id === q.id) {
          item.classList.add('active');
        }
        item.innerHTML = `
          <p class="mini-quote-text">"${escapeHTML(q.quote)}"</p>
          <div class="mini-quote-footer">
            <span class="mini-quote-author">${escapeHTML(q.author)}</span>
            <span class="mini-quote-tag">${escapeHTML(q.category)}</span>
          </div>
        `;
        item.addEventListener('click', () => {
          state.currentQuote = q;
          displayQuote(q);
          // Highlight active mini card
          el.browseGrid.querySelectorAll('.mini-quote-card').forEach(c => c.classList.remove('active'));
          item.classList.add('active');
          // Scroll up to quote card smoothly
          el.quoteCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        el.browseGrid.appendChild(item);
      });
    } else {
      el.browseGrid.innerHTML = '<p style="padding:1rem;color:var(--text-muted);">No matching quotes found.</p>';
    }
  }

  function toggleBrowse() {
    state.isBrowseOpen = !state.isBrowseOpen;
    el.toggleBrowseBtn.setAttribute('aria-expanded', String(state.isBrowseOpen));
    el.browseContainer.classList.toggle('hidden', !state.isBrowseOpen);

    if (state.isBrowseOpen) {
      loadBrowseQuotes();
    }
  }

  // --- Quote Actions ---
  async function copyQuoteToClipboard() {
    if (!state.currentQuote) return;
    const textToCopy = `"${state.currentQuote.quote}" — ${state.currentQuote.author}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      // Visual feedback
      el.copyBtn.classList.add('copied');
      el.copyIcon.classList.add('hidden');
      el.checkIcon.classList.remove('hidden');
      el.copyText.textContent = 'Copied!';

      setTimeout(() => {
        el.copyBtn.classList.remove('copied');
        el.copyIcon.classList.remove('hidden');
        el.checkIcon.classList.add('hidden');
        el.copyText.textContent = 'Copy';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }

  function shareQuote() {
    if (!state.currentQuote) return;
    const text = encodeURIComponent(`"${state.currentQuote.quote}" — ${state.currentQuote.author}`);
    const url = `https://twitter.com/intent/tweet?text=${text}&hashtags=Quotes,Wisdom,Inspiration`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function speakQuote() {
    if (!('speechSynthesis' in window) || !state.currentQuote) return;

    if (state.isSpeaking) {
      window.speechSynthesis.cancel();
      state.isSpeaking = false;
      el.speakBtn.classList.remove('copied');
      el.speakBtn.querySelector('.btn-text').textContent = 'Listen';
      return;
    }

    window.speechSynthesis.cancel(); // clear previous
    const utterance = new SpeechSynthesisUtterance(
      `${state.currentQuote.quote}. By ${state.currentQuote.author}.`
    );
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      state.isSpeaking = true;
      el.speakBtn.classList.add('copied');
      el.speakBtn.querySelector('.btn-text').textContent = 'Stop';
    };

    utterance.onend = utterance.onerror = () => {
      state.isSpeaking = false;
      el.speakBtn.classList.remove('copied');
      el.speakBtn.querySelector('.btn-text').textContent = 'Listen';
    };

    window.speechSynthesis.speak(utterance);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // 1. Random Quote Button
    el.randomQuoteBtn.addEventListener('click', getRandomQuote);

    // 2. Author Input
    el.authorInput.addEventListener('input', (e) => {
      state.filters.author = e.target.value.trim();
      debouncedFilter();
    });

    el.clearAuthorBtn.addEventListener('click', () => {
      el.authorInput.value = '';
      state.filters.author = '';
      onFilterChanged();
    });

    // 3. Category Select
    el.categorySelect.addEventListener('change', (e) => {
      selectCategory(e.target.value);
    });

    // Quick chips "All" button
    const allChip = el.categoryChips.querySelector('.chip[data-category=""]');
    if (allChip) {
      allChip.addEventListener('click', () => selectCategory(''));
    }

    // 4. Keyword Input
    el.keywordInput.addEventListener('input', (e) => {
      state.filters.keyword = e.target.value.trim();
      debouncedFilter();
    });

    el.clearKeywordBtn.addEventListener('click', () => {
      el.keywordInput.value = '';
      state.filters.keyword = '';
      onFilterChanged();
    });

    // 5. Reset Filters
    el.resetFiltersBtn.addEventListener('click', resetAllFilters);

    // 6. Action buttons
    el.copyBtn.addEventListener('click', copyQuoteToClipboard);
    el.shareBtn.addEventListener('click', shareQuote);
    el.speakBtn.addEventListener('click', speakQuote);

    // 7. Browse toggle
    el.toggleBrowseBtn.addEventListener('click', toggleBrowse);

    // 8. Keyboard navigation: Space or R rolls random quote
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (['input', 'select', 'textarea'].includes(activeTag)) return;

      if (e.code === 'Space' || e.key === 'r' || e.key === 'R') {
        if (e.code === 'Space') e.preventDefault(); // prevent page scroll
        getRandomQuote();
      }
    });
  }

  // --- Bootstrap ---
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    initData();
  });
})();
