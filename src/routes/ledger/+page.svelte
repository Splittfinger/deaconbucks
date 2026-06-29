<script lang="ts">
  import { ReceiptText } from '@lucide/svelte';
  import { LEDGER_NAME, RECEIPT_NAME } from '$lib/constants';
  import { formatBucks, formatDateTime, transactionLabel } from '$lib/format';

  export let data;
</script>

<section class="page stack">
  <div class="section-head">
    <div>
      <span class="pill">{RECEIPT_NAME}</span>
      <h1>{LEDGER_NAME}</h1>
      <p class="muted">A history of pretend activity-point entries for {data.user.displayName}.</p>
    </div>
    <ReceiptText size={32} />
  </div>

  <section class="panel flush">
    {#if data.transactions.length === 0}
      <div class="empty">
        <strong>No entries yet.</strong>
        <span class="fine-print">Deposits, transfers, and market purchases will appear here.</span>
      </div>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {#each data.transactions as tx}
              <tr>
                <td>{formatDateTime(tx.createdAt)}</td>
                <td>
                  <strong>{transactionLabel(tx.type)}</strong>
                  {#if tx.note}<div class="fine-print">{tx.note}</div>{/if}
                </td>
                <td>{tx.fromName || 'Storehouse'}</td>
                <td>{tx.toName || 'Storehouse'}</td>
                <td><strong>{formatBucks(tx.amount)}</strong></td>
                <td>{tx.receiptCode}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</section>

<style>
  .empty {
    display: grid;
    gap: 6px;
    padding: 22px;
  }
</style>
