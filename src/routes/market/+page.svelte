<script lang="ts">
  import { ShoppingBag, Store } from '@lucide/svelte';
  import { DISCLAIMER, MARKET_NAME, MERCHANT_NAME } from '$lib/constants';
  import { formatBucks } from '$lib/format';

  export let data;
  export let form;
</script>

<section class="page stack">
  <div class="section-head">
    <div>
      <span class="pill">{MERCHANT_NAME}</span>
      <h1>{MARKET_NAME}</h1>
      <p class="muted">{DISCLAIMER}</p>
    </div>
    <Store size={32} />
  </div>

  {#if form?.message}
    <p class:message={true} class:error={!form.ok}>{form.message}</p>
  {/if}

  {#if data.items.length === 0}
    <section class="panel">
      <strong>No active items yet.</strong>
      <p class="fine-print">An adult leader can add pretend store items in the Bishopric Vault.</p>
    </section>
  {:else}
    <div class="market-grid">
      {#each data.items as item}
        <form method="POST" action="?/buy" class="panel item-card">
          <input type="hidden" name="itemId" value={item.id} />
          <div>
            <h2>{item.name}</h2>
            <p>{item.description || 'Mite Market item'}</p>
          </div>
          <div class="item-footer">
            <strong>{formatBucks(item.price)}</strong>
            <button type="submit">
              <ShoppingBag size={18} />
              Redeem
            </button>
          </div>
        </form>
      {/each}
    </div>
  {/if}
</section>

<style>
  .market-grid {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .item-card {
    display: grid;
    gap: 16px;
    align-content: space-between;
    min-height: 190px;
  }

  .item-card p {
    margin: 0;
    color: #65747a;
  }

  .item-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
</style>
