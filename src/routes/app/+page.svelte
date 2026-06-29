<script lang="ts">
  import { ArrowRightLeft, Banknote, Goal, QrCode, ReceiptText, Store } from '@lucide/svelte';
  import {
    ART_NOTICE,
    ART_SOURCES,
    CURRENCY_NAME,
    DEPOSIT_NAME,
    DISCLAIMER,
    GOAL_NAME,
    MARKET_NAME,
    PAYMENT_NAME,
    TRANSFER_NAME,
    WALLET_NAME
  } from '$lib/constants';
  import { formatBucks, formatDateTime, transactionLabel } from '$lib/format';

  export let data;
  export let form;
</script>

<section class="page stack">
  <div class="hero">
    <div>
      <span class="pill">{WALLET_NAME}</span>
      <h1>Hi, {data.user.displayName}</h1>
      <p>{DISCLAIMER}</p>
    </div>
    <div class="hero-side">
      <figure class="art-frame wallet-art">
        <img src="/art/the-liahona.jpg" alt="The Liahona" />
        <figcaption>
          <a href={ART_SOURCES.liahona}>The Liahona</a> from Gospel Media. {ART_NOTICE}
        </figcaption>
      </figure>
      <div class="panel balance-panel">
        <span class="muted">Current balance</span>
        <strong>{formatBucks(data.balance)}</strong>
        <span class="fine-print">Account code {data.user.accountCode}</span>
      </div>
    </div>
  </div>

  {#if form?.message}
    <p class:message={true} class:error={!form.ok}>{form.message}</p>
  {/if}

  <div class="grid two">
    <form method="POST" action="?/deposit" class="panel stack">
      <div class="section-head">
        <div>
          <h2>{DEPOSIT_NAME}</h2>
          <p class="fine-print">Deposit one serialized pretend bill. Each serial can be used once.</p>
        </div>
        <QrCode size={24} />
      </div>

      <label>
        Bill serial
        <input name="serial" autocapitalize="characters" placeholder="DB-20260628-8M2K7D" required />
      </label>

      <button type="submit">
        <Banknote size={18} />
        Deposit bill
      </button>
    </form>

    <form method="POST" action="?/transfer" class="panel stack">
      <div class="section-head">
        <div>
          <h2>{TRANSFER_NAME}</h2>
          <p class="fine-print">{PAYMENT_NAME} moves pretend activity points only.</p>
        </div>
        <ArrowRightLeft size={24} />
      </div>

      <label>
        Pick a recipient
        <select name="recipientId">
          <option value="">Use account code instead</option>
          {#each data.recipients as recipient}
            <option value={recipient.id}>{recipient.displayName} ({recipient.accountCode})</option>
          {/each}
        </select>
      </label>

      <label>
        Or enter account code
        <input name="recipientCode" autocapitalize="characters" placeholder="QP-8M2K7D" />
      </label>

      <label>
        Amount
        <input name="amount" type="number" inputmode="numeric" min="1" max="10000" required />
      </label>

      <label>
        Note
        <input name="note" maxlength="120" placeholder="Game night snack trade" />
      </label>

      <button type="submit">
        <ArrowRightLeft size={18} />
        Send
      </button>
    </form>
  </div>

  <div class="grid two">
    <section class="panel stack">
      <div class="section-head">
        <div>
          <h2>{MARKET_NAME}</h2>
          <p class="fine-print">Redeem activity points for pretend store items.</p>
        </div>
        <Store size={24} />
      </div>

      {#if data.items.length === 0}
        <p class="muted">No Mite Market items are active yet.</p>
      {:else}
        <div class="list">
          {#each data.items as item}
            <div class="row-item">
              <div>
                <strong>{item.name}</strong>
                <div class="fine-print">{item.description || 'Mite Market item'}</div>
              </div>
              <strong>{formatBucks(item.price)}</strong>
            </div>
          {/each}
        </div>
        <a class="button secondary" href="/market">
          <Store size={18} />
          Open Market
        </a>
      {/if}
    </section>

    <section class="panel stack">
      <div class="section-head">
        <div>
          <h2>{GOAL_NAME}</h2>
          <p class="fine-print">A future savings-goal spot for quorum activities.</p>
        </div>
        <Goal size={24} />
      </div>
      <div class="goal-box">
        <span class="muted">Placeholder</span>
        <strong>Plan a campout, service reward, or class activity goal.</strong>
      </div>
    </section>
  </div>

  <section class="panel stack">
    <div class="section-head">
      <div>
        <h2>Recent {CURRENCY_NAME}</h2>
        <p class="fine-print">Latest entries from the Small Plates Ledger.</p>
      </div>
      <ReceiptText size={24} />
    </div>

    {#if data.transactions.length === 0}
      <p class="muted">No entries yet.</p>
    {:else}
      <div class="list">
        {#each data.transactions as tx}
          <div class="row-item">
            <div>
              <strong>{transactionLabel(tx.type)}</strong>
              <div class="fine-print">
                {tx.fromName || 'Storehouse'} to {tx.toName || 'Storehouse'} - {formatDateTime(tx.createdAt)}
              </div>
            </div>
            <strong>{formatBucks(tx.amount)}</strong>
          </div>
        {/each}
      </div>
      <a class="button secondary" href="/ledger">
        <ReceiptText size={18} />
        View Ledger
      </a>
    {/if}
  </section>
</section>

<style>
  .hero {
    display: grid;
    gap: 14px;
    align-items: stretch;
  }

  .hero p {
    max-width: 70ch;
    margin: 0;
    color: var(--color-muted);
    font-weight: 700;
  }

  .hero-side {
    display: grid;
    gap: 14px;
  }

  .balance-panel {
    display: grid;
    align-content: center;
    gap: 6px;
    background: var(--color-navy);
    color: #ffffff;
  }

  .balance-panel .muted,
  .balance-panel .fine-print {
    color: #d7e5ea;
  }

  .balance-panel strong {
    font-size: clamp(2.4rem, 12vw, 5rem);
    line-height: 0.92;
  }

  .goal-box {
    display: grid;
    gap: 8px;
    min-height: 132px;
    align-content: center;
    border: 1px dashed #9bbbc6;
    border-radius: 8px;
    background: #f3f8fa;
    padding: 16px;
  }

  @media (min-width: 760px) {
    .hero {
      grid-template-columns: 1.25fr 0.75fr;
    }
  }
</style>
