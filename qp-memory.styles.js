// public/js/components-web/qp-memory/qp-memory.styles.js

function getStyles(options) {
  options = Object.assign({}, { dimension: 3 }, options);
  
  const { dimension } = options;
  const bgUrlMemoryCard = new URL('./qp-memory-background.svg', import.meta.url).href;

  
  return `
      <style>
        :host {
          display: block;
          color: inherit;
          font-family: inherit;
        }

        .qp-memory-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
          padding: 2rem 0;
        }

        .qp-memory-display {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-bottom: 1px solid #ddd;
          margin: 0 2rem;
          padding: 0.25rem 1rem;
          font-family: monospace;
        }
        .qp-memory-display-output {
          text-align: center;
        }
        .qp-memory-display-counter {
          text-align: right;
        }
        
        .qp-memory-board {
          --boardWidth: 100%;
          display: grid;
          grid-template-columns: repeat(${dimension}, 1fr);
          grid-template-rows: repeat(${dimension}, 1fr);
          gap: 1rem;
          width: var(--boardWidth);
        }

        .qp-memory-card {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          cursor: pointer;
          aspect-ratio: 1 / 1;
          background-color: #ddd;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: 50%;
          background-image: url(${bgUrlMemoryCard});
          border: 5px double #6d757d;
        }

        .qp-memory-card-matched {
          filter: sepia(100%) grayscale(50%) blur(1px) !important;
        }
        .qp-memory-card-hint {
          border: 5px double #e29706;
        }

        .qp-prevent-events {
          pointer-events: none;
        }

        .qp-memory-button-bar {
          display: flex;
          justify-content: center;
          gap: 1rem;
          
          border-top: 1px solid #ddd;
          margin: 0 2rem 1rem;
          padding: 1rem 1rem 0.5rem;
        }
        .qp-btn {
            width: 100%;
            padding: 0.875rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .qp-btn:disabled {
            cursor: default;
        }
        .qp-btn:hover {
            transform: translateY(-2px);
        }

        .qp-btn.qp-btn-small {
            width: 30px;
            text-align: center;
            padding: 0.5rem 0;
        }
        .qp-btn.qp-btn-full {
            display: block;
            text-align: center;
        }

        .qp-btn-primary {
          --qp-btn-color: #fff;
          --qp-btn-bg: #0d6efd;
          --qp-btn-border-color: #0d6efd;
          --qp-btn-hover-color: #fff;
          --qp-btn-hover-bg: #0b5ed7;
          --qp-btn-hover-border-color: #0a58ca;
          --qp-btn-disabled-color: #fff;
          --qp-btn-disabled-bg: #0d6efd;
          --qp-btn-disabled-border-color: #0d6efd;
        }
        .qp-btn-primary {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
        .qp-btn-primary:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
        .qp-btn-primary:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }
          
        .qp-btn-secondary {
          --qp-btn-color: #fff;
          --qp-btn-bg: #6c757d;
          --qp-btn-border-color: #6c757d;
          --qp-btn-hover-color: #fff;
          --qp-btn-hover-bg: #5c636a;
          --qp-btn-hover-border-color: #565e64;
          --qp-btn-disabled-color: #fff;
          --qp-btn-disabled-bg: #6c757d;
          --qp-btn-disabled-border-color: #6c757d;
        }
        .qp-btn-secondary {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
        .qp-btn-secondary:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
        .qp-btn-secondary:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }

        .qp-btn-cta,
        .qp-btn-success{
            --qp-btn-color: #fff;
            --qp-btn-bg: #198754;
            --qp-btn-border-color: #198754;
            --qp-btn-hover-color: #fff;
            --qp-btn-hover-bg: #157347;
            --qp-btn-hover-border-color: #146c43;
            --qp-btn-disabled-color: #fff;
            --qp-btn-disabled-bg: #198754;
            --qp-btn-disabled-border-color: #198754;
        }
        .qp-btn-cta {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
        .qp-btn-cta:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
        .qp-btn-cta:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }
        .qp-btn-success {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
        .qp-btn-success:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
        .qp-btn-success:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }
          
        .qp-btn-danger {
          --qp-btn-color: #fff;
          --qp-btn-bg: #dc3545;
          --qp-btn-border-color: #dc3545;
          --qp-btn-hover-color: #fff;
          --qp-btn-hover-bg: #bb2d3b;
          --qp-btn-hover-border-color: #b02a37;
          --qp-btn-disabled-color: #fff;
          --qp-btn-disabled-bg: #dc3545;
          --qp-btn-disabled-border-color: #dc3545;
        }
        .qp-btn-danger {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
        .qp-btn-danger:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
        .qp-btn-danger:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }
        
        .qp-btn-info {
          --bs-btn-color: #000;
          --bs-btn-bg: #ffc107;
          --bs-btn-border-color: #ffc107;
          --bs-btn-hover-color: #000;
          --bs-btn-hover-bg: #ffca2c;
          --bs-btn-hover-border-color: #ffc720;
          --bs-btn-disabled-color: #000;
          --bs-btn-disabled-bg: #ffc107;
          --bs-btn-disabled-border-color: #ffc107;
        }
        .qp-btn-info {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
        .qp-btn-info:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
        .qp-btn-info:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }
      </style>
    `;
};

export default getStyles;
