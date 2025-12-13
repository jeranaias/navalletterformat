# Naval Letter Generator v2.0 - Data Sources Guide

## Overview

The v2.0 architecture requires two external JSON data files:
1. **ssic.json** - Standard Subject Identification Codes
2. **units.json** - Marine Corps and Navy unit addresses

---

## SSIC Data

### Source Document
**SECNAV M-5210.2** - Standard Subject Identification Code (SSIC) Manual

### Available Versions
| Version | Date | Pages | SSICs | Location |
|---------|------|-------|-------|----------|
| 2005 | Dec 2005 | 66 | ~450 | NPS.edu |
| 2012 | July 2012 | 95 | ~550 | Marines.mil |
| 2018 | Aug 2018 | 89 | ~550 | SECNAV.navy.mil (CAC) |

### Best Public Source
```
https://www.marines.mil/Portals/1/SECNAV%20M-5210.2.pdf
```
This is the July 2012 version, publicly accessible, ~550 SSICs.

### JSON Format Required
```json
{
  "source": "SECNAV M-5210.2 (July 2012)",
  "codes": [
    { "code": "1000", "title": "GENERAL MILITARY PERSONNEL RECORDS" },
    { "code": "1001", "title": "RESERVE POLICIES AND PROGRAMS" },
    { "code": "5216", "title": "CORRESPONDENCE MANAGEMENT" }
  ]
}
```

### Starter File Created
A starter `ssic.json` with ~300 codes has been created at:
```
/home/claude/data/ssic.json
```

To complete: Parse the full PDF and extract all ~550 codes.

---

## Unit Data

### Primary Source
**MCC/RUC List** - Monitored Command Code / Reporting Unit Code spreadsheet

### Available Sources

#### 1. MCC Codes Manual (Scribd - requires subscription)
```
https://www.scribd.com/doc/97035897/Copy-of-Mcc-Codes-Manual
```
Contains: MCC, RUC, UIC, Unit Name, Street Address, City, State, Zip

#### 2. MCC List 30 May 2013 (Scribd/CourseHero)
```
https://www.scribd.com/document/644658118/USMC-MCC-RUC-List-30-May-2013-xls
https://www.coursehero.com/file/46035433/MCC-List-30-May-2013-1xls/
```
Excel format with ~2000+ units

#### 3. SNDL - Standard Naval Distribution List (Official, CAC required)
```
https://www.secnav.navy.mil/doni/sndl.aspx
```
The authoritative source for all Navy/Marine Corps units

#### 4. Marines.mil Unit Directory (Dynamic, no download)
```
https://www.marines.mil/The-Corps/Units/
```
Current unit list but requires scraping

### JSON Format Required
```json
{
  "source": "MCC/RUC List",
  "units": [
    {
      "name": "Headquarters Marine Corps",
      "abbrev": "HQMC",
      "mcc": "00054",
      "address": "3000 MARINE CORPS PENTAGON\nWASHINGTON, DC 20350-3000",
      "type": "headquarters"
    },
    {
      "name": "1st Marine Division",
      "abbrev": "1st MarDiv",
      "mcc": "00011",
      "address": "BOX 555520\nCAMP PENDLETON, CA 92055-5520",
      "type": "division"
    }
  ]
}
```

### Starter File Created
A starter `units.json` with ~80 major units has been created at:
```
/home/claude/data/units.json
```

To complete: 
1. Obtain MCC spreadsheet from Scribd or internal source
2. Convert Excel to JSON
3. Clean up addresses for correspondence format

---

## Data Acquisition Options

### Option A: Manual Extraction (Time: 4-6 hours)
1. Download SECNAV M-5210.2 PDF from Marines.mil
2. Parse PDF pages 24-95 for all SSICs
3. Use OCR/regex to extract code-title pairs
4. Manual cleanup of any parsing errors

### Option B: Use Starter Files + Incremental Updates (Recommended)
1. Use provided starter files as base
2. Add codes/units as users report missing ones
3. Accept community contributions via GitHub issues

### Option C: Request from Admin Personnel
If Jesse has access to:
- MOL (Marine Online)
- MCTFS (Marine Corps Total Force System)
- Unit diary clerk

These systems have complete, current unit data.

---

## Data File Locations in v2.0

```
naval-letter-generator/
├── data/
│   ├── ssic.json        # All SSIC codes
│   └── units.json       # All unit addresses
├── dist/
│   └── naval-letter.html  # Built version with data embedded
```

The build script will inline both JSON files into the single-file distribution.

---

## Sample Data Extraction Script

If you obtain the MCC Excel file, use this to convert:

```javascript
// convert-mcc-to-json.js
const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('MCC_List.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const units = data.map(row => ({
  name: row['UNIT NAME'] || '',
  mcc: String(row['MCC'] || '').padStart(5, '0'),
  ruc: row['RUC'] || '',
  uic: row['UIC'] || '',
  address: [
    row['STREET ADDRESS'],
    `${row['CITY']}, ${row['STATE']} ${row['ZIPCODE']}`
  ].filter(Boolean).join('\n'),
  type: inferType(row['UNIT NAME'])
})).filter(u => u.name && u.address);

function inferType(name) {
  if (/HQMC|HEADQUARTERS/i.test(name)) return 'headquarters';
  if (/DIV|DIVISION/i.test(name)) return 'division';
  if (/MAW|WING/i.test(name)) return 'wing';
  if (/MLG|LOGISTICS GROUP/i.test(name)) return 'mlg';
  if (/MEU/i.test(name)) return 'meu';
  if (/MCB|MCAS|MCLB|MCRD/i.test(name)) return 'base';
  if (/BN|BATTALION/i.test(name)) return 'battalion';
  if (/CO|COMPANY/i.test(name)) return 'company';
  if (/REGT|REGIMENT|MARINES$/i.test(name)) return 'regiment';
  return 'other';
}

fs.writeFileSync('units.json', JSON.stringify({ 
  source: 'MCC/RUC List',
  units 
}, null, 2));

console.log(`Exported ${units.length} units`);
```

---

## Verification

After importing data, verify these critical units exist:

### SSIC Verification
- [ ] 1000 - Military Personnel
- [ ] 3000 - Operations and Readiness
- [ ] 4000 - Logistics
- [ ] 5216 - Correspondence Management
- [ ] 7000 - Financial Management

### Unit Verification
- [ ] HQMC - Headquarters Marine Corps
- [ ] I MEF / II MEF / III MEF
- [ ] 1st/2nd/3rd Marine Division
- [ ] MCB Camp Pendleton
- [ ] MCB Camp Lejeune
- [ ] TBS - The Basic School
- [ ] DLI - Defense Language Institute

---

## Notes for Jesse

Since you're at DLI, you likely have access to:
1. **MCTFS** - Has complete unit roster
2. **MOL** - Marine Online has unit lookup
3. **S-1/Admin** - Unit diary clerks have MCC manuals

The MCC spreadsheet is updated periodically and distributed internally. If you can get a current copy, we can have complete, accurate data.

The starter files I've created cover:
- ~300 SSICs (most commonly used)
- ~80 major units (all headquarters, divisions, bases, schools)

This is sufficient for 90%+ of correspondence needs. Missing codes can be added incrementally.
