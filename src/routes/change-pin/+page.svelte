<script lang="ts">
  import { KeyRound } from '@lucide/svelte';
  import { DISCLAIMER } from '$lib/constants';

  export let data;
  export let form;
</script>

<section class="page auth-page">
  <div class="welcome">
    <span class="pill">Quorum Wallet</span>
    <h1>Choose a New PIN</h1>
    <p>
      Hi {data.user.displayName}. Pick a 4 to 12 digit PIN for this activity wallet.
      Do not reuse a real banking, school, or device PIN.
    </p>
    <p class="fine-print">{DISCLAIMER}</p>
  </div>

  <form method="POST" class="panel stack">
    {#if form?.message}
      <p class="message error">{form.message}</p>
    {/if}

    <label>
      New PIN
      <input name="pin" type="password" inputmode="numeric" autocomplete="new-password" required />
    </label>

    <label>
      Confirm PIN
      <input name="confirmPin" type="password" inputmode="numeric" autocomplete="new-password" required />
    </label>

    <button type="submit">
      <KeyRound size={18} />
      Save PIN
    </button>
  </form>
</section>

<style>
  .auth-page {
    display: grid;
    gap: 18px;
    align-items: center;
    min-height: 72vh;
  }

  .welcome {
    display: grid;
    gap: 10px;
  }

  .welcome p {
    max-width: 58ch;
    margin: 0;
  }

  @media (min-width: 760px) {
    .auth-page {
      grid-template-columns: 1.1fr 0.9fr;
    }
  }
</style>
