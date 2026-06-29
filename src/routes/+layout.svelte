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
  import { ADMIN_NAME, APP_NAME, DISCLAIMER, LEDGER_NAME, MARKET_NAME, WALLET_NAME } from '$lib/constants';

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
  </footer>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    color-scheme: light;
    background: #f7f8f4;
    color: #17252b;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
    color: inherit;
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
    background: #ffffff;
    border: 1px solid #d9e0dc;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 12px 30px rgba(22, 45, 53, 0.06);
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
    color: #65747a;
  }

  :global(.fine-print) {
    color: #65747a;
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
    border-radius: 8px;
    background: #215c68;
    color: #ffffff;
    padding: 10px 13px;
    font-weight: 750;
    text-decoration: none;
    cursor: pointer;
  }

  :global(.button.secondary),
  :global(button.secondary) {
    background: #eef4f2;
    color: #17343a;
  }

  :global(.button.warn),
  :global(button.warn) {
    background: #8a3a3a;
  }

  :global(label) {
    display: grid;
    gap: 6px;
    color: #253a40;
    font-size: 0.92rem;
    font-weight: 700;
  }

  :global(input),
  :global(select),
  :global(textarea) {
    width: 100%;
    min-height: 42px;
    border: 1px solid #bfcbc7;
    border-radius: 8px;
    background: #ffffff;
    color: #17252b;
    padding: 10px 12px;
  }

  :global(textarea) {
    min-height: 86px;
    resize: vertical;
  }

  :global(.message) {
    border-radius: 8px;
    padding: 11px 12px;
    background: #eef7f1;
    border: 1px solid #bed8c7;
    color: #1f5131;
    font-weight: 700;
  }

  :global(.message.error) {
    background: #fff0ef;
    border-color: #edc3be;
    color: #7d302c;
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
    background: #f4f0df;
    color: #4c4320;
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
    border-top: 1px solid #e8ede9;
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
    border-bottom: 1px solid #e4ebe7;
    padding: 10px;
    text-align: left;
    vertical-align: top;
  }

  :global(th) {
    background: #f1f5f3;
    color: #40535a;
    font-size: 0.78rem;
    text-transform: uppercase;
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
    background: #153d4f;
    color: #ffffff;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    width: fit-content;
  }

  .brand-mark {
    display: inline-flex;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #f4c95d;
    color: #153d4f;
  }

  .brand strong,
  .brand small {
    display: block;
  }

  .brand small {
    color: #c8d9d9;
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
    color: #dce8e8;
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
    background: #f4c95d;
    color: #2f2b18;
    font-size: 0.88rem;
    font-weight: 800;
  }

  main {
    background:
      linear-gradient(180deg, rgba(33, 92, 104, 0.08), transparent 260px),
      #f7f8f4;
  }

  footer {
    display: grid;
    gap: 4px;
    padding: 22px 18px;
    background: #132f3c;
    color: #dce8e8;
    font-size: 0.85rem;
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
