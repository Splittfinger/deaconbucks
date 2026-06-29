<script lang="ts">
  import { LogIn } from '@lucide/svelte';
  import { APP_NAME, DISCLAIMER } from '$lib/constants';

  export let data;
  export let form;
</script>

<section class="page auth-page">
  <div class="welcome">
    <span class="pill">QuorumPay</span>
    <h1>{APP_NAME}</h1>
    <p>
      Sign in with the login code and PIN your adult leader gave you. Keep the code simple,
      private, and activity-only.
    </p>
  </div>

  <form method="POST" class="panel stack">
    <div class="section-head">
      <div>
        <h2>Enter the Quorum</h2>
        <p class="fine-print">{data.disclaimer ?? DISCLAIMER}</p>
      </div>
    </div>

    {#if form?.message}
      <p class="message error">{form.message}</p>
    {/if}

    <label>
      Login code
      <input
        name="loginCode"
        autocomplete="username"
        autocapitalize="characters"
        value={form?.loginCode ?? ''}
        placeholder="DQ-SAM"
        required
      />
    </label>

    <label>
      PIN
      <input name="pin" type="password" inputmode="numeric" autocomplete="current-password" required />
    </label>

    <button type="submit">
      <LogIn size={18} />
      Sign in
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
    padding: 18px 0;
  }

  .welcome p {
    max-width: 56ch;
    margin: 0;
    color: #40535a;
    font-size: 1.05rem;
  }

  @media (min-width: 760px) {
    .auth-page {
      grid-template-columns: 1.1fr 0.9fr;
    }
  }
</style>
