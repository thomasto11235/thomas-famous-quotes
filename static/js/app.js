/**
 * Echoes of Wisdom — Random Quote Web Application
 * Vanilla JavaScript (ES6+)
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

    // Inputs & Filters
    authorInput: document.getElementById('author-input'),
    authorDatalist: document.getElementById('author-datalist'),
    clearAuthorBtn: document.getElementById('clear-author-btn'),
    categorySelect: document.getElementById('category-select'),
    categoryChips: document.getElementById('category-chips'),
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

  // --- Theme Management: Override CSS Root Variables ---
  function applyTheme(themeMode) {
    const isDark = (themeMode === 'dark');
    const targetVars = isDark ? themeVariables.dark : themeVariables.light;
    const rootStyle = document.documentElement.style;

    // Overriding CSS root variables directly on :root / documentElement
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
        const nextTheme = e.target.checked ? 'dark' : 'light';
        applyTheme(nextTheme);
      });
    }

    // Handle OS preference changes if user hasn't explicitly set a preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('quote_theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
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
    el.quoteText.classList.add('fade-out');

    setTimeout(() => {
      el.quoteNumber.textContent = `Quote #${quote.id} of 100`;
      el.quoteCategory.textContent = quote.category;
      el.quoteText.textContent = quote.quote;
      el.quoteAuthor.textContent = quote.author;
      el.quoteContext.textContent = `${quote.category} Perspective`;

      const initials = quote.author
        .split(' ')
        .filter(n => n.length > 0)
        .map(n => n[0].toUpperCase())
        .slice(0, 2)
        .join('');
      el.authorAvatar.textContent = initials || 'Q';

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

  // --- Browse All Matching Quotes (With Copy Button on Each Quote) ---
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

        // Inner HTML: Text, Author, Category
        item.innerHTML = `
          <p class="mini-quote-text">"${escapeHTML(q.quote)}"</p>
          <div class="mini-quote-footer">
            <span class="mini-quote-author" title="${escapeHTML(q.author)}">${escapeHTML(q.author)}</span>
            <div class="mini-quote-actions">
              <span class="mini-quote-tag">${escapeHTML(q.category)}</span>
            </div>
          </div>
        `;

        // "Copy to Clipboard" button on EACH quote in the grid
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
          e.stopPropagation(); // Don't trigger the card selection
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

        // Append copy button into mini-quote-actions
        const actionsContainer = item.querySelector('.mini-quote-actions');
        if (actionsContainer) {
          actionsContainer.appendChild(miniCopyBtn);
        }

        // Clicking card selects quote as hero quote
        item.addEventListener('click', () => {
          state.currentQuote = q;
          displayQuote(q);
          el.browseGrid.querySelectorAll('.mini-quote-card').forEach(c => c.classList.remove('active'));
          item.classList.add('active');
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

    // Trigger download
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

    // 5. Export to CSV & Reset Filters
    if (el.exportCsvBtn) {
      el.exportCsvBtn.addEventListener('click', exportQuotesToCSV);
    }
    el.resetFiltersBtn.addEventListener('click', resetAllFilters);

    // 6. Hero Quote Action buttons
    el.copyBtn.addEventListener('click', copyHeroQuote);
    el.shareBtn.addEventListener('click', shareQuote);
    el.speakBtn.addEventListener('click', speakQuote);

    // 7. Browse toggle
    el.toggleBrowseBtn.addEventListener('click', toggleBrowse);

    // 8. Keyboard navigation: Space or R rolls random quote
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (['input', 'select', 'textarea'].includes(activeTag)) return;

      if (e.code === 'Space' || e.key === 'r' || e.key === 'R') {
        if (e.code === 'Space') e.preventDefault();
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
