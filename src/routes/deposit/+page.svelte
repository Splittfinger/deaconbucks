<script lang="ts">
  import { Banknote, QrCode } from '@lucide/svelte';
  import { DEPOSIT_NAME, DISCLAIMER } from '$lib/constants';

  export let data;
  export let form;
</script>

<section class="page narrow stack">
  <div>
    <span class="pill">QR bill scan</span>
    <h1>{DEPOSIT_NAME}</h1>
    <p class="muted">{DISCLAIMER}</p>
  </div>

  <form method="POST" class="panel stack">
    <div class="section-head">
      <div>
        <h2>Deposit serialized bill</h2>
        <p class="fine-print">Check the serial on the printed bill before depositing.</p>
      </div>
      <QrCode size={24} />
    </div>

    {#if form?.message}
      <p class:message={true} class:error={!form.ok}>{form.message}</p>
    {/if}

    <label>
      Bill serial
      <input name="serial" value={data.serial} autocapitalize="characters" required />
    </label>

    <button type="submit">
      <Banknote size={18} />
      Deposit bill
    </button>
  </form>
</section>

<style>
  .narrow {
    max-width: 720px;
  }
</style>
