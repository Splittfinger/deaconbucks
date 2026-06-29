<script lang="ts">
  import {
    Banknote,
    Download,
    FileClock,
    KeyRound,
    Plus,
    Printer,
    ReceiptText,
    RefreshCcw,
    Shield,
    Store,
    UserPlus,
    Users,
    XCircle
  } from '@lucide/svelte';
  import {
    ADJUSTMENT_NAME,
    ADMIN_NAME,
    ART_NOTICE,
    ART_SOURCES,
    AUDIT_NAME,
    DISCLAIMER,
    LEDGER_NAME,
    MARKET_NAME,
    MERCHANT_NAME,
    RECEIPT_NAME
  } from '$lib/constants';
  import { formatBucks, formatDateTime, transactionLabel } from '$lib/format';

  export let data;
  export let form;
</script>

<section class="page stack vault-page">
  <div class="section-head no-print">
    <div>
      <span class="pill">{ADMIN_NAME}</span>
      <h1>{ADMIN_NAME}</h1>
      <p class="muted">{DISCLAIMER}</p>
    </div>
    <Shield size={34} />
  </div>

  <figure class="art-banner no-print">
    <img src="/art/the-liahona.jpg" alt="The Liahona" />
    <figcaption>
      <a href={ART_SOURCES.liahona}>The Liahona</a> from Gospel Media. {ART_NOTICE}
    </figcaption>
  </figure>

  {#if form?.message}
    <p class:message={true} class:error={!form.ok}>{form.message}</p>
  {/if}

  {#if form?.bills}
    <section class="panel stack print-panel">
      <div class="section-head no-print">
        <div>
          <h2>Printable Deacon Bucks</h2>
          <p class="fine-print">Use browser print for the newly minted bills.</p>
        </div>
        <button type="button" on:click={() => print()}>
          <Printer size={18} />
          Print
        </button>
      </div>
      <div class="bill-sheet">
        {#each form.bills as bill}
          <article class="play-bill">
            <div>
              <span class="bill-kicker">Liahona Ledger</span>
              <strong>{formatBucks(bill.amount)}</strong>
              <span>{MERCHANT_NAME}</span>
            </div>
            <img src={`/qr/${bill.serial}`} alt={`QR code for ${bill.serial}`} />
            <footer>
              <span>{bill.serial}</span>
              <small>{DISCLAIMER}</small>
            </footer>
          </article>
        {/each}
      </div>
    </section>
  {/if}

  <div class="vault-grid no-print">
    <section class="panel stack">
      <div class="section-head">
        <div>
          <h2>Create account</h2>
          <p class="fine-print">Use display names only. No email, phone, photo, birth date, or address.</p>
        </div>
        <UserPlus size={24} />
      </div>
      <form method="POST" action="?/createUser" class="stack">
        <label>
          Display name
          <input name="displayName" placeholder="Sam A." required />
        </label>
        <label>
          Login code
          <input name="loginCode" placeholder="DQ-SAM" autocapitalize="characters" required />
        </label>
        <label>
          Temporary PIN
          <input name="pin" type="password" inputmode="numeric" autocomplete="new-password" required />
        </label>
        <label>
          Role
          <select name="role">
            <option value="DEACON">Deacon</option>
            <option value="ADMIN">Adult Leader</option>
          </select>
        </label>
        <button type="submit">
          <Plus size={18} />
          Create
        </button>
      </form>
    </section>

    <section class="panel stack">
      <div class="section-head">
        <div>
          <h2>Merchant account</h2>
          <p class="fine-print">Create another pretend store or activity merchant.</p>
        </div>
        <Store size={24} />
      </div>
      <form method="POST" action="?/createMerchant" class="stack">
        <label>
          Display name
          <input name="displayName" placeholder="Camp Snack Table" required />
        </label>
        <button type="submit">
          <Plus size={18} />
          Create merchant
        </button>
      </form>
    </section>

    <section class="panel stack">
      <div class="section-head">
        <div>
          <h2>Reset PIN</h2>
          <p class="fine-print">The user will choose a new PIN at next sign-in.</p>
        </div>
        <KeyRound size={24} />
      </div>
      <form method="POST" action="?/resetPin" class="stack">
        <label>
          User
          <select name="userId" required>
            {#each data.users as user}
              <option value={user.id}>{user.displayName} ({user.loginCode})</option>
            {/each}
          </select>
        </label>
        <label>
          Temporary PIN
          <input name="pin" type="password" inputmode="numeric" autocomplete="new-password" required />
        </label>
        <button type="submit">
          <RefreshCcw size={18} />
          Reset
        </button>
      </form>
    </section>
  </div>

  <div class="vault-grid no-print">
    <section class="panel stack">
      <div class="section-head">
        <div>
          <h2>Mint bills</h2>
          <p class="fine-print">Printable serialized fake cash bills with QR deposit links.</p>
        </div>
        <Banknote size={24} />
      </div>
      <form method="POST" action="?/mintBills" class="stack">
        <label>
          Bill amount
          <input name="amount" type="number" inputmode="numeric" min="1" max="500" value="5" required />
        </label>
        <label>
          Count
          <input name="count" type="number" inputmode="numeric" min="1" max="60" value="8" required />
        </label>
        <label>
          Batch label
          <input name="batchLabel" placeholder="June activity" />
        </label>
        <button type="submit">
          <Banknote size={18} />
          Mint
        </button>
      </form>
    </section>

    <section class="panel stack">
      <div class="section-head">
        <div>
          <h2>Void bill</h2>
          <p class="fine-print">Only undeposited bills can be voided.</p>
        </div>
        <XCircle size={24} />
      </div>
      <form method="POST" action="?/voidBill" class="stack">
        <label>
          Bill serial
          <input name="serial" autocapitalize="characters" placeholder="DB-20260628-8M2K7D" required />
        </label>
        <button type="submit" class="warn">
          <XCircle size={18} />
          Void
        </button>
      </form>
    </section>

    <section class="panel stack">
      <div class="section-head">
        <div>
          <h2>{ADJUSTMENT_NAME}</h2>
          <p class="fine-print">Adult-only correction entry in the ledger.</p>
        </div>
        <FileClock size={24} />
      </div>
      <form method="POST" action="?/correction" class="stack">
        <label>
          Account
          <select name="accountId" required>
            {#each data.accounts as account}
              <option value={account.id}>{account.displayName} ({account.accountCode})</option>
            {/each}
          </select>
        </label>
        <label>
          Direction
          <select name="direction">
            <option value="CREDIT">Credit</option>
            <option value="DEBIT">Debit</option>
          </select>
        </label>
        <label>
          Amount
          <input name="amount" type="number" inputmode="numeric" min="1" max="10000" required />
        </label>
        <label>
          Note
          <input name="note" placeholder="Attendance correction" />
        </label>
        <button type="submit">
          <FileClock size={18} />
          Record
        </button>
      </form>
    </section>
  </div>

  <section class="panel stack no-print">
    <div class="section-head">
      <div>
        <h2>{MARKET_NAME}</h2>
        <p class="fine-print">Add or update pretend store items.</p>
      </div>
      <Store size={24} />
    </div>

    <form method="POST" action="?/saveItem" class="inline-form">
      <input name="name" placeholder="Treat coupon" aria-label="Item name" required />
      <input name="description" placeholder="Description" aria-label="Description" />
      <input name="price" type="number" min="1" max="10000" placeholder="Price" aria-label="Price" required />
      <input name="sortOrder" type="number" value="0" aria-label="Sort order" />
      <label class="check-label">
        <input name="active" type="checkbox" checked />
        Active
      </label>
      <button type="submit">
        <Plus size={18} />
        Save
      </button>
    </form>

    {#if data.items.length > 0}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Active</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {#each data.items as item}
              <tr>
                <td>
                  <form id={`item-${item.id}`} method="POST" action="?/saveItem" class="item-edit">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input name="name" value={item.name} aria-label="Item name" />
                    <input name="description" value={item.description ?? ''} aria-label="Description" />
                    <input name="sortOrder" type="number" value={item.sortOrder} aria-label="Sort order" />
                  </form>
                </td>
                <td>
                  <input form={`item-${item.id}`} name="price" type="number" min="1" value={item.price} aria-label="Price" />
                </td>
                <td>
                  <input form={`item-${item.id}`} name="active" type="checkbox" checked={item.active === 1} aria-label="Active" />
                </td>
                <td>
                  <button form={`item-${item.id}`} type="submit" class="secondary">
                    <RefreshCcw size={18} />
                    Update
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>

  <section class="panel stack no-print">
    <div class="section-head">
      <div>
        <h2>Accounts</h2>
        <p class="fine-print">Quorum Wallet and merchant balances.</p>
      </div>
      <div class="button-row">
        <a class="button secondary" href="/admin/export?kind=accounts">
          <Download size={18} />
          CSV
        </a>
        <a class="button secondary" href="/admin/export?kind=users">
          <Download size={18} />
          Users
        </a>
        <Users size={24} />
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Kind</th>
            <th>Status</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {#each data.accounts as account}
            <tr>
              <td>{account.displayName}</td>
              <td>{account.accountCode}</td>
              <td>{account.kind}</td>
              <td>{account.status}</td>
              <td><strong>{formatBucks(account.balance)}</strong></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="panel stack no-print">
    <div class="section-head">
      <div>
        <h2>Bill register</h2>
        <p class="fine-print">Recent minted, deposited, and voided serials.</p>
      </div>
      <div class="button-row">
        <a class="button secondary" href="/admin/export?kind=bills">
          <Download size={18} />
          CSV
        </a>
        <Banknote size={24} />
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Serial</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Batch</th>
            <th>Deposited by</th>
          </tr>
        </thead>
        <tbody>
          {#each data.bills as bill}
            <tr>
              <td>{bill.serial}</td>
              <td>{formatBucks(bill.amount)}</td>
              <td>{bill.status}</td>
              <td>{bill.batchLabel || 'None'}</td>
              <td>{bill.depositedBy || 'Not deposited'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="panel stack no-print">
    <div class="section-head">
      <div>
        <h2>{LEDGER_NAME}</h2>
        <p class="fine-print">Full recent ledger for adult leaders.</p>
      </div>
      <div class="button-row">
        <a class="button secondary" href="/admin/export?kind=transactions">
          <Download size={18} />
          CSV
        </a>
        <ReceiptText size={24} />
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>{RECEIPT_NAME}</th>
          </tr>
        </thead>
        <tbody>
          {#each data.transactions as tx}
            <tr>
              <td>{formatDateTime(tx.createdAt)}</td>
              <td>{transactionLabel(tx.type)}</td>
              <td>{tx.fromName || 'Storehouse'}</td>
              <td>{tx.toName || 'Storehouse'}</td>
              <td>{formatBucks(tx.amount)}</td>
              <td>{tx.receiptCode}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="panel stack no-print">
    <div class="section-head">
      <div>
        <h2>{AUDIT_NAME}</h2>
        <p class="fine-print">Adult actions recorded for stewardship.</p>
      </div>
      <a class="button secondary" href="/admin/export?kind=audit">
        <Download size={18} />
        CSV
      </a>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Entity</th>
          </tr>
        </thead>
        <tbody>
          {#each data.audits as audit}
            <tr>
              <td>{formatDateTime(audit.createdAt)}</td>
              <td>{audit.actorName || 'System'}</td>
              <td>{audit.action}</td>
              <td>{audit.entityType} {audit.entityId || ''}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</section>

<style>
  .vault-grid {
    display: grid;
    gap: 14px;
  }

  .inline-form {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr;
  }

  .check-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .check-label input,
  td input[type='checkbox'] {
    width: 18px;
    min-height: 18px;
  }

  .item-edit {
    display: grid;
    gap: 8px;
    min-width: 260px;
  }

  .bill-sheet {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .play-bill {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    min-height: 168px;
    border: 2px solid var(--color-navy);
    border-radius: 8px;
    background: #fffdf5;
    color: var(--color-navy);
    padding: 14px;
    page-break-inside: avoid;
  }

  .play-bill div {
    display: grid;
    align-content: center;
    gap: 5px;
  }

  .play-bill strong {
    font-size: 2.3rem;
    line-height: 1;
  }

  .play-bill img {
    width: 96px;
    height: 96px;
    align-self: center;
  }

  .play-bill footer {
    grid-column: 1 / -1;
    display: grid;
    gap: 3px;
    border-top: 1px solid var(--color-line);
    padding-top: 8px;
    color: var(--color-muted);
  }

  .bill-kicker {
    font-weight: 900;
    text-transform: uppercase;
  }

  @media (min-width: 840px) {
    .vault-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .inline-form {
      grid-template-columns: 1fr 1.4fr 120px 90px 90px auto;
      align-items: end;
    }
  }

  @media print {
    .print-panel {
      border: 0;
      box-shadow: none;
      padding: 0;
    }

    .bill-sheet {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .play-bill {
      min-height: 180px;
    }
  }
</style>
