# Demo Playbook — Comprehensive Payment Examples

A library of **21 examples** covering all 17 message types you support, with single-error and multi-error variations. Use it as a buffet — pick whatever fits the audience and time slot.

---

## Table of Contents

| # | Format | Example | Errors | Difficulty |
|---|--------|---------|--------|------------|
| 1 | pacs.008 STP | Invalid currency code | 1 | ⭐ |
| 2 | pacs.008 STP | Malformed BIC | 1 | ⭐ |
| 3 | pacs.008 STP | Multi-issue showcase | 3 | ⭐⭐⭐ |
| 4 | pacs.009 CORE | Settlement method enum | 1 | ⭐ |
| 5 | pacs.009 COV | Missing underlying transfer | 1 | ⭐⭐ |
| 6 | pacs.009 ADV | Advice missing settlement date | 1 | ⭐⭐ |
| 7 | pacs.010 | Direct debit BIC length | 1 | ⭐ |
| 8 | pacs.004 | Return missing original ref | 1 | ⭐⭐ |
| 9 | pacs.002 | Invalid status code | 1 | ⭐ |
| 10 | camt.056 | Invalid cancellation reason | 1 | ⭐⭐ |
| 11 | pain.001 | Country code wrong | 1 | ⭐ |
| 12 | pain.008 | Direct debit sequence type | 1 | ⭐⭐ |
| 13 | MT103 | Field 32A precision | 1 | ⭐ |
| 14 | MT103 | Multiple MT field errors | 3 | ⭐⭐⭐ |
| 15 | MT103+ | STP variant violation | 1 | ⭐⭐ |
| 16 | MT202 | Missing field 32A | 1 | ⭐ |
| 17 | MT202 COV | Missing underlying customer details | 2 | ⭐⭐ |
| 18 | MT204 | Invalid charge code | 1 | ⭐ |
| 19 | MT199 | Free-format reference malformed | 1 | ⭐ |
| 20 | MT999 | Block structure broken | 1 | ⭐⭐ |
| 21 | pacs.008 STP | Subtle country code (UK→GB) | 1 | ⭐⭐ |

**Recommended 8-minute demo set:** 1 → 2 → 3 → 14 → 21 (covers warm-up, format rules, multi-issue, MT, and subtle).

---

## How to use this playbook

### Pre-flight (5 minutes before)

1. Open the app (local: Edge with `--disable-web-security` + `python3 -m http.server 4800` in `dist/`)
2. **Settings**: confirm endpoint URL and bearer token are saved
3. **Repair Mode**: confirm the Payment Format dropdown has all 17 entries (if not, see PROMPTS.md)
4. **Repair Prompt Template** is loaded with the prompt from `PROMPTS.md` → Repair Mode prompt
5. **Chat Mode** has a System Instruction called `All Formats` with the Chat Mode prompt loaded
6. Run Example 1 silently as a smoke test
7. Browser zoom: **110% or 125%** so the audience can read the XML
8. Close all other tabs / notifications

### Universal demo flow per example

For each example, the rhythm is:

1. **Preface** (one or two sentences) — set the scene before pasting
2. **Select** the matching Payment Format from the dropdown
3. **Paste** the XML / MT message into the Prompt textarea
4. **Click Repair Payment**
5. *(2-3 sec wait)* Read the diff aloud
6. **(Optional)** Click *Explain it to me* or *Four Eye Check* to add depth
7. **Land the message** with one closing line

### Repair Mode vs Chat Mode

Same payload, different click target — try both for at least one example during the demo to show range:

- **Repair Mode** → returns corrected message → diff appears
- **Chat Mode** → returns structured markdown explanation listing every error

### Reset between examples

- Clear the Prompt textarea (`Cmd+A` → `Delete`)
- Scroll back to the top
- Previous diff / explanation sections stay visible but hide on next repair — that's fine

### Universal preface template

When you're not sure what to say, use this pattern:

> *"Here's a [FORMAT] message — a [BUSINESS DESCRIPTION] for [AMOUNT]. It got rejected. Watch what the AI catches."*

---

# SECTION A — pacs.008 STP (FI to FI Customer Credit Transfer)

The workhorse of cross-border payments. Most common fatal-payment format.

---

## Example 1 — Invalid Currency Code (the warm-up)

**Difficulty:** ⭐ | **Errors:** 1 (currency)

### Preface
> *"This is a 2.5 million euro payment from Siemens to BMW. It got rejected because of a currency code typo. Watch how fast the AI spots it."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **pacs.008 STP**

### Payload
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

### Planted errors
1. `Ccy="EU"` — should be `EUR` (ISO 4217 = 3 chars)

### Expected AI behaviour
- Changes `Ccy="EU"` → `Ccy="EUR"`
- Leaves everything else untouched

### Landing line
> *"One red line, one green line. Minimum change. Everything else preserved exactly."*

---

## Example 2 — Malformed BIC

**Difficulty:** ⭐ | **Errors:** 1 (BIC length)

### Preface
> *"USD payment to JPMorgan. The creditor agent's BIC code has 12 characters. BICs are 8 or 11, never anything else."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **pacs.008 STP**

### Payload
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

### Planted errors
1. `BICFI>CHASUS33XXXX` — 12 chars, should be 11 (`CHASUS33XXX`)

### Click sequence
1. Repair Payment
2. **Explain it to me** (show the rationale)

### Expected AI behaviour
- Trims to `CHASUS33XXX` (11 chars, valid)
- Explanation references the 8-or-11 character BIC rule (ISO 9362)

### Landing line
> *"The AI dropped the extra X. And it can explain itself — operators don't just get a fix, they get the reasoning."*

---

## Example 3 — Multi-Issue Payment (the centerpiece)

**Difficulty:** ⭐⭐⭐ | **Errors:** 3 (currency + charge bearer + BIC)

### Preface
> *"Real fatal payments often have multiple issues stacked up. This is a payment from Mitsubishi to Hyundai — 15 million in what's supposed to be Japanese yen. Watch what happens."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **pacs.008 STP**

### Payload
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

### Planted errors
1. `Ccy="JP"` — should be `JPY` (3-char ISO 4217)
2. `ChrgBr>SHARED` — should be `SHAR` (closed enumeration)
3. `BICFI>MHCBJPJT12` — 10 chars, should be 8 (`MHCBJPJT`) or 11

### Click sequence
1. Repair Payment — show the diff (3 reds, 3 greens)
2. **Four Eye Check** — confirm independent review
3. *(Optional)* **Explain it to me**

### Expected AI behaviour
- Fixes all three issues in one pass
- Four Eye Check returns high confidence (~90%+) and "no additional changes needed"

### Landing line
> *"Three issues, three fixes, in one pass. And the Four Eye Check just independently verified that nothing was missed. Dual-control logic built right into the tool."*

---

# SECTION B — pacs.009 Family (FI Credit Transfer)

Bank-to-bank transfers without an underlying customer (Core), with an underlying customer (Cover), or as informational advice (ADV).

---

## Example 4 — pacs.009 CORE: Invalid Settlement Method

**Difficulty:** ⭐ | **Errors:** 1 (SttlmMtd enum)

### Preface
> *"Interbank credit transfer of 50 million dollars between two correspondent banks. The settlement method field has the wrong value — there are only five valid codes."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **pacs.009 CORE**

### Payload
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.009.001.08">
  <FICdtTrf>
    <GrpHdr>
      <MsgId>DB-FI-20260622-009C</MsgId>
      <CreDtTm>2026-06-22T11:00:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLEAR</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>FI-E2E-20260622-009</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="USD">50000000.00</IntrBkSttlmAmt>
      <Dbtr><FinInstnId><BICFI>DEUTDEFF</BICFI></FinInstnId></Dbtr>
      <Cdtr><FinInstnId><BICFI>BOFAUS3N</BICFI></FinInstnId></Cdtr>
    </CdtTrfTxInf>
  </FICdtTrf>
</Document>
```

### Planted errors
1. `SttlmMtd>CLEAR` — should be `CLRG` (Settlement Method enum: INDA, INGA, COVE, CLRG, TDSO)

### Expected AI behaviour
- `CLEAR` → `CLRG`

### Landing line
> *"The operator's mental rule: 'I know it's clearing but I have to remember the four-letter code.' AI offloads that lookup."*

---

## Example 5 — pacs.009 COV: Missing Underlying Customer Transfer

**Difficulty:** ⭐⭐ | **Errors:** 1 (missing block — AI flags rather than invents)

### Preface
> *"This is a cover payment — a bank-to-bank transfer that backs an underlying customer payment. Cover payments are required to include the original customer credit transfer details, and this one doesn't."*

### Setup
- Mode: **Chat Mode** (best for this one — AI should *flag* rather than fabricate)
- System Instruction: **All Formats**

### Payload
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.009.001.08">
  <FICdtTrf>
    <GrpHdr>
      <MsgId>DB-COV-20260622-100</MsgId>
      <CreDtTm>2026-06-22T12:00:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>COVE</SttlmMtd></SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>COV-E2E-20260622-100</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="EUR">3200000.00</IntrBkSttlmAmt>
      <Dbtr><FinInstnId><BICFI>DEUTDEFF</BICFI></FinInstnId></Dbtr>
      <Cdtr><FinInstnId><BICFI>BNPAFRPP</BICFI></FinInstnId></Cdtr>
    </CdtTrfTxInf>
  </FICdtTrf>
</Document>
```

### Planted errors
1. Missing `UndrlygCstmrCdtTrf` block — pacs.009 COV requires the underlying customer credit transfer details

### Click sequence
1. **Send** (Chat Mode)

### Expected AI behaviour
- Flags the missing underlying transfer block
- Does NOT fabricate fake customer details
- Suggests the operator look up the original customer transfer

### Landing line
> *"The AI didn't invent fake customer details to fill the gap. That's the 'do not invent' principle in action — for safety, it tells the operator what's missing instead of guessing."*

---

## Example 6 — pacs.009 ADV: Missing Settlement Date

**Difficulty:** ⭐⭐ | **Errors:** 1 (missing IntrBkSttlmDt)

### Preface
> *"An advice message — informing the receiving bank that a credit will hit. Missing the settlement date, which is required for reconciliation."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **pacs.009 ADV**

### Payload
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.009.001.08">
  <FICdtTrf>
    <GrpHdr>
      <MsgId>DB-ADV-20260622-200</MsgId>
      <CreDtTm>2026-06-22T08:30:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>INDA</SttlmMtd></SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>ADV-E2E-20260622-200</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="CHF">7500000.00</IntrBkSttlmAmt>
      <Dbtr><FinInstnId><BICFI>UBSWCHZH</BICFI></FinInstnId></Dbtr>
      <Cdtr><FinInstnId><BICFI>CRESCHZZ</BICFI></FinInstnId></Cdtr>
    </CdtTrfTxInf>
  </FICdtTrf>
</Document>
```

### Planted errors
1. Missing `IntrBkSttlmDt` element — required for ADV reconciliation

### Expected AI behaviour
- AI either flags the missing field (Chat Mode) or attempts a safe default like today's date (Repair Mode — note the operator will need to verify)

### Landing line
> *"This is a case where the AI may flag rather than fix — settlement date isn't safe to guess. The operator has the last word."*

---

# SECTION C — pacs.010 (FI Direct Debit)

---

## Example 7 — pacs.010: BIC Length Error

**Difficulty:** ⭐ | **Errors:** 1 (BIC length)

### Preface
> *"A financial-institution direct debit. The debtor agent's BIC has 9 characters — that's neither 8 nor 11, so it's invalid."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **pacs.010**

### Payload
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.010.001.04">
  <FIDrctDbt>
    <GrpHdr>
      <MsgId>DB-FID-20260622-010</MsgId>
      <CreDtTm>2026-06-22T09:50:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>CLRG</SttlmMtd></SttlmInf>
    </GrpHdr>
    <CdtInstr>
      <PmtId><EndToEndId>FID-E2E-20260622-010</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="EUR">2200000.00</IntrBkSttlmAmt>
      <Cdtr><FinInstnId><BICFI>DEUTDEFF</BICFI></FinInstnId></Cdtr>
      <DrctDbtTxInf>
        <PmtId><EndToEndId>FID-E2E-20260622-010-A</EndToEndId></PmtId>
        <IntrBkSttlmAmt Ccy="EUR">2200000.00</IntrBkSttlmAmt>
        <Dbtr><FinInstnId><BICFI>SOGEFRPPX</BICFI></FinInstnId></Dbtr>
      </DrctDbtTxInf>
    </CdtInstr>
  </FIDrctDbt>
</Document>
```

### Planted errors
1. `BICFI>SOGEFRPPX` — 9 chars, should be 8 (`SOGEFRPP`) or 11

### Expected AI behaviour
- `SOGEFRPPX` → `SOGEFRPP` (drop the extra X to make it valid 8-char BIC)

---

# SECTION D — pacs.004 (Payment Return)

---

## Example 8 — pacs.004: Missing Original Transaction Reference

**Difficulty:** ⭐⭐ | **Errors:** 1 (missing required field)

### Preface
> *"A payment return. By definition this must reference the original transaction it's returning — and this one doesn't. Watch what the AI does when a required field is missing but uninventable."*

### Setup
- Mode: **Chat Mode** (recommended — AI should flag, not invent)
- System Instruction: **All Formats**

### Payload
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.004.001.09">
  <PmtRtr>
    <GrpHdr>
      <MsgId>DB-RTN-20260622-004</MsgId>
      <CreDtTm>2026-06-22T14:20:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>CLRG</SttlmMtd></SttlmInf>
    </GrpHdr>
    <TxInf>
      <RtrId>RTN-20260622-001</RtrId>
      <RtrdIntrBkSttlmAmt Ccy="EUR">450000.00</RtrdIntrBkSttlmAmt>
      <RtrRsnInf>
        <Rsn><Cd>AC03</Cd></Rsn>
      </RtrRsnInf>
    </TxInf>
  </PmtRtr>
</Document>
```

### Planted errors
1. Missing `OrgnlEndToEndId` (or `OrgnlTxId`) under `TxInf` — required for pacs.004

### Expected AI behaviour
- Chat Mode: flags the missing original transaction reference
- Suggests the operator retrieve it from the original payment record

### Landing line
> *"AI knows what it can fix and what it can't. Missing data that lives in a separate system isn't its job — it tells the operator clearly so they can go get it."*

---

# SECTION E — pacs.002 (Payment Status Report)

---

## Example 9 — pacs.002: Invalid Transaction Status Code

**Difficulty:** ⭐ | **Errors:** 1 (TxSts enum)

### Preface
> *"Status report on a recent payment. The status code field has the wrong value — pacs.002 only accepts specific codes."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **pacs.002**

### Payload
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.10">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>DB-STS-20260622-002</MsgId>
      <CreDtTm>2026-06-22T15:00:00</CreDtTm>
    </GrpHdr>
    <TxInfAndSts>
      <OrgnlEndToEndId>ORIG-E2E-20260620-999</OrgnlEndToEndId>
      <TxSts>SUCCESS</TxSts>
    </TxInfAndSts>
  </FIToFIPmtStsRpt>
</Document>
```

### Planted errors
1. `TxSts>SUCCESS` — should be `ACSC` (AcceptedSettlementCompleted) or similar valid TxSts code

### Expected AI behaviour
- `SUCCESS` → `ACSC`

### Landing line
> *"'SUCCESS' looks fine in English but pacs.002 uses four-letter status codes. ACSC for Settlement Completed, RJCT for Rejected, ACTC for Accepted Technical Validation, and so on. AI knows the list."*

---

# SECTION F — camt.056 (Cancellation Request)

---

## Example 10 — camt.056: Invalid Cancellation Reason Code

**Difficulty:** ⭐⭐ | **Errors:** 1 (CxlRsn enum)

### Preface
> *"A cancellation request — we're asking another bank to cancel a payment we already sent. The reason code isn't valid."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **camt.056**

### Payload
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.056.001.08">
  <FIToFIPmtCxlReq>
    <Assgnmt>
      <Id>CXL-ASSGN-20260622-056</Id>
      <CreDtTm>2026-06-22T16:00:00</CreDtTm>
    </Assgnmt>
    <Undrlyg>
      <TxInf>
        <CxlId>CXL-20260622-001</CxlId>
        <OrgnlEndToEndId>ORIG-E2E-20260621-555</OrgnlEndToEndId>
        <CxlRsnInf>
          <Rsn><Cd>WRONG_BANK</Cd></Rsn>
        </CxlRsnInf>
      </TxInf>
    </Undrlyg>
  </FIToFIPmtCxlReq>
</Document>
```

### Planted errors
1. `Cd>WRONG_BANK` — invalid; CancellationReason codes are 4-letter codes like CUST (customer request), DUPL (duplicate), FRAD (fraud), TECH (technical), UPAY (undue payment), AGNT (agent issue)

### Expected AI behaviour
- `WRONG_BANK` → most likely `AGNT` (agent-related) or possibly `CUST`
- *Note:* may legitimately ask for operator confirmation since "wrong bank" is ambiguous

---

# SECTION G — pain Family (Customer-Initiated)

---

## Example 11 — pain.001: Wrong Country Code

**Difficulty:** ⭐ | **Errors:** 1 (country code)

### Preface
> *"A customer credit transfer initiation — corporate to bank. Looks fine but the country code on the creditor address says 'UK', which isn't a valid ISO 3166 code."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **pain.001**

### Payload
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>DB-PAIN-20260622-001</MsgId>
      <CreDtTm>2026-06-22T08:00:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <InitgPty><Nm>Adidas AG</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-PAIN-001</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt><Dt>2026-06-23</Dt></ReqdExctnDt>
      <Dbtr><Nm>Adidas AG</Nm></Dbtr>
      <CdtTrfTxInf>
        <PmtId><EndToEndId>PAIN-E2E-001</EndToEndId></PmtId>
        <Amt><InstdAmt Ccy="GBP">125000.00</InstdAmt></Amt>
        <Cdtr>
          <Nm>Burberry Group PLC</Nm>
          <PstlAdr><Ctry>UK</Ctry></PstlAdr>
        </Cdtr>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>
```

### Planted errors
1. `Ctry>UK` — should be `GB` (ISO 3166-1 alpha-2)

### Expected AI behaviour
- `UK` → `GB`

### Landing line
> *"UK is what we'd write in an email. GB is what ISO 3166 actually says. AI catches what feels right but isn't."*

---

## Example 12 — pain.008: Invalid Sequence Type

**Difficulty:** ⭐⭐ | **Errors:** 1 (SeqTp enum)

### Preface
> *"A direct debit initiation. The sequence type field tells the receiving bank whether this is the first, recurring, final, or one-off debit. The value here is none of those."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **pain.008**

### Payload
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.08">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>DB-PAIN-20260622-008</MsgId>
      <CreDtTm>2026-06-22T08:15:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <InitgPty><Nm>Vodafone Group PLC</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>DD-PAIN-008</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <PmtTpInf>
        <SeqTp>FIRST_TIME</SeqTp>
      </PmtTpInf>
      <ReqdColltnDt>2026-06-25</ReqdColltnDt>
      <Cdtr><Nm>Vodafone Group PLC</Nm></Cdtr>
      <DrctDbtTxInf>
        <PmtId><EndToEndId>DD-E2E-008</EndToEndId></PmtId>
        <InstdAmt Ccy="EUR">450.00</InstdAmt>
        <Dbtr><Nm>Hans Schmidt</Nm></Dbtr>
      </DrctDbtTxInf>
    </PmtInf>
  </CstmrDrctDbtInitn>
</Document>
```

### Planted errors
1. `SeqTp>FIRST_TIME` — should be `FRST` (sequence types: FRST, RCUR, FNAL, OOFF)

### Expected AI behaviour
- `FIRST_TIME` → `FRST`

---

# SECTION H — MT103 (Single Customer Credit Transfer)

The most common legacy SWIFT payment format.

---

## Example 13 — MT103: Field 32A Precision Mismatch

**Difficulty:** ⭐ | **Errors:** 1 (currency precision in 32A)

### Preface
> *"An MT103 to Japan. JPY has no decimal places, but the amount field includes them — that's a fatal."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **MT103**

### Payload
```
{1:F01DEUTDEFFAXXX0000000000}{2:I103MHCBJPJTXXXXN}{3:{108:E2E20260622103}}{4:
:20:DBHVP20260622103
:23B:CRED
:32A:260622JPY8500000,00
:50K:/DE89370400440532013000
SIEMENS AG
WERNER-VON-SIEMENS STR 1
80333 MUNCHEN GERMANY
:59:/JP00MHCB001234567890123
SOFTBANK GROUP CORP
1-9-1 HIGASHI SHIMBASHI
MINATO-KU TOKYO JAPAN
:71A:SHA
-}
```

### Planted errors
1. `:32A:260622JPY8500000,00` — JPY has no decimals; should be `260622JPY8500000,` (or `260622JPY8500000`)

### Expected AI behaviour
- Removes the decimals: `260622JPY8500000,`

### Landing line
> *"JPY, KRW, HUF, CLP — none of these take decimals. Get it wrong, payment rejects. AI knows the precision rules per currency."*

---

## Example 14 — MT103: Multiple Field Errors (MT centerpiece)

**Difficulty:** ⭐⭐⭐ | **Errors:** 3 (charges code + bank operation code + field 32A currency)

### Preface
> *"A real MT103 with three issues. This is what a chunk of the daily fatal queue actually looks like — small mistakes that pile up."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **MT103**

### Payload
```
{1:F01DEUTDEFFAXXX0000000000}{2:I103CHASUS33XXXXN}{3:{108:E2E20260622104}}{4:
:20:DBHVP20260622104
:23B:CREDIT
:32A:260622US3450000,00
:50K:/DE89370400440532013000
BMW GROUP
PETUELRING 130
80788 MUNCHEN GERMANY
:59:/US12345678901234567890
TESLA INC
1 TESLA ROAD
AUSTIN TEXAS USA
:71A:SHARED
-}
```

### Planted errors
1. `:23B:CREDIT` — should be `CRED` (4-letter bank operation code)
2. `:32A:260622US3450000,00` — `US` is invalid currency code (should be `USD`)
3. `:71A:SHARED` — should be `SHA` (charge code enum: OUR, BEN, SHA)

### Click sequence
1. Repair Payment — show the diff
2. **Four Eye Check** — confirm clean
3. **Explain it to me**

### Expected AI behaviour
- `CREDIT` → `CRED`
- `US3450000,00` → `USD3450000,00`
- `SHARED` → `SHA`
- Four Eye Check returns high confidence

### Landing line
> *"Three fields, three independent fixes, one pass. And this is the legacy MT format — the AI handles both ISO 20022 XML and SWIFT MT text blocks with the same prompt."*

---

## Example 15 — MT103+: Non-STP Content Violation

**Difficulty:** ⭐⭐ | **Errors:** 1 (unstructured remittance disallowed in MT103+)

### Preface
> *"MT103+ is the straight-through-processing variant of MT103. It bans unstructured fields — everything must be machine-readable. This message has free-text remittance info, which violates the STP profile."*

### Setup
- Mode: **Chat Mode** (recommended — this is an explanation case)
- System Instruction: **All Formats**

### Payload
```
{1:F01DEUTDEFFAXXX0000000000}{2:I103BNPAFRPPXXXXN}{3:{119:STP}{108:E2E20260622105}}{4:
:20:DBHVP20260622105
:23B:CRED
:32A:260622EUR275000,00
:50K:/FR1420041010050500013M02606
LVMH MOET HENNESSY
22 AV MONTAIGNE 75008 PARIS FR
:59:/DE89370400440532013000
HUGO BOSS AG
DIESELSTRASSE 12 METZINGEN DE
:70:PAYMENT FOR JULY CONSULTING SERVICES AS PER OUR EMAIL THREAD WITH JEAN-LUC
:71A:SHA
-}
```

### Planted errors
1. Field `:70:` contains free-text — disallowed in MT103+ STP (must be structured codes only, e.g., `/RFB/INV-2026-0712`)

### Expected AI behaviour
- Chat Mode: explains the STP profile restriction, suggests a structured equivalent

### Landing line
> *"AI knows the difference between MT103 and MT103+. STP messages can't contain free-form text — that's the whole point. This is a subtle one humans miss all the time."*

---

# SECTION I — MT202 Family (FI to FI)

---

## Example 16 — MT202: Missing Mandatory Field 32A

**Difficulty:** ⭐ | **Errors:** 1 (missing 32A)

### Preface
> *"A general MT202 — bank-to-bank funds movement. Field 32A is the heart of the message — value date, currency, amount. It's missing."*

### Setup
- Mode: **Chat Mode** (recommended — AI flags rather than invents)
- System Instruction: **All Formats**

### Payload
```
{1:F01DEUTDEFFAXXX0000000000}{2:I202CITIUS33XXXXN}{3:{108:FI20260622202}}{4:
:20:DBFI20260622202
:21:DBFI20260622202REL
:58A:CITIUS33
-}
```

### Planted errors
1. Missing `:32A:` field — mandatory for MT202

### Expected AI behaviour
- Chat Mode: flags the missing 32A and explains its mandatory nature
- Does NOT invent an amount

---

## Example 17 — MT202 COV: Missing Underlying Customer Details

**Difficulty:** ⭐⭐ | **Errors:** 2 (missing 50a and 59a)

### Preface
> *"A cover payment between banks. By definition it backs an underlying customer transfer, so fields 50a (ordering customer) and 59a (beneficiary) are mandatory. Both are missing here."*

### Setup
- Mode: **Chat Mode**
- System Instruction: **All Formats**

### Payload
```
{1:F01DEUTDEFFAXXX0000000000}{2:I202BOFAUS3NXXXXN}{3:{119:COV}{108:COV20260622202}}{4:
:20:DBCOV20260622202
:21:DBCOV20260622202REL
:32A:260622USD9750000,00
:52A:DEUTDEFF
:57A:BOFAUS3N
:58A:CITIUS33
-}
```

### Planted errors
1. Missing `:50a:` (ordering customer)
2. Missing `:59a:` (beneficiary customer)

### Expected AI behaviour
- Chat Mode: flags both missing fields, explains MT202 COV's requirement to identify the underlying customer transfer
- Does NOT invent customer names or BICs

### Landing line
> *"Cover payments without underlying customer details break the audit trail. AI flags both gaps and tells the operator to retrieve them from the original MT103."*

---

# SECTION J — MT204, MT199, MT999

---

## Example 18 — MT204: Invalid Charge Code

**Difficulty:** ⭐ | **Errors:** 1 (71A enum)

### Preface
> *"An MT204 — financial markets direct debit. Charge code field uses an invalid value."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **MT204**

### Payload
```
{1:F01DEUTDEFFAXXX0000000000}{2:I204BOFAUS3NXXXXN}{3:{108:DD20260622204}}{4:
:20:DB204DD20260622
:19:1500000,00
:30:260622
:57A:BOFAUS3N
:58A:DEUTDEFF
:71A:OURS
-}
```

### Planted errors
1. `:71A:OURS` — should be `OUR` (charge code enum: OUR, BEN, SHA)

### Expected AI behaviour
- `OURS` → `OUR`

---

## Example 19 — MT199: Malformed Reference

**Difficulty:** ⭐ | **Errors:** 1 (field 20 format)

### Preface
> *"MT199 free-format message. The reference field is mandatory and can't start with a slash — but this one does."*

### Setup
- Mode: **Repair Mode**
- Payment Format: **MT199**

### Payload
```
{1:F01DEUTDEFFAXXX0000000000}{2:I199BNPAFRPPXXXXN}{3:{108:FF20260622199}}{4:
:20:/REF20260622199
:21:DBHVP20260622103
:79:PLEASE CONFIRM RECEIPT OF YOUR MT103
DATED 20260622 FOR EUR 275,000
REFERENCE DBHVP20260622103
THANK YOU
-}
```

### Planted errors
1. `:20:/REF20260622199` — leading slash not allowed in field 20

### Expected AI behaviour
- Drops the leading slash: `REF20260622199`

---

## Example 20 — MT999: Broken Block Structure

**Difficulty:** ⭐⭐ | **Errors:** 1 (block 4 trailer missing)

### Preface
> *"MT999 free-format message. The block structure is broken — block 4 doesn't have its closing trailer."*

### Setup
- Mode: **Chat Mode** (recommended — structural)
- System Instruction: **All Formats**

### Payload
```
{1:F01DEUTDEFFAXXX0000000000}{2:I999CHASUS33XXXXN}{3:{108:FF20260622999}}{4:
:20:DB999INQ001
:21:NONREF
:79:INQUIRY REGARDING SUSPECTED DUPLICATE SETTLEMENT
ON ACCOUNT 12345 FOR USD 50,000
PLEASE INVESTIGATE
```

### Planted errors
1. Block 4 not terminated — missing closing `-}` trailer

### Expected AI behaviour
- Chat Mode: flags the missing trailer
- Suggests adding `-}` on the line after the body

---

# SECTION K — Edge Cases

---

## Example 21 — pacs.008 STP: Subtle Country Code

**Difficulty:** ⭐⭐ | **Errors:** 1 (UK → GB, but it looks fine)

### Preface
> *"Last one. This one looks fine to the untrained eye. HSBC to Barclays, both in the UK, three and a half million pounds. What's wrong with it?"*

*(Pause for effect — let the audience look.)*

### Setup
- Mode: **Repair Mode**
- Payment Format: **pacs.008 STP**

### Payload
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
        <PstlAdr><Ctry>UK</Ctry></PstlAdr>
      </Dbtr>
      <Cdtr>
        <Nm>Barclays Bank PLC</Nm>
        <PstlAdr><Ctry>UK</Ctry></PstlAdr>
      </Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>
```

### Planted errors
1. Both `Ctry>UK` — should be `GB` (ISO 3166-1 alpha-2)

### Click sequence
1. Repair Payment
2. **Explain it to me**

### Expected AI behaviour
- Both `UK` → `GB`
- Explanation references ISO 3166

### Landing line
> *"This is where the AI earns its keep. It's not the typo that bites you — it's the convention you didn't know existed."*

---

# Suggested demo flows

### 5-minute lightning demo (3 examples)
1, 3, 21
→ Warm-up, multi-issue, subtle. Hits the big three messages in five minutes.

### 8-minute standard demo (5 examples — the one in PRESENTATION_PLAN.md)
1, 2, 4, 3, 21
→ Currency, BIC, settlement method, multi-issue, subtle.

### 12-minute deep dive (7 examples)
1, 3, 9, 14, 5, 17, 21
→ ISO XML, MT, missing-data flagging, structural issues.

### "Show me MT" demo (3 examples)
13, 14, 17
→ Pure SWIFT MT showcase.

### "Show me Chat Mode" demo (3 examples)
5, 8, 17
→ Cases where the AI flags rather than fixes — the "do not invent" principle.

---

# Common talking-point patterns

Patterns you can reuse across examples:

**For single-error fixes:**
> *"One red line, one green line. Minimum change. The operator's job is a visual approval, not a hunt."*

**For multi-error fixes:**
> *"N issues, N fixes, in one pass. And the operator sees them all at once instead of catching one and rerunning."*

**For enum errors (charge bearer, settlement method, status codes):**
> *"It's not that the operator doesn't know the rule — it's the lookup that's slow. AI offloads that."*

**For structural / missing-field errors:**
> *"AI knows what it can fix and what it can't. Missing data that lives elsewhere isn't its job — it tells the operator clearly so they can go get it."*

**For subtle errors (country code, BIC length):**
> *"It's not the typo that bites you — it's the convention you didn't know existed."*

**For Four Eye Check:**
> *"This runs the repaired payment back through the AI as an independent reviewer. Returns a confidence score, lists any remaining issues. Dual-control logic built into the tool."*

**For Explain It To Me:**
> *"Operators don't just get a fix — they get the reasoning. Which means juniors learn from it, and seniors can sanity-check the AI's logic before approving."*

---

# If a demo fails live

The deck has a screenshot of the diff result you can fall back to. Pivot line:
> *"What you'd be seeing right now is the AI returning the corrected payment in about 2-3 seconds with a red/green diff. Let me show you what the result looks like from a run earlier today."*

Then jump to Slide 7 ("Beyond the Repair") and finish the section without trying to re-run the demo.

---

# Backup plan if you run long

If you're at 14:30 with two demos left, skip the simplest remaining one. Always preserve the multi-issue centerpiece (3 or 14) and the subtle showcase (21). Those two land the message even if you cut everything else.

---

# After all demos — landing line before next slide

> *"What you just saw is N repairs in about eight minutes. Today, each of those would take an operator anywhere from one to fifteen minutes depending on familiarity. The exciting part isn't any one fix — it's the consistency, the explainability, and the dual-control review built into every result."*
