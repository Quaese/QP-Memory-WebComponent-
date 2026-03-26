/**
 * <qp-memory> — Cover Memory Game Web Component
 *
 * A memory/matching card game. Image sources are configurable: either fetched
 * from a server API (via the `url` attribute) or loaded from the bundled
 * local image set (qp-memory.images.js) as fallback.
 * Players flip pairs of cards to find matching images.
 *
 * @element qp-memory
 *
 * @attr {number} dimension - Grid size (NxN). Allowed values defined in BOARD_SIZES. Default: 4
 * @attr {string} url       - Optional API endpoint to fetch cover images (e.g. "/media/covers").
 *                            If omitted, the bundled imageList from qp-memory.images.js is used.
 *
 * @prop {string} _width - Board width as CSS value. Adjusted internally based on
 *                         dimension (e.g. "60%" for <=4, "90dvh" for >4). Default: "60%"
 *
 * @example
 *   <!-- With bundled images (zodiac signs, traffic signs, card suits) -->
 *   <qp-memory dimension="4"></qp-memory>
 *
 *   <!-- With server-fetched cover images -->
 *   <qp-memory dimension="6" url="/media/covers"></qp-memory>
 *
 * @description
 *   Lifecycle:
 *     connectedCallback  — Loads images (from API if url is set, otherwise from
 *                          bundled imageList), then starts the game.
 *     disconnectedCallback — Clears timers and removes all event listeners.
 *     attributeChangedCallback — Re-renders when dimension changes.
 *
 *   Game flow:
 *     1. Images are loaded once on connect (API fetch or local imageList).
 *     2. _startGame() picks random images, duplicates & shuffles them (Fisher-Yates),
 *        renders the board, and disables the start button.
 *     3. Players click cards to reveal images. After two clicks the pair is checked:
 *        - Match:   cards stay visible and are marked as matched.
 *        - No match: cards are flipped back after NEXT_ROUND_DELAY ms.
 *     4. _onWin() fires when all pairs are found, shows elapsed time (including
 *        hint penalties: +5 seconds per hint used) and moves, and re-enables
 *        the start button. The solved board remains visible.
 *
 *   UI sections:
 *     - Display bar   — headline (NxN), elapsed time, move counter
 *     - Board         — CSS grid of card elements with random rotation (-5° to +5°)
 *     - Button bar    — Start, Restart, Hint (+5s penalty per use), board size selector
 *
 *   Translations:
 *     All visible text is resolved via _dict() (Dictionary module) with a
 *     built-in _defaultDict() fallback (de/en).
 *
 *   Styles:
 *     Loaded from the external module qp-memory.styles.js via getStyles().
 *     Board width is set through the CSS custom property --boardWidth.
 *
 *   Events (CustomEvent, bubbles, composed):
 *     - "qp-memory.game-start" — fired when a new game starts.
 *         detail: {}
 *     - "qp-memory.game-won"  — fired when all pairs have been found.
 *         detail: { time: number (ms), formattedTime: string ("MM:SS"), moves: number, hints: number }
 *
 * @dependencies
 *   - ./qp-memory.dictionary.js  — i18n translations
 *   - ./qp-memory.styles.js      — scoped styles
 *   - ./qp-memory.images.js      — bundled image set (zodiac, traffic signs, card suits)
 *   - /media/covers (API)        — optional server-side cover image list
 */

import Dictionary, { Languages } from './qp-memory.dictionary.js';
import getStyles from './qp-memory.styles.js';
import { imageList } from './qp-memory.images.js';

class QPMemory extends HTMLElement {
  static PENALTY_SECONDS = 5;
  static NEXT_ROUND_DELAY = 1000;
  static BOARD_SIZES = [2, 4, 6, 8];

  static get observedAttributes() {
    return ["dimension", "url"];
  }

  constructor() {
    super();

    // create shadow root (DOM)
    this.attachShadow({ mode: "open" });

    // attributes
    this._dimension = 4;
    this._url = null;
    this._lang = 'de';

    // nodes
    this._board = null;
    this._counter = null;
    this._output = null;
    this._btnStart = null;
    this._btnRestart = null;
    this._btnHint = null;
    this._selectSize = null;
    
    // timers and properties
    this._time = null;
    this._covers = null;
    this._rnd = [];
    this._round = {
      first: null,
      second: null
    };
    this._moves = 0;
    this._hints = 0;
    this._width = "60%";

    // Methods bound to this (not applicable for event handlers,
    // since this will then point to the event target)
    this._handleCardClick = this._handleCardClick.bind(this);
    this._handleStartClick = this._handleStartClick.bind(this);
    this._handleHintClick = this._handleHintClick.bind(this);
    this._handleSizeChange = this._handleSizeChange.bind(this);

    // Initialize the dictionary function in the constructor,
    // as attributeChangedCallback is called before connectedCallback
    this._initializeDictionary();
  }

  /* START - Lifecycle */
  // Called when the element is inserted into the DOM
  async connectedCallback() {
    this._covers = this._url ? await this._fetchCovers() : imageList;

    if (!this._covers.length) {
      console.error('qp-memory: No images available');
      return;
    }

    this._startGame();
  }

  // Called when the element is removed from the DOM
  disconnectedCallback() {
    this._reset();
  }

  // Called whenever an observed attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    // No action if the value is the same (Performance optimization)
    if (oldValue === newValue) return;

    switch (name) {
      case "dimension":
        this._dimension = parseInt(newValue, 10) || 4;
        break;
      case "url":
        this._url = newValue;
        break;
    }

    if (this.isConnected && this._covers) {
      this._render();
    }
  }
  /* END - Lifecycle */

  /* START - Tools, Helpers */
  /**
   * Initializes the dictionary function for translations.
   * Called in the constructor because attributeChangedCallback runs before connectedCallback.
   * Uses the imported Dictionary module.
   * Flexible signature like store.dict: dict(key), dict(key, lang), dict(key, arg), dict(key, lang, arg)
   * @private
   */
  _initializeDictionary() {
    // Create dictionary function with flexible signature
    this._dict = (key, ...args) => {
      try {
        // Extract first argument
        let tmp = args.splice(0, 1)[0];
        let lang = this._lang || 'de';

        // Check if tmp is a valid language code
        if (Languages.includes(tmp)) {
          lang = tmp;
        } else if (args.length > 0 || tmp !== undefined) {
          // Not a language code — treat as dictionary argument
          args = [tmp, ...args];
        }

        const dict = Dictionary(args);
        return dict[key]?.[lang] || key;
      } catch (e) {
        // Fall back to default dictionary on error
        return this._defaultDict(key, this._lang || 'de', args);
      }
    };
  }

  /**
   * Fallback dictionary for translations.
   * Used when the Dictionary module throws an error.
   * @private
   * @param {string} key - translation key
   * @param {string} [lang='de'] - language code
   * @param {Array} [args=[]] - dynamic values for template literals
   * @returns {string} translated text, or the key as fallback
   */
  _defaultDict(key, lang = 'de', args = []) {
    const fallback = {
      funMemoryHeadline: { de: `Cover Memory: ${args[0]}x${args[0]} Karten`, en: `Cover Memory: ${args[0]}x${args[0]} Cards` },
      funMemoryMoves: { de: `Züge: ${args[0]}`, en: `Moves: ${args[0]}` },
      funMemoryTime: { de: `Zeit: ${args[0]}`, en: `Time: ${args[0]}` },
      funMemoryStart: { de: 'Start', en: 'Start' },
      funMemoryHint: { de: 'Tipp', en: 'Hint' },
      funMemoryRestart: { de: 'Neustart', en: 'Restart' },
      funMemoryReset: { de: 'Zurücksetzen', en: 'Reset' },
    };
    
    return fallback[key]?.[lang] || key;
  }

  async _fetchCovers() {
    try {
      const response = await fetch(this._url);
      const data = await response.json();
      return data?.success ? data.covers : [];
    } catch (error) {
      console.error('Error fetching covers:', error);
      return [];
    }
  }

  _randomList() {
    const len = (this._dimension * this._dimension) / 2;
    let i = 0;

    while (this._rnd.length < len && i < 1000) {
      const rnd = Math.floor(Math.random() * this._covers.length);

      if (!this._rnd.includes(rnd)) {
        this._rnd.push(rnd);
      }

      i++;
    }

    this._rnd = this._rnd.concat(this._rnd);

    // Fisher-Yates Shuffle
    for (let j = this._rnd.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [this._rnd[j], this._rnd[k]] = [this._rnd[k], this._rnd[j]];
    }
  }

  // Caches references to shadow DOM nodes
  _setNodes() {
    this._board = this.shadowRoot.querySelector(".qp-memory-board");
    this._counter = this.shadowRoot.querySelector(".qp-memory-display-counter");
    this._output = this.shadowRoot.querySelector(".qp-memory-display-output");
    this._btnStart = this.shadowRoot.querySelector('.qp-memory-btn-start');
    this._btnRestart = this.shadowRoot.querySelector('.qp-memory-btn-restart');
    this._btnHint = this.shadowRoot.querySelector('.qp-memory-btn-hint');
    this._selectSize = this.shadowRoot.querySelector('.qp-memory-select-size');
    
    // set board width
    this._board.style.setProperty('--boardWidth', `${this._width}`);
  }
  
  _formatTimestamp(ms) {
    const totalSeconds = Math.floor(ms / 1000); // timestamp in seconds
    const minutes = Math.floor(totalSeconds / 60); // minutes
    const seconds = totalSeconds % 60; // seconds
    
    // Formatting: 2-digit minutes and seconds
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  /* END - Tools, Helpers */

  /* START - Event Controller */
  _attachEvents() {
    if (!this._board) return;

    const memoryCards = this._board.querySelectorAll('.qp-memory-card');

    Array.from(memoryCards).forEach(card => {
      card.addEventListener('click', this._handleCardClick);
    });

    this._btnStart && this._btnStart.addEventListener('click', this._handleStartClick);
    this._btnRestart && this._btnRestart.addEventListener('click', this._handleStartClick);
    this._btnHint && this._btnHint.addEventListener('click', this._handleHintClick);
    this._selectSize && this._selectSize.addEventListener('change', this._handleSizeChange);
  }
  
  _removeEvents() {
    this._btnStart && this._btnStart.removeEventListener('click', this._handleStartClick);
    this._btnRestart && this._btnRestart.removeEventListener('click', this._handleStartClick);
    this._btnHint && this._btnHint.removeEventListener('click', this._handleHintClick);
    this._selectSize && this._selectSize.removeEventListener('change', this._handleSizeChange);

    if (!this._board) return;

    const memoryCards = this._board.querySelectorAll('.qp-memory-card');

    Array.from(memoryCards).forEach(card => {
      card.removeEventListener('click', this._handleCardClick);
    });
  }
  
  _dispatchEvent(type, payload = {}) {
    this.dispatchEvent(
      new CustomEvent(type, {
        bubbles: true,
        composed: true,
        detail: payload,
      }),
    );
  }
  /* END - Event Controller */

  /* START - Event handlers */
  _handleStartClick() {
    this._startGame();
  }

  _handleSizeChange(e) {
    this._dimension = parseInt(e.target.value, 10);
    // adjust width depending on dimension
    this._width = this._dimension > 4 ? "90dvh" : "60%";
    
    this._startGame();
  }

  _handleCardClick(e) {
    const cover = e.target.dataset.cover;
    const index = e.target.dataset.index;
    const roundComplete = this._drawCard(cover, index);

    e.target.style.backgroundImage = this._url
      ? `url("/images/cover/${this._covers[cover]}")`
      : `url("${this._covers[cover]}")`;

    // first card drawn — disable hint until round completes
    if (!roundComplete) {
      this._btnHint.disabled = true;
    }

    // two cards have been flipped
    if (roundComplete) {
      // disable events for card board (enabled after round timeouts)
      this._board.classList.add('qp-prevent-events');
      // increment attempts
      this._moves++;

      this._counter.innerText = this._dict('funMemoryMoves', this._lang, this._moves, this._hints);

      // check if cards match
      if (this._checkCards()) {
        setTimeout(() => this._matchRound(), QPMemory.NEXT_ROUND_DELAY);
      } else {
        setTimeout(() => this._unmatchRound(), QPMemory.NEXT_ROUND_DELAY);
      }
    }
  }
  
  _handleHintClick(e) {
    const hintIdx = Math.floor(Math.random() * this._rnd.length);
    const hintCards = this._board.querySelectorAll(`[data-cover="${this._rnd[hintIdx]}"]`);

    // time penalty
    this._hints++;
    
    hintCards.forEach(card => {
      card.classList.add('qp-memory-card-hint');
    });
    
    setTimeout(() => {
      hintCards.forEach(card => {
        card.classList.remove('qp-memory-card-hint');
      });
      
      this._counter.innerText = this._dict('funMemoryMoves', this._lang, this._moves, this._hints);
    }, QPMemory.NEXT_ROUND_DELAY);
  }
  /* END - Event handlers */

  /* START - Game Controller */
  _startGame() {
    this._rnd = [];
    this._resetRound();
    this._randomList();
    this._render();
    
    this._time = new Date().getTime();
    this._hints = 0;
    
    this._moves = 0;
    this._btnStart.disabled = true;
    this._btnHint.disabled = false;
    
    this._dispatchEvent("qp-memory.game-start");
  }

  _resetRound() {
    this._round = {
      first: null,
      second: null
    };

    // enable events
    this._board && this._board.classList.remove('qp-prevent-events');
    // re-enable hint button after round
    this._btnHint && (this._btnHint.disabled = false);
  }

  _matchRound() {
    // loop over all found cards with same cover index
    this._board.querySelectorAll(`[data-cover="${this._round.first.cover}"]`).forEach(card => {
      // remove event listener
      card.removeEventListener('click', this._handleCardClick);
      // mark as matched
      card.classList.add('qp-memory-card-matched');
    });

    // filter found cover indices from array
    this._rnd = this._rnd.filter(item => item !== this._round.first.cover);

    // reset round
    this._resetRound();

    if (this._rnd.length === 0) {
      this._onWin();
    }
  }

  _unmatchRound() {
    if (this._round.first) {
      this._board.querySelectorAll(`[data-cover="${this._round.first.cover}"]`).forEach(card => {
        card.style.backgroundImage = '';
      });
    }
    if (this._round.second) {
      this._board.querySelectorAll(`[data-cover="${this._round.second.cover}"]`).forEach(card => {
        card.style.backgroundImage = '';
      });
    }

    this._resetRound();
  }

  _onWin() {
    this._btnStart.disabled = false;
    this._btnHint.disabled = true;
    
    this._time = new Date().getTime() - this._time;
    this._time += this._hints * (QPMemory.PENALTY_SECONDS * 1000);
    this._output.innerText = this._dict('funMemoryTime', this._lang, this._formatTimestamp(this._time));
    
    this._dispatchEvent("qp-memory.game-won", {
      time: this._time,
      formattedTime: this._formatTimestamp(this._time),
      moves: this._moves,
      hints: this._hints
    });
  }

  _drawCard(card, index) {
    let roundComplete = false;

    if (this._round.first === null) {
      this._round.first = {
        cover: Number(card), 
        index: Number(index)
      };
    } else if (this._round.second === null && this._round.first.index !== Number(index)) {
      this._round.second = {
        cover: Number(card), 
        index: Number(index)
      };

      roundComplete = true;
    }

    return roundComplete;
  }

  _checkCards() {
    if (this._round.first && this._round.second) {
      return this._round.first.cover === this._round.second.cover;
    }

    return false;
  }

  _reset() {
    this._removeEvents();
  }
  /* END - Game Controller */

  /* START - UI Controller Methods */
  _setStyles() {
    return getStyles.call(this, {dimension: this._dimension});
  }

  _createBoard() {
    const totalCards = this._dimension * this._dimension;
    let cards = '';

    for (let i = 0; i < totalCards; i++) {
      const rotation = (Math.random() * 10 - 5).toFixed(2);
      cards += `<div class="qp-memory-card" data-index="${i}" data-cover="${this._rnd[i]}" style="transform: rotate(${rotation}deg);"></div>`;
    }

    return `<div class="qp-memory-wrapper">
      <div class="qp-memory-board">
        ${cards}
      </div>
    </div>`;
  }

  // Renders the shadow DOM and caches node references
  _render() {
    this._reset();

    this.shadowRoot.innerHTML = `
      <div class="qp-memory-display">
        <div class="qp-memory-display-title">${this._dict('funMemoryHeadline', this._lang, this._dimension)}</div>
        <div class="qp-memory-display-output">---</div>
        <div class="qp-memory-display-counter">${this._dict('funMemoryMoves', this._lang, 0, 0)}</div>
      </div>
      ${this._setStyles()}
      ${this._createBoard()}
      <div class="qp-memory-button-bar">
        <button class="qp-btn qp-btn-primary qp-memory-btn-start">${this._dict('funMemoryStart', this._lang)}</button>
        <button class="qp-btn qp-btn-cta qp-memory-btn-restart">${this._dict('funMemoryRestart', this._lang)}</button>
        <button class="qp-btn qp-btn-secondary qp-memory-btn-hint">${this._dict('funMemoryHint', this._lang)}</button>
        <select class="qp-btn qp-memory-select-size">
          ${QPMemory.BOARD_SIZES
            .filter(size => (size * size) / 2 <= this._covers.length)
            .map(size =>
              `<option value="${size}"${size === this._dimension ? ' selected' : ''}>${size} x ${size}</option>`
            ).join('')}
        </select>
      </div>
    `;

    if (this.isConnected) {
      this._setNodes();
      this._attachEvents();
    }
  }
}
/* END - UI Controller Methods */

// Registration
customElements.define("qp-memory", QPMemory);

export default QPMemory;
