<script lang="ts">
  import { ShieldCheck } from '@lucide/svelte';
  import { APP_NAME, ART_NOTICE, ART_SOURCES, DISCLAIMER, MERCHANT_NAME } from '$lib/constants';

  export let form;
</script>

<section class="page auth-page">
  <div class="welcome">
    <span class="pill">First-run setup</span>
    <h1>{APP_NAME}</h1>
    <p>
      Create the first adult leader account. After this, public setup closes and all new
      Quorum Wallets are created in the Bishopric Vault.
    </p>
    <p class="fine-print">{DISCLAIMER}</p>
    <figure class="art-frame auth-art">
      <img src="/art/lehi-liahona.jpg" alt="Lehi showing the Liahona to his family" />
      <figcaption>
        <a href={ART_SOURCES.lehiLiahona}>Lehi showing the Liahona to his family</a> from Gospel Media.
        {ART_NOTICE}
      </figcaption>
    </figure>
  </div>

  <form method="POST" class="panel stack">
    <div class="section-head">
      <div>
        <h2>Bishopric Vault setup</h2>
        <p class="fine-print">
          This also creates the default merchant account: {MERCHANT_NAME}.
        </p>
      </div>
    </div>

    {#if form?.message}
      <p class="message error">{form.message}</p>
    {/if}

    <label>
      Display name
      <input name="displayName" value={form?.values?.displayName ?? ''} placeholder="Brother A." required />
    </label>

    <label>
      Login code
      <input
        name="loginCode"
        value={form?.values?.loginCode ?? ''}
        placeholder="LEADER-1"
        autocapitalize="characters"
        required
      />
    </label>

    <label>
      PIN
      <input name="pin" type="password" inputmode="numeric" autocomplete="new-password" required />
    </label>

    <button type="submit">
      <ShieldCheck size={18} />
      Create vault
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

  .auth-art {
    max-width: 580px;
  }

  @media (min-width: 760px) {
    .auth-page {
      grid-template-columns: 1.1fr 0.9fr;
    }
  }
</style>
