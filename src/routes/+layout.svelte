<script lang="ts">
  import {
    Compass,
    Landmark,
    LogOut,
    ReceiptText,
    Shield,
    Store,
    Wallet
  } from '@lucide/svelte';
  import { page } from '$app/stores';
  import {
    ADMIN_NAME,
    APP_NAME,
    ART_NOTICE,
    ART_SOURCES,
    DISCLAIMER,
    LEDGER_NAME,
    MARKET_NAME,
    WALLET_NAME
  } from '$lib/constants';

  export let data;

  $: path = $page.url.pathname;
</script>

<svelte:head>
  <title>{APP_NAME}</title>
</svelte:head>

<div class="app-shell">
  <header class="topbar">
    <a href={data.user ? '/app' : '/login'} class="brand" aria-label={APP_NAME}>
      <span class="brand-mark"><Compass size={22} /></span>
      <span>
        <strong>{APP_NAME}</strong>
        <small>Deacon Bucks</small>
      </span>
    </a>

    {#if data.user}
      <nav class="nav-tabs" aria-label="Primary">
        <a class:active={path === '/app'} href="/app" title={WALLET_NAME}>
          <Wallet size={18} />
          <span>Wallet</span>
        </a>
        <a class:active={path === '/market'} href="/market" title={MARKET_NAME}>
          <Store size={18} />
          <span>Market</span>
        </a>
        <a class:active={path === '/ledger'} href="/ledger" title={LEDGER_NAME}>
          <ReceiptText size={18} />
          <span>Ledger</span>
        </a>
        {#if data.user.role === 'ADMIN'}
          <a class:active={path.startsWith('/admin')} href="/admin" title={ADMIN_NAME}>
            <Shield size={18} />
            <span>Vault</span>
          </a>
        {/if}
        <a href="/logout" title="Log out">
          <LogOut size={18} />
          <span>Out</span>
        </a>
      </nav>
    {/if}
  </header>

  <div class="disclaimer-band">
    <Landmark size={16} />
    <span>{DISCLAIMER}</span>
  </div>

  <main>
    <slot />
  </main>

  <footer>
    <strong>{APP_NAME}</strong>
    <span>{DISCLAIMER}</span>
    <span>
      {ART_NOTICE} Sources:
      <a href={ART_SOURCES.liahona}>The Liahona</a>,
      <a href={ART_SOURCES.lehiLiahona}>Lehi showing the Liahona to his family</a>.
    </span>
  </footer>
</div>

<style>
  :global(:root) {
    --color-ink: #212225;
    --color-muted: #53575b;
    --color-line: #d0d3d3;
    --color-surface: #ffffff;
    --color-surface-alt: #eff0f0;
    --color-page: #f7f8f8;
    --color-navy: #003057;
    --color-blue: #006184;
    --color-blue-bright: #007da5;
    --color-link: #157493;
    --color-gold: #ffb81c;
    --color-green: #3f6f4f;
    --shadow-panel: 0 12px 28px rgba(33, 34, 37, 0.08);
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    color-scheme: light;
    background: var(--color-page);
    color: var(--color-ink);
    font-family:
      "Ensign:Sans", Roboto, Arial, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
    letter-spacing: 0;
  }

  :global(body) {
    margin: 0;
    min-width: 320px;
  }

  :global(button),
  :global(input),
  :global(select),
  :global(textarea) {
    font: inherit;
  }

  :global(a) {
    color: var(--color-link);
  }

  :global(.page) {
    width: min(1120px, 100%);
    margin: 0 auto;
    padding: 18px;
  }

  :global(.stack) {
    display: grid;
    gap: 14px;
  }

  :global(.grid) {
    display: grid;
    gap: 14px;
  }

  :global(.grid.two) {
    grid-template-columns: 1fr;
  }

  :global(.grid.three) {
    grid-template-columns: 1fr;
  }

  :global(.panel) {
    background: var(--color-surface);
    border: 1px solid var(--color-line);
    border-radius: 8px;
    padding: 16px;
    box-shadow: var(--shadow-panel);
  }

  :global(.panel.flush) {
    padding: 0;
    overflow: hidden;
  }

  :global(.section-head) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  :global(.section-head h1),
  :global(.section-head h2),
  :global(.section-head h3) {
    margin: 0;
  }

  :global(h1) {
    margin: 0 0 8px;
    font-size: clamp(2rem, 7vw, 4.3rem);
    line-height: 0.98;
  }

  :global(h2) {
    margin: 0 0 8px;
    font-size: 1.25rem;
    line-height: 1.2;
  }

  :global(h3) {
    margin: 0 0 8px;
    font-size: 1rem;
    line-height: 1.2;
  }

  :global(p) {
    line-height: 1.5;
  }

  :global(.muted) {
    color: var(--color-muted);
  }

  :global(.fine-print) {
    color: var(--color-muted);
    font-size: 0.86rem;
    line-height: 1.45;
  }

  :global(.button-row) {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  :global(.button),
  :global(button) {
    display: inline-flex;
    min-height: 42px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 0;
    border-radius: 4px;
    background: var(--color-blue);
    color: #ffffff;
    padding: 10px 13px;
    font-weight: 750;
    text-decoration: none;
    cursor: pointer;
  }

  :global(.button.secondary),
  :global(button.secondary) {
    background: var(--color-surface-alt);
    color: var(--color-ink);
  }

  :global(.button.warn),
  :global(button.warn) {
    background: #8c3f2b;
  }

  :global(label) {
    display: grid;
    gap: 6px;
    color: var(--color-ink);
    font-size: 0.92rem;
    font-weight: 700;
  }

  :global(input),
  :global(select),
  :global(textarea) {
    width: 100%;
    min-height: 42px;
    border: 1px solid #878a8c;
    border-radius: 4px;
    background: var(--color-surface);
    color: var(--color-ink);
    padding: 10px 12px;
  }

  :global(textarea) {
    min-height: 86px;
    resize: vertical;
  }

  :global(.message) {
    border-radius: 4px;
    padding: 11px 12px;
    background: #eef6f2;
    border: 1px solid #b9d3c6;
    color: var(--color-green);
    font-weight: 700;
  }

  :global(.message.error) {
    background: #fff4ee;
    border-color: #e1b5a2;
    color: #8c3f2b;
  }

  :global(.metric) {
    display: grid;
    gap: 4px;
  }

  :global(.metric strong) {
    font-size: clamp(2rem, 10vw, 4rem);
    line-height: 0.96;
  }

  :global(.pill) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    border-radius: 999px;
    background: #fff3cf;
    color: #4d3b00;
    padding: 5px 9px;
    font-size: 0.78rem;
    font-weight: 800;
  }

  :global(.list) {
    display: grid;
    gap: 10px;
  }

  :global(.row-item) {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    align-items: center;
    border-top: 1px solid var(--color-line);
    padding: 12px 0;
  }

  :global(.row-item:first-child) {
    border-top: 0;
    padding-top: 0;
  }

  :global(.table-wrap) {
    width: 100%;
    overflow-x: auto;
  }

  :global(table) {
    width: 100%;
    border-collapse: collapse;
    min-width: 680px;
    font-size: 0.92rem;
  }

  :global(th),
  :global(td) {
    border-bottom: 1px solid var(--color-line);
    padding: 10px;
    text-align: left;
    vertical-align: top;
  }

  :global(th) {
    background: var(--color-surface-alt);
    color: var(--color-muted);
    font-size: 0.78rem;
    text-transform: uppercase;
  }

  :global(.art-frame) {
    display: grid;
    gap: 0;
    margin: 0;
    overflow: hidden;
    border: 1px solid var(--color-line);
    border-radius: 8px;
    background: var(--color-surface);
    box-shadow: var(--shadow-panel);
  }

  :global(.art-frame img) {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
  }

  :global(.art-frame figcaption) {
    padding: 9px 11px;
    background: var(--color-surface);
    color: var(--color-muted);
    font-size: 0.75rem;
    line-height: 1.35;
  }

  :global(.art-frame a) {
    font-weight: 800;
  }

  :global(.art-banner) {
    display: grid;
    gap: 0;
    margin: 0;
    overflow: hidden;
    border: 1px solid var(--color-line);
    border-radius: 8px;
    background: var(--color-surface);
    box-shadow: var(--shadow-panel);
  }

  :global(.art-banner img) {
    display: block;
    width: 100%;
    max-height: 260px;
    object-fit: cover;
  }

  :global(.art-banner figcaption) {
    padding: 9px 12px;
    color: var(--color-muted);
    font-size: 0.75rem;
    line-height: 1.35;
  }

  .app-shell {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
  }

  .topbar {
    display: grid;
    gap: 12px;
    padding: 14px 18px;
    background: var(--color-navy);
    color: #ffffff;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ffffff;
    text-decoration: none;
    width: fit-content;
  }

  .brand:hover {
    text-decoration: none;
  }

  .brand-mark {
    display: inline-flex;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--color-gold);
    color: var(--color-navy);
  }

  .brand strong,
  .brand small {
    display: block;
  }

  .brand small {
    color: #c7dce4;
    font-size: 0.8rem;
  }

  .nav-tabs {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
  }

  .nav-tabs a {
    display: grid;
    min-height: 50px;
    place-items: center;
    gap: 3px;
    border-radius: 8px;
    color: #d7e5ea;
    font-size: 0.75rem;
    font-weight: 800;
    text-decoration: none;
  }

  .nav-tabs a.active,
  .nav-tabs a:hover {
    background: rgba(255, 255, 255, 0.13);
    color: #ffffff;
  }

  .disclaimer-band {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 18px;
    background: var(--color-surface-alt);
    color: var(--color-ink);
    border-bottom: 4px solid var(--color-gold);
    font-size: 0.88rem;
    font-weight: 800;
  }

  main {
    background:
      linear-gradient(180deg, rgba(0, 97, 132, 0.08), transparent 260px),
      var(--color-page);
  }

  footer {
    display: grid;
    gap: 4px;
    padding: 22px 18px;
    background: var(--color-navy);
    color: #d7e5ea;
    font-size: 0.85rem;
  }

  footer a {
    color: #ffffff;
    font-weight: 800;
  }

  @media (min-width: 720px) {
    :global(.page) {
      padding: 28px;
    }

    :global(.grid.two) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    :global(.grid.three) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .topbar {
      grid-template-columns: 1fr auto;
      align-items: center;
    }

    .nav-tabs {
      display: flex;
      align-items: center;
    }

    .nav-tabs a {
      min-width: 72px;
      padding: 6px 8px;
    }
  }

  @media print {
    .topbar,
    .disclaimer-band,
    footer,
    :global(.no-print) {
      display: none !important;
    }

    main {
      background: #ffffff;
    }

    :global(.page) {
      width: 100%;
      padding: 0;
    }
  }
</style>
