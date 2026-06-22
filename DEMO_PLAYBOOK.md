# Live Demo Playbook — 5 Payment Repair Examples

Each example is built to **(a)** be realistic, **(b)** demonstrate one clear lesson, and **(c)** finish in 1-2 minutes. The XML samples are deliberately small so the audience can read them on screen.

**Before every demo:** make sure **Repair Mode** is selected and Payment Format is `PACS.008`.

---

## Example 1 — Invalid Currency Code (the warm-up)

**What this shows:** The simplest, most common kind of fatal — a typo in a static field.

### Setup
- Repair Mode → Payment Format = PACS.008

### Paste this into the Prompt box

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>DB-HVP-20260622-001</MsgId>
      <CreDtTm>2026-06-22T09:15:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>E2E-20260622-001</EndToEndId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="EU">2500000.00</IntrBkSttlmAmt>
      <ChrgBr>SHAR</ChrgBr>
      <Dbtr><Nm>Siemens AG</Nm></Dbtr>
      <Cdtr><Nm>BMW Group</Nm></Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>
```

### Click sequence
1. **Repair Payment**
2. Wait for the diff (~2-3 sec)

### What the AI should do
- Change `Ccy="EU"` → `Ccy="EUR"`
- Leave everything else untouched

### What to say while it runs (~45 seconds)
> *"This is a 2.5 million euro payment that got rejected because the currency code says 'EU' instead of 'EUR'. ISO 4217 requires three letters. Today an operator opens the queue, scrolls through the XML, finds the bad field, types the fix, and resubmits. Let's see what the AI suggests."*

When the diff appears:
> *"One red line, one green line. The AI made the minimal change required. Everything else — the amount, the parties, the message ID — is untouched. The operator's job is now a visual approval instead of a hunt."*

### Why this is the warm-up
Sets the pattern. Quick, clear, easy win. Use it to anchor what the diff visualization means.

---

## Example 2 — Malformed BIC Code

**What this shows:** AI knowing format rules that aren't enumerated values — BIC codes are 8 or 11 characters, never anything else.

### Paste this

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>DB-HVP-20260622-002</MsgId>
      <CreDtTm>2026-06-22T10:42:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>CLRG</SttlmMtd></SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>E2E-20260622-002</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="USD">875000.00</IntrBkSttlmAmt>
      <ChrgBr>SHAR</ChrgBr>
      <Dbtr><Nm>Goldman Sachs Group</Nm></Dbtr>
      <Cdtr><Nm>JPMorgan Chase</Nm></Cdtr>
      <CdtrAgt>
        <FinInstnId>
          <BICFI>CHASUS33XXXX</BICFI>
        </FinInstnId>
      </CdtrAgt>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>
```

### Click sequence
1. **Repair Payment**
2. After the diff, click **Explain it to me**

### What the AI should do
- Trim `CHASUS33XXXX` (12 chars) → `CHASUS33XXX` (11 chars, valid)
- Explanation should mention the 8-or-11 character BIC rule

### What to say (~1:15)
> *"This is a US dollar payment to JPMorgan, but the creditor agent's BIC code has 12 characters. BICs are 8 characters for head office or 11 with a branch code — never 12. This is the kind of typo that's hard to catch by eye if you're scrolling fast."*

After the diff:
> *"AI dropped the extra X. Now let me show you the second value the tool adds — it can explain itself in plain English."*

Click **Explain it to me**. Read out the explanation. Land the message:
> *"This matters because the operator doesn't just get a fix — they get the reasoning. Which means juniors learn from it, and seniors can sanity-check the AI's logic before approving."*

---

## Example 3 — Invalid Charge Bearer Code

**What this shows:** AI knowing closed-set enumerations — ChrgBr only accepts four values.

### Paste this

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>DB-HVP-20260622-003</MsgId>
      <CreDtTm>2026-06-22T11:30:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>CLRG</SttlmMtd></SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>E2E-20260622-003</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="GBP">1250000.00</IntrBkSttlmAmt>
      <ChrgBr>SHARED</ChrgBr>
      <Dbtr><Nm>British Petroleum PLC</Nm></Dbtr>
      <Cdtr><Nm>Shell Trading International</Nm></Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>
```

### Click sequence
1. **Repair Payment**

### What the AI should do
- `ChrgBr>SHARED` → `ChrgBr>SHAR`

### What to say (~1:00)
> *"A 1.25 million pound payment. The Charge Bearer field says 'SHARED' — which is a real English word, and almost right, but PACS.008 only accepts four values: SHAR, DEBT, CRED, or SLEV. 'SHARED' is not in the list, so it fails validation."*

After the diff:
> *"This is the kind of fix where the operator's mental rule is 'I know it's almost right but I have to remember the exact code.' AI offloads that lookup."*

---

## Example 4 — Multi-Issue Payment (the centerpiece)

**What this shows:** AI handling multiple independent issues in one pass, **and** the Four Eye Check confirming nothing was missed.

### Paste this

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>DB-HVP-20260622-004</MsgId>
      <CreDtTm>2026-06-22T13:15:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>CLRG</SttlmMtd></SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>E2E-20260622-004</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="JP">15750000.00</IntrBkSttlmAmt>
      <ChrgBr>SHARED</ChrgBr>
      <Dbtr><Nm>Mitsubishi Corporation</Nm></Dbtr>
      <DbtrAgt>
        <FinInstnId>
          <BICFI>MHCBJPJT12</BICFI>
        </FinInstnId>
      </DbtrAgt>
      <Cdtr><Nm>Hyundai Motor Company</Nm></Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>
```

### Issues planted
1. `Ccy="JP"` — should be `JPY` (3-char ISO 4217)
2. `ChrgBr>SHARED` — should be `SHAR`
3. `BICFI>MHCBJPJT12` — 10 characters, should be 8 or 11

### Click sequence
1. **Repair Payment** — show the diff (3 red lines, 3 green lines)
2. **Four Eye Check** — show the confidence score and "no additional changes needed"
3. *(Optional, if time)* **Explain it to me** — show the multi-issue explanation

### What the AI should do
- Fix all three issues in one pass
- Four Eye Check returns high confidence (~90%+), confirms no remaining issues

### What to say (~2:30 — this is the showcase)
> *"Now let's look at something more realistic. Real fatal payments often have multiple issues stacked up. This is a payment from Mitsubishi to Hyundai — 15 million in what's supposed to be Japanese yen. Watch what happens."*

Click **Repair Payment**. After the diff:

> *"Three issues, three fixes, in one pass. The currency code, the charge bearer enum, and the BIC length. The operator can see all three changes at once."*

> *"But here's the question a Managing Director would rightly ask — how do we know the AI didn't miss something? That's what this button does."*

Click **Four Eye Check**.

> *"This runs the repaired payment back through the AI as an independent reviewer — a second pair of eyes. It returns a confidence score and explicitly lists any remaining issues. In this case, 92% confidence, no additional changes needed. Dual-control logic, built into the tool."*

### If Four Eye Check finds something extra
Even better — pivot live:
> *"And look — the second-pass AI just caught something the first one missed. That's exactly why four-eye review exists. This is also the kind of behavior we'd use to set confidence thresholds for auto-routing in a future version."*

---

## Example 5 — Subtle Country Code Issue

**What this shows:** AI catching the *non-obvious* errors that look right but aren't — and a natural way to talk about confidence scoring.

### Paste this

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>DB-HVP-20260622-005</MsgId>
      <CreDtTm>2026-06-22T14:50:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>CLRG</SttlmMtd></SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>E2E-20260622-005</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="GBP">3400000.00</IntrBkSttlmAmt>
      <ChrgBr>SHAR</ChrgBr>
      <Dbtr>
        <Nm>HSBC Holdings PLC</Nm>
        <PstlAdr>
          <Ctry>UK</Ctry>
        </PstlAdr>
      </Dbtr>
      <Cdtr>
        <Nm>Barclays Bank PLC</Nm>
        <PstlAdr>
          <Ctry>UK</Ctry>
        </PstlAdr>
      </Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>
```

### Click sequence
1. **Repair Payment**
2. **Explain it to me**

### What the AI should do
- Change both `Ctry>UK` → `Ctry>GB` (ISO 3166-1 alpha-2)
- Explanation references ISO 3166

### What to say (~1:30)
> *"Last one. This one looks fine to the untrained eye. HSBC to Barclays, both in the UK, three and a half million pounds. What's wrong with it?"*

*(Pause for effect — let the audience look. Most won't spot it.)*

> *"The country code says 'UK'. Which is what we'd write in an email, but ISO 3166 — the standard PACS.008 references — uses 'GB' for the United Kingdom. 'UK' isn't on the list. This is the kind of fatal that's a nightmare to spot manually because nothing about it looks wrong."*

After the diff:
> *"Two fields changed — both `Ctry` values from UK to GB. And the explanation tells the operator exactly why, with the standards reference."*

Optional landing:
> *"This is where the AI earns its keep. It's not the typo that bites you — it's the convention you didn't know existed."*

---

## Reset between demos

Between each demo:
- Clear the Prompt textarea (`Cmd+A` → `Delete`)
- Scroll back to the top of the page
- The previous Repaired Payment / Four Eye / Explanation sections stay visible — that's fine, they hide on next repair

---

## Backup plan if all five run long

If you're at 14:30 with two demos left, **skip Example 3** (charge bearer) — it's the smallest lesson. Example 4 (multi-issue) and Example 5 (country code) are the two that land the message best.

If you're at 13:00 with three left, skip 3 AND 5, just do the multi-issue centerpiece (4) and wrap. Better to land one example beautifully than rush through three.

---

## After all demos — landing line before Slide 7

> *"What you just saw is five repairs in about eight minutes. Today, each of those would take an operator anywhere from one to fifteen minutes depending on familiarity. The exciting part isn't any one fix — it's the consistency, the explainability, and the dual-control review built into every result."*
