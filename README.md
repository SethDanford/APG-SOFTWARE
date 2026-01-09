# Steel Composition Galvanizing Advisor

A lightweight, client-side tool that turns steel chemistry and fabrication details into galvanizing guidance drawn from GAA Advisory Note 35 and AS/NZS 4680 expectations.

## Inputs
- Chemical composition: Si (required), P (required), optional C/Mn/Al
- Product details: steel grade, thickness, fabrication method, surface profile
- Optional traceability: supplier, heat number, free-form fabrication notes

## Outputs
- Expected reactivity range (ULR/A/B/C/D) and appearance
- Likely conformity to AS/NZS 4680
- Notes on risks and practical process advice for the galvanizer
- Simple “Export summary (PDF)” via the browser’s print dialog

## Usage
Open `https://sethdanford.github.io/APG-SOFTWARE/` in a browser and enter the chemistry plus context. The advisory updates instantly on submit and can be printed or saved as PDF for handover to the galvanizer.
