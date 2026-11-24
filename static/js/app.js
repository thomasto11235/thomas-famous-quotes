/**
 * Echoes of Wisdom — Random Quote Web Application
 * Vanilla JavaScript (ES6+) with Advanced UX Enhancements
 */

(() => {
  'use strict';

  // --- Theme Variables Definition (CSS Root Variables) ---
  const themeVariables = {
    light: {
      '--bg-gradient': 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 50%, #e2e8f0 100%)',
      '--bg-surface': '#ffffff',
      '--bg-surface-elevated': '#ffffff',
      '--bg-subtle': '#f1f5f9',
      '--bg-input': '#ffffff',
      '--border-color': '#e2e8f0',
      '--border-focus': '#3b82f6',
      '--text-primary': '#0f172a',
      '--text-secondary': '#475569',
      '--text-muted': '#64748b',
      '--text-inverse': '#ffffff',
      '--accent-primary': '#3b82f6',
      '--accent-primary-hover': '#2563eb',
      '--accent-gradient': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      '--accent-glow': 'rgba(59, 130, 246, 0.25)',
      '--category-bg': '#eff6ff',
      '--category-text': '#1d4ed8',
      '--category-border': '#bfdbfe',
      '--card-shadow': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
      '--card-hover-shadow': '0 20px 35px -5px rgba(15, 23, 42, 0.12), 0 10px 15px -6px rgba(15, 23, 42, 0.06)'
    },
    dark: {
      '--bg-gradient': 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #172136 100%)',
      '--bg-surface': '#131d31',
      '--bg-surface-elevated': '#1a2640',
      '--bg-subtle': '#1e293b',
      '--bg-input': '#1e293b',
      '--border-color': '#2e3d5b',
      '--border-focus': '#60a5fa',
      '--text-primary': '#f8fafc',
      '--text-secondary': '#cbd5e1',
      '--text-muted': '#94a3b8',
      '--text-inverse': '#0f172a',
      '--accent-primary': '#60a5fa',
      '--accent-primary-hover': '#3b82f6',
      '--accent-gradient': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      '--accent-glow': 'rgba(96, 165, 250, 0.25)',
      '--category-bg': '#1e2e4e',
      '--category-text': '#93c5fd',
      '--category-border': '#2d4677',
      '--card-shadow': '0 12px 30px -5px rgba(0, 0, 0, 0.45)',
      '--card-hover-shadow': '0 22px 40px -5px rgba(0, 0, 0, 0.6)'
    }
  };

  // --- State ---
  const state = {
    currentQuote: null,
    history: [],         // Array of quotes viewed in this session
    historyIndex: -1,    // Pointer to current quote in history
    favorites: new Set(),// Set of quote IDs saved as favorites
    isFavoritesOnly: false,
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
    themeToggleSwitch: document.getElementById('theme-toggle-switch'),
    openShortcutsBtn: document.getElementById('open-shortcuts-btn'),
    shortcutsModal: document.getElementById('shortcuts-modal'),
    closeShortcutsBtn: document.getElementById('close-shortcuts-btn'),
    dialogGotItBtn: document.getElementById('dialog-got-it-btn'),

    // Inputs & Filters
    authorInput: document.getElementById('author-input'),
    authorDatalist: document.getElementById('author-datalist'),
    clearAuthorBtn: document.getElementById('clear-author-btn'),
    categorySelect: document.getElementById('category-select'),
    categoryChips: document.getElementById('category-chips'),
    favoritesChip: document.getElementById('favorites-chip'),
    favCountBadge: document.getElementById('fav-count-badge'),
    keywordInput: document.getElementById('keyword-input'),
    clearKeywordBtn: document.getElementById('clear-keyword-btn'),
    filterCountInfo: document.getElementById('filter-count-info'),
    exportCsvBtn: document.getElementById('export-csv-btn'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),

    // Hero Quote Card
    quoteCard: document.getElementById('quote-card'),
    quoteNumber: document.getElementById('quote-number'),
    quoteCategory: document.getElementById('quote-category'),
    quoteText: document.getElementById('quote-text'),
    quoteAuthor: document.getElementById('quote-author'),
    quoteContext: document.getElementById('quote-context'),
    authorAvatar: document.getElementById('author-avatar'),
    authorAvatarBtn: document.getElementById('author-avatar-btn'),
    authorNameBtn: document.getElementById('author-name-btn'),

    // Quote Actions
    prevQuoteBtn: document.getElementById('prev-quote-btn'),
    randomQuoteBtn: document.getElementById('random-quote-btn'),
    randomBtnLabel: document.getElementById('random-btn-label'),
    favoriteBtn: document.getElementById('favorite-btn'),
    favoriteText: document.getElementById('favorite-text'),
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

  // --- Theme Management: Override CSS Root Variables ---
  function applyTheme(themeMode) {
    const isDark = (themeMode === 'dark');
    const targetVars = isDark ? themeVariables.dark : themeVariables.light;
    const rootStyle = document.documentElement.style;

    for (const [property, value] of Object.entries(targetVars)) {
      rootStyle.setProperty(property, value);
    }

    document.documentElement.setAttribute('data-theme', themeMode);

    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    if (metaColorScheme) {
      metaColorScheme.setAttribute('content', themeMode);
    }

    localStorage.setItem('quote_theme', themeMode);

    if (el.themeToggleSwitch) {
      el.themeToggleSwitch.checked = isDark;
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('quote_theme');
    let effectiveTheme = 'light';

    if (savedTheme === 'dark' || savedTheme === 'light') {
      effectiveTheme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      effectiveTheme = 'dark';
    }

    applyTheme(effectiveTheme);

    if (el.themeToggleSwitch) {
      el.themeToggleSwitch.addEventListener('change', (e) => {
        applyTheme(e.target.checked ? 'dark' : 'light');
      });
    }

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('quote_theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  // --- Favorites Management (Local Storage) ---
  function loadFavorites() {
    try {
      const stored = localStorage.getItem('quote_favorites');
      if (stored) {
        state.favorites = new Set(JSON.parse(stored));
      }
    } catch (e) {
      state.favorites = new Set();
    }
    updateFavoritesBadge();
  }

  function saveFavorites() {
    try {
      localStorage.setItem('quote_favorites', JSON.stringify(Array.from(state.favorites)));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
    updateFavoritesBadge();
  }

  function updateFavoritesBadge() {
    if (el.favCountBadge) {
      el.favCountBadge.textContent = `(${state.favorites.size})`;
    }
  }

  function toggleCurrentFavorite() {
    if (!state.currentQuote) return;
    const qid = state.currentQuote.id;
    if (state.favorites.has(qid)) {
      state.favorites.delete(qid);
    } else {
      state.favorites.add(qid);
    }
    saveFavorites();
    updateFavoriteButtonUI();

    if (state.isFavoritesOnly) {
      onFilterChanged();
    }
  }

  function updateFavoriteButtonUI() {
    if (!state.currentQuote || !el.favoriteBtn) return;
    const isFav = state.favorites.has(state.currentQuote.id);
    el.favoriteBtn.classList.toggle('favorited', isFav);
    el.favoriteText.textContent = isFav ? 'Favorited' : 'Favorite';
    el.favoriteBtn.title = isFav ? 'Remove from favorites (F)' : 'Save to favorites (F)';
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
    loadFavorites();

    const statsData = await fetchJSON('/api/stats');
    if (statsData && statsData.success) {
      state.stats = statsData;
      el.statsText.textContent = `${statsData.total_quotes} Quotes • ${statsData.total_categories} Categories • ${statsData.total_authors} Authors`;
    }

    const catData = await fetchJSON('/api/categories');
    if (catData && catData.success) {
      state.categories = catData.categories;
      populateCategories(catData.categories);
    }

    const authorData = await fetchJSON('/api/authors');
    if (authorData && authorData.success) {
      state.authors = authorData.authors;
      populateAuthors(authorData.authors);
    }

    await getRandomQuote();
  }

  function populateCategories(categories) {
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = `${cat.name} (${cat.count})`;
      el.categorySelect.appendChild(opt);
    });

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

  // --- Quote History Navigation (Previous / Next) ---
  function updateNavButtons() {
    if (el.prevQuoteBtn) {
      el.prevQuoteBtn.disabled = (state.historyIndex <= 0);
    }
  }

  function goPrevQuote() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      const prevQuote = state.history[state.historyIndex];
      state.currentQuote = prevQuote;
      displayQuote(prevQuote);
      updateNavButtons();
      updateFavoriteButtonUI();
    }
  }

  // --- Random Quote Generation ---
  async function getRandomQuote() {
    el.randomQuoteBtn.classList.add('spinning');
    el.randomBtnLabel.textContent = 'Seeking Wisdom...';

    // If favorites mode is on
    if (state.isFavoritesOnly) {
      setTimeout(() => {
        el.randomQuoteBtn.classList.remove('spinning');
        updateRandomButtonLabel();
      }, 350);

      const favArray = Array.from(state.favorites);
      if (favArray.length === 0) {
        displayNoQuoteFound('No favorites saved yet! Click the heart on any quote to add it to your favorites.');
        updateFilterStatus(0);
        return;
      }

      // Fetch all quotes to filter favorites
      const allData = await fetchJSON('/api/quotes');
      if (allData && allData.quotes) {
        const favQuotes = allData.quotes.filter(q => state.favorites.has(q.id));
        const filteredFavs = filterQuotesLocally(favQuotes);
        if (filteredFavs.length > 0) {
          const pool = (filteredFavs.length > 1 && state.currentQuote) 
            ? filteredFavs.filter(q => q.id !== state.currentQuote.id)
            : filteredFavs;
          const selected = pool[Math.floor(Math.random() * pool.length)];
          handleNewQuoteSelected(selected, filteredFavs.length);
        } else {
          displayNoQuoteFound('No favorite quotes match your current search criteria.');
          updateFilterStatus(0);
        }
      }
      return;
    }

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
      updateRandomButtonLabel();
    }, 350);

    if (data && data.success && data.quote) {
      handleNewQuoteSelected(data.quote, data.matching_count);
    } else {
      displayNoQuoteFound();
      updateFilterStatus(0);
    }

    if (state.isBrowseOpen) {
      loadBrowseQuotes();
    }
  }

  function handleNewQuoteSelected(quote, matchingCount) {
    state.currentQuote = quote;
    state.matchingCount = matchingCount;

    // Push into session history
    state.history.push(quote);
    state.historyIndex = state.history.length - 1;

    displayQuote(quote);
    updateFilterStatus();
    updateNavButtons();
    updateFavoriteButtonUI();
    updateRandomButtonLabel();
  }

  function updateRandomButtonLabel() {
    if (state.matchingCount > 0 && state.matchingCount < 100) {
      el.randomBtnLabel.textContent = `Roll from ${state.matchingCount} Quotes`;
    } else {
      el.randomBtnLabel.textContent = 'New Random Quote';
    }
  }

  function filterQuotesLocally(quotes) {
    return quotes.filter(q => {
      if (state.filters.category && q.category.toLowerCase() !== state.filters.category.toLowerCase()) {
        return false;
      }
      if (state.filters.author && !q.author.toLowerCase().includes(state.filters.author.toLowerCase())) {
        return false;
      }
      if (state.filters.keyword) {
        const kw = state.filters.keyword.toLowerCase();
        const combined = `${q.quote} ${q.author} ${q.category}`.toLowerCase();
        if (!combined.includes(kw)) return false;
      }
      return true;
    });
  }

  function displayQuote(quote) {
    el.quoteText.classList.add('fade-out');

    setTimeout(() => {
      el.quoteNumber.textContent = `Quote #${quote.id} of 100`;

      // Apply category text and accent class
      el.quoteCategory.textContent = quote.category;
      applyCategoryStyle(el.quoteCategory, quote.category);

      el.quoteText.textContent = quote.quote;
      el.quoteAuthor.textContent = quote.author;
      el.quoteContext.textContent = `Click to filter by ${quote.author}`;

      const initials = quote.author
        .split(' ')
        .filter(n => n.length > 0)
        .map(n => n[0].toUpperCase())
        .slice(0, 2)
        .join('');
      el.authorAvatar.textContent = initials || 'Q';

      updateFavoriteButtonUI();

      el.quoteText.classList.remove('fade-out');
      el.quoteText.classList.add('fade-in');

      setTimeout(() => {
        el.quoteText.classList.remove('fade-in');
      }, 250);
    }, 160);
  }

  function applyCategoryStyle(element, category) {
    // Remove existing cat-* classes
    element.className = element.className.replace(/\bcat-\w+/g, '').trim();
    const catClass = `cat-${category.toLowerCase().replace(/\s+/g, '-')}`;
    element.classList.add('cat-themed', catClass);
  }

  function displayNoQuoteFound(customMsg) {
    el.quoteNumber.textContent = 'Quote #—';
    el.quoteCategory.textContent = 'No Matches';
    el.quoteCategory.className = 'quote-category-badge';
    el.quoteText.textContent = customMsg || 'No quotes found matching your current search or category filters. Click "Reset Filters" to return to all 100 quotes!';
    el.quoteAuthor.textContent = '—';
    el.quoteContext.textContent = 'Try adjusting or clearing filters';
    el.authorAvatar.textContent = '?';
    updateFavoriteButtonUI();
  }

  // --- Filtering & Search ---
  function selectCategory(categoryName) {
    state.isFavoritesOnly = (categoryName === 'favorites');

    if (state.isFavoritesOnly) {
      state.filters.category = '';
      el.categorySelect.value = '';
    } else {
      state.filters.category = categoryName;
      el.categorySelect.value = categoryName;
    }

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

  function filterByAuthor(authorName) {
    state.filters.author = authorName;
    el.authorInput.value = authorName;
    onFilterChanged();
    el.quoteCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    const hasAnyFilter = Boolean(state.filters.author || state.filters.category || state.filters.keyword || state.isFavoritesOnly);
    el.resetFiltersBtn.classList.toggle('hidden', !hasAnyFilter);
  }

  function updateFilterStatus(overrideCount) {
    const count = overrideCount !== undefined ? overrideCount : state.matchingCount;
    const hasAnyFilter = Boolean(state.filters.author || state.filters.category || state.filters.keyword || state.isFavoritesOnly);

    if (!hasAnyFilter) {
      el.filterCountInfo.textContent = `Showing random from all 100 quotes`;
    } else {
      const parts = [];
      if (state.isFavoritesOnly) parts.push(`❤️ Favorites only`);
      if (state.filters.category) parts.push(`Category: "${state.filters.category}"`);
      if (state.filters.author) parts.push(`Author: "${state.filters.author}"`);
      if (state.filters.keyword) parts.push(`Keyword: "${state.filters.keyword}"`);

      el.filterCountInfo.textContent = `${count} ${count === 1 ? 'quote' : 'quotes'} found matching ${parts.join(', ')}`;
    }

    el.browseToggleLabel.textContent = `Browse All Matching Quotes (${count})`;
    updateRandomButtonLabel();
  }

  function resetAllFilters() {
    state.filters.author = '';
    state.filters.category = '';
    state.filters.keyword = '';
    state.isFavoritesOnly = false;

    el.authorInput.value = '';
    el.categorySelect.value = '';
    el.keywordInput.value = '';

    const chips = el.categoryChips.querySelectorAll('.chip');
    chips.forEach(c => c.classList.toggle('active', c.dataset.category === ''));

    checkClearButtons();
    getRandomQuote();
  }

  // --- Browse All Matching Quotes (With Copy Button on Each Quote) ---
  async function loadBrowseQuotes() {
    const params = new URLSearchParams();
    if (state.filters.category) params.set('category', state.filters.category);
    if (state.filters.author) params.set('author', state.filters.author);
    if (state.filters.keyword) params.set('search', state.filters.keyword);

    el.browseGrid.innerHTML = '<p style="padding:1rem;color:var(--text-muted);">Loading quotes...</p>';

    let quotesToRender = [];
    const data = await fetchJSON(`/api/quotes?${params.toString()}`);

    if (data && data.success && data.quotes) {
      quotesToRender = state.isFavoritesOnly
        ? data.quotes.filter(q => state.favorites.has(q.id))
        : data.quotes;
    }

    if (quotesToRender.length > 0) {
      el.browseGrid.innerHTML = '';
      quotesToRender.forEach(q => {
        const item = document.createElement('div');
        item.className = 'mini-quote-card';
        if (state.currentQuote && state.currentQuote.id === q.id) {
          item.classList.add('active');
        }

        const isFav = state.favorites.has(q.id);

        item.innerHTML = `
          <p class="mini-quote-text">"${escapeHTML(q.quote)}"</p>
          <div class="mini-quote-footer">
            <span class="mini-quote-author" title="${escapeHTML(q.author)}">${escapeHTML(q.author)}</span>
            <div class="mini-quote-actions">
              <span class="mini-quote-tag cat-themed cat-${q.category.toLowerCase().replace(/\s+/g, '-')}">${escapeHTML(q.category)}</span>
              <button type="button" class="mini-fav-btn ${isFav ? 'favorited' : ''}" title="${isFav ? 'Unfavorite' : 'Favorite'}" aria-label="Favorite quote">
                ${isFav ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        `;

        // Mini Favorite Button Listener
        const miniFavBtn = item.querySelector('.mini-fav-btn');
        miniFavBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (state.favorites.has(q.id)) {
            state.favorites.delete(q.id);
            miniFavBtn.classList.remove('favorited');
            miniFavBtn.textContent = '🤍';
          } else {
            state.favorites.add(q.id);
            miniFavBtn.classList.add('favorited');
            miniFavBtn.textContent = '❤️';
          }
          saveFavorites();
          updateFavoriteButtonUI();
          if (state.isFavoritesOnly) loadBrowseQuotes();
        });

        // Mini Copy Button
        const miniCopyBtn = document.createElement('button');
        miniCopyBtn.type = 'button';
        miniCopyBtn.className = 'mini-copy-btn';
        miniCopyBtn.title = 'Copy quote to clipboard';
        miniCopyBtn.setAttribute('aria-label', `Copy quote by ${q.author}`);
        miniCopyBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="mini-copy-text">Copy</span>
        `;

        miniCopyBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const textToCopy = `"${q.quote}" — ${q.author}`;
          await copyTextToClipboard(textToCopy);

          miniCopyBtn.classList.add('copied');
          miniCopyBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="mini-copy-text">Copied!</span>
          `;

          setTimeout(() => {
            miniCopyBtn.classList.remove('copied');
            miniCopyBtn.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span class="mini-copy-text">Copy</span>
            `;
          }, 2000);
        });

        const actionsContainer = item.querySelector('.mini-quote-actions');
        if (actionsContainer) {
          actionsContainer.appendChild(miniCopyBtn);
        }

        item.addEventListener('click', () => {
          state.currentQuote = q;
          state.history.push(q);
          state.historyIndex = state.history.length - 1;
          displayQuote(q);
          updateNavButtons();
          updateFavoriteButtonUI();
          el.browseGrid.querySelectorAll('.mini-quote-card').forEach(c => c.classList.remove('active'));
          item.classList.add('active');
          el.quoteCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        el.browseGrid.appendChild(item);
      });
    } else {
      el.browseGrid.innerHTML = '<p style="padding:1.5rem;text-align:center;color:var(--text-muted);">No matching quotes found.</p>';
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

  // --- Copy to Clipboard Utility ---
  async function copyTextToClipboard(textToCopy) {
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
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }

  async function copyHeroQuote() {
    if (!state.currentQuote) return;
    const textToCopy = `"${state.currentQuote.quote}" — ${state.currentQuote.author}`;
    const success = await copyTextToClipboard(textToCopy);

    if (success) {
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
    }
  }

  // --- Export to CSV Utility ---
  function exportQuotesToCSV() {
    el.exportCsvBtn.classList.add('downloading');
    const originalText = el.exportCsvBtn.querySelector('span').textContent;
    el.exportCsvBtn.querySelector('span').textContent = 'Exporting...';

    const params = new URLSearchParams();
    if (state.filters.category) params.set('category', state.filters.category);
    if (state.filters.author) params.set('author', state.filters.author);
    if (state.filters.keyword) params.set('search', state.filters.keyword);

    const exportUrl = `/api/quotes/export?${params.toString()}`;

    const link = document.createElement('a');
    link.href = exportUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      el.exportCsvBtn.classList.remove('downloading');
      el.exportCsvBtn.querySelector('span').textContent = originalText;
    }, 1000);
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

    window.speechSynthesis.cancel();
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

  function toggleShortcutsModal() {
    if (!el.shortcutsModal) return;
    if (el.shortcutsModal.open) {
      el.shortcutsModal.close();
    } else {
      el.shortcutsModal.showModal();
    }
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
    // 1. Navigation Buttons (Prev & Next)
    el.randomQuoteBtn.addEventListener('click', getRandomQuote);
    if (el.prevQuoteBtn) {
      el.prevQuoteBtn.addEventListener('click', goPrevQuote);
    }

    // 2. Interactive Author & Category Clickables on Quote Card
    if (el.quoteCategory) {
      el.quoteCategory.addEventListener('click', () => {
        if (state.currentQuote && state.currentQuote.category) {
          selectCategory(state.currentQuote.category);
        }
      });
    }

    if (el.authorNameBtn) {
      el.authorNameBtn.addEventListener('click', () => {
        if (state.currentQuote && state.currentQuote.author) {
          filterByAuthor(state.currentQuote.author);
        }
      });
    }

    if (el.authorAvatarBtn) {
      el.authorAvatarBtn.addEventListener('click', () => {
        if (state.currentQuote && state.currentQuote.author) {
          filterByAuthor(state.currentQuote.author);
        }
      });
    }

    // 3. Author Input
    el.authorInput.addEventListener('input', (e) => {
      state.filters.author = e.target.value.trim();
      debouncedFilter();
    });

    el.clearAuthorBtn.addEventListener('click', () => {
      el.authorInput.value = '';
      state.filters.author = '';
      onFilterChanged();
    });

    // 4. Category Select
    el.categorySelect.addEventListener('change', (e) => {
      selectCategory(e.target.value);
    });

    // Quick chips "All" & "Favorites" button
    const allChip = el.categoryChips.querySelector('.chip[data-category=""]');
    if (allChip) {
      allChip.addEventListener('click', () => selectCategory(''));
    }

    if (el.favoritesChip) {
      el.favoritesChip.addEventListener('click', () => selectCategory('favorites'));
    }

    // 5. Keyword Input
    el.keywordInput.addEventListener('input', (e) => {
      state.filters.keyword = e.target.value.trim();
      debouncedFilter();
    });

    el.clearKeywordBtn.addEventListener('click', () => {
      el.keywordInput.value = '';
      state.filters.keyword = '';
      onFilterChanged();
    });

    // 6. Export to CSV & Reset Filters
    if (el.exportCsvBtn) {
      el.exportCsvBtn.addEventListener('click', exportQuotesToCSV);
    }
    el.resetFiltersBtn.addEventListener('click', resetAllFilters);

    // 7. Hero Quote Action buttons
    if (el.favoriteBtn) {
      el.favoriteBtn.addEventListener('click', toggleCurrentFavorite);
    }
    el.copyBtn.addEventListener('click', copyHeroQuote);
    el.shareBtn.addEventListener('click', shareQuote);
    el.speakBtn.addEventListener('click', speakQuote);

    // 8. Browse toggle
    el.toggleBrowseBtn.addEventListener('click', toggleBrowse);

    // 9. Shortcuts Dialog
    if (el.openShortcutsBtn) {
      el.openShortcutsBtn.addEventListener('click', toggleShortcutsModal);
    }
    if (el.closeShortcutsBtn) {
      el.closeShortcutsBtn.addEventListener('click', () => el.shortcutsModal.close());
    }
    if (el.dialogGotItBtn) {
      el.dialogGotItBtn.addEventListener('click', () => el.shortcutsModal.close());
    }
    if (el.shortcutsModal) {
      el.shortcutsModal.addEventListener('click', (e) => {
        // Light dismiss if clicked outside dialog content
        if (e.target === el.shortcutsModal) {
          el.shortcutsModal.close();
        }
      });
    }

    // 10. Comprehensive Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInputActive = ['input', 'select', 'textarea'].includes(activeTag);

      // '?' opens shortcuts dialog even if not in input
      if (e.key === '?' && !isInputActive) {
        e.preventDefault();
        toggleShortcutsModal();
        return;
      }

      // '/' focuses search input
      if (e.key === '/' && !isInputActive) {
        e.preventDefault();
        el.keywordInput.focus();
        return;
      }

      if (isInputActive) return;

      if (e.code === 'Space' || e.key === 'r' || e.key === 'R') {
        if (e.code === 'Space') e.preventDefault();
        getRandomQuote();
      } else if (e.key === 'p' || e.key === 'P') {
        goPrevQuote();
      } else if (e.key === 'c' || e.key === 'C') {
        copyHeroQuote();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleCurrentFavorite();
      } else if (e.key === 'l' || e.key === 'L') {
        speakQuote();
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
