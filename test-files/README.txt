TEST FILES FOR NAVAL LETTER GENERATOR v3.1
==========================================

1. WORD/TEXT IMPORT TEST
------------------------
File: sample_letter.txt

How to test:
- Open the app at localhost:56166
- Drag sample_letter.txt onto the drop zone at the top
- Or click the drop zone and select the file
- The form should populate with:
  * SSIC: 1050
  * Date: 15 Dec 24
  * From: Commanding Officer, Marine Corps Detachment
  * To: Commandant of the Marine Corps (MMEA-25)
  * Via: Commanding General, Training and Education Command
  * Subject: REQUEST FOR ANNUAL LEAVE
  * References: MCO 1050.3J, Unit SOP 1050.1
  * Enclosures: Leave Request Form, Unit Manning Report
  * Paragraphs: 4 main paragraphs with 2 sub-paragraphs


2. BATCH GENERATION TEST
------------------------
File: batch_test.csv

How to test:
- First, fill out the form as a template:
  * Set From: "{{rank}} {{name}}"
  * Set Subject: "{{subject}}"
  * Set Date: "{{date}}"
  * Set SSIC: "{{ssic}}"
  * Add a paragraph: "Request leave for {{reason}} during the period {{period}}."
- Click "Batch Generate" button
- Upload batch_test.csv
- Preview should show 5 records
- Click "Generate All Letters"
- You'll download a ZIP with 5 PDFs


3. OTHER FEATURES TO TEST
-------------------------
- Spell Check: Toggle on in paragraph section, type "teh" to see highlight
- Char Count: Toggle on to see character/word counts
- Recently Used: Enter a From address, reload page, click From field
- Auto-format Refs: Add a reference, paste "MCO 1500.52A dtd 1 jan 24"
- Copy Text: Click "Copy Text" button, paste in notepad
- Word Export: Click "Download Word" to get .docx file
