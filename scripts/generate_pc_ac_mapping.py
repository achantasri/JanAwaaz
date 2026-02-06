#!/usr/bin/env python3
"""
Generate Parliamentary Constituency → Assembly Constituency mapping.

Scrapes Wikipedia "List of constituencies of the X Legislative Assembly" pages
to extract which Lok Sabha (PC) constituency each Vidhan Sabha (AC) belongs to.

Output: src/data/pcToAcMapping.js
Maps our existing Lok Sabha constituency IDs to lists of Assembly constituency IDs.
"""

import re
import urllib.request
import html as html_module
import os
import time
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.join(SCRIPT_DIR, "..")

# State config: code, name, AC count, Wikipedia slug
STATES = [
    ("AP", "Andhra Pradesh", 175, "List_of_constituencies_of_the_Andhra_Pradesh_Legislative_Assembly"),
    ("AR", "Arunachal Pradesh", 60, "List_of_constituencies_of_the_Arunachal_Pradesh_Legislative_Assembly"),
    ("AS", "Assam", 126, "List_of_constituencies_of_the_Assam_Legislative_Assembly"),
    ("BR", "Bihar", 243, "List_of_constituencies_of_the_Bihar_Legislative_Assembly"),
    ("CG", "Chhattisgarh", 90, "List_of_constituencies_of_the_Chhattisgarh_Legislative_Assembly"),
    ("GA", "Goa", 40, "List_of_constituencies_of_the_Goa_Legislative_Assembly"),
    ("GJ", "Gujarat", 182, "List_of_constituencies_of_the_Gujarat_Legislative_Assembly"),
    ("HR", "Haryana", 90, "List_of_constituencies_of_the_Haryana_Legislative_Assembly"),
    ("HP", "Himachal Pradesh", 68, "List_of_constituencies_of_the_Himachal_Pradesh_Legislative_Assembly"),
    ("JH", "Jharkhand", 81, "List_of_constituencies_of_the_Jharkhand_Legislative_Assembly"),
    ("KA", "Karnataka", 224, "List_of_constituencies_of_the_Karnataka_Legislative_Assembly"),
    ("KL", "Kerala", 140, "List_of_constituencies_of_the_Kerala_Legislative_Assembly"),
    ("MP", "Madhya Pradesh", 230, "List_of_constituencies_of_the_Madhya_Pradesh_Legislative_Assembly"),
    ("MH", "Maharashtra", 288, "List_of_constituencies_of_the_Maharashtra_Legislative_Assembly"),
    ("MN", "Manipur", 60, "List_of_constituencies_of_the_Manipur_Legislative_Assembly"),
    ("ML", "Meghalaya", 60, "List_of_constituencies_of_the_Meghalaya_Legislative_Assembly"),
    ("MZ", "Mizoram", 40, "List_of_constituencies_of_the_Mizoram_Legislative_Assembly"),
    ("NL", "Nagaland", 60, "List_of_constituencies_of_the_Nagaland_Legislative_Assembly"),
    ("OD", "Odisha", 147, "List_of_constituencies_of_the_Odisha_Legislative_Assembly"),
    ("PB", "Punjab", 117, "List_of_constituencies_of_the_Punjab_Legislative_Assembly"),
    ("RJ", "Rajasthan", 200, "List_of_constituencies_of_the_Rajasthan_Legislative_Assembly"),
    ("SK", "Sikkim", 32, "List_of_constituencies_of_the_Sikkim_Legislative_Assembly"),
    ("TN", "Tamil Nadu", 234, "List_of_constituencies_of_the_Tamil_Nadu_Legislative_Assembly"),
    ("TS", "Telangana", 119, "List_of_constituencies_of_the_Telangana_Legislative_Assembly"),
    ("TR", "Tripura", 60, "List_of_constituencies_of_the_Tripura_Legislative_Assembly"),
    ("UP", "Uttar Pradesh", 403, "List_of_constituencies_of_Uttar_Pradesh_Legislative_Assembly"),
    ("UK", "Uttarakhand", 70, "List_of_constituencies_of_the_Uttarakhand_Legislative_Assembly"),
    ("WB", "West Bengal", 294, "List_of_constituencies_of_the_West_Bengal_Legislative_Assembly"),
    ("DL", "NCT of Delhi", 70, "List_of_constituencies_of_the_Delhi_Legislative_Assembly"),
    ("JK", "Jammu & Kashmir", 90, "List_of_constituencies_of_the_Jammu_and_Kashmir_Legislative_Assembly"),
    ("PY", "Puducherry", 30, "List_of_constituencies_of_the_Puducherry_Legislative_Assembly"),
]


def fetch_wiki_page(slug, retries=3):
    url = f"https://en.wikipedia.org/wiki/{slug}"
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except Exception as e:
            if attempt < retries - 1:
                print(f"    Retry {attempt + 1}: {e}")
                time.sleep(2)
            else:
                print(f"    FAILED: {e}")
                return None


def parse_cell(cell_html):
    attrs_match = re.match(r'<t[hd]([^>]*)>', cell_html)
    attrs = attrs_match.group(1) if attrs_match else ''
    rowspan = 1
    rs_match = re.search(r'rowspan\s*=\s*["\']?(\d+)', attrs)
    if rs_match:
        rowspan = int(rs_match.group(1))
    inner = re.sub(r'^<t[hd][^>]*>', '', cell_html)
    inner = re.sub(r'</t[hd]>$', '', inner)
    text = re.sub(r'<[^>]+>', '', inner).strip()
    text = html_module.unescape(text)
    text = re.sub(r'\[\d+\]', '', text).strip()
    return text, rowspan


def extract_ac_to_pc(page_html, expected_count):
    """Extract AC number → Lok Sabha constituency name mapping."""
    if not page_html:
        return {}

    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', page_html, re.DOTALL)
    results = {}  # ac_no -> pc_name
    carry = {}
    ls_col = None  # Column index of Lok Sabha constituency

    for row_html in rows:
        cells_raw = re.findall(r'<t[hd][^>]*>.*?</t[hd]>', row_html, re.DOTALL)

        full_row = []
        col_idx = 0
        cell_idx = 0
        while col_idx < 12:
            if col_idx in carry:
                val, remaining = carry[col_idx]
                full_row.append(val)
                remaining -= 1
                if remaining <= 0:
                    del carry[col_idx]
                else:
                    carry[col_idx] = (val, remaining)
                col_idx += 1
            elif cell_idx < len(cells_raw):
                text, rowspan = parse_cell(cells_raw[cell_idx])
                full_row.append(text)
                if rowspan > 1:
                    carry[col_idx] = (text, rowspan - 1)
                cell_idx += 1
                col_idx += 1
            else:
                break

        if len(full_row) < 3:
            continue

        # Detect header with Lok Sabha column
        lower_row = [c.lower() for c in full_row]
        if len(lower_row) >= 3:
            has_header_markers = any(
                c in ('#', 'no', 'no.', 's.no', 'sl.no', 'sl. no.', 'sl. no')
                or 'name' in c or 'constituency' in c
                for c in lower_row
            )
            if has_header_markers:
                new_ls_col = None
                for ci, cell_text in enumerate(lower_row):
                    if 'lok sabha' in cell_text or 'parliamentary' in cell_text:
                        new_ls_col = ci
                        break
                if new_ls_col is not None:
                    # Don't reset if we already have significant results
                    # (prevents second table headers from wiping good data)
                    if len(results) > 10:
                        # Skip this table, keep existing results
                        ls_col = None
                    else:
                        ls_col = new_ls_col
                        carry = {}
                        results = {}
                    continue

        if ls_col is None:
            continue

        # Extract AC number and PC name
        num_text = full_row[0].strip()
        if not re.match(r'^\d{1,3}$', num_text):
            continue

        num = int(num_text)
        if num < 1 or num > expected_count + 5:
            continue

        if ls_col < len(full_row):
            pc_name = full_row[ls_col].strip()
            # Clean up
            pc_name = re.sub(r'\s*\([^)]*\)\s*', '', pc_name).strip()
            pc_name = re.sub(r'\s*\[\d+\]\s*', '', pc_name).strip()
            if pc_name and len(pc_name) > 1 and not pc_name.isdigit():
                if pc_name.upper() not in ('SC', 'ST', 'NONE', 'GEN', 'GENERAL'):
                    results[num] = pc_name

    return results


def read_lok_sabha_data():
    """Read existing constituencies.js Lok Sabha data."""
    path = os.path.join(PROJECT_DIR, "src", "data", "constituencies.js")
    with open(path, 'r') as f:
        content = f.read()

    pcs = {}  # name -> id (e.g., "Araku" -> "AP-01")
    for match in re.finditer(
        r'\{ id: "([^"]+)", name: "([^"]+)", state: "([^"]+)"',
        content
    ):
        pc_id = match.group(1)
        pc_name = match.group(2)
        pcs[pc_name] = pc_id

    return pcs


def normalize_pc_name(name):
    """Normalize PC name for fuzzy matching."""
    name = name.strip()
    # Remove common suffixes
    name = re.sub(r'\s*\(SC\)$', '', name)
    name = re.sub(r'\s*\(ST\)$', '', name)
    # Remove leading numbers like "48 Hatkanangle"
    name = re.sub(r'^\d+\s+', '', name)
    # Normalize dashes (em dash, en dash → regular hyphen)
    name = name.replace('\u2013', '-').replace('\u2014', '-')
    return name


# Manual overrides for PC name mismatches between Wikipedia and our data
PC_NAME_ALIASES = {
    # Wikipedia name -> our constituency.js name
    'tiruvallur': 'thiruvallur',
    'kanniyakumari': 'kanyakumari',
    'kanchipuram': 'kancheepuram',
    'dharamapuri': 'dharmapuri',
    'viluppuram': 'villupuram',
    'davangere': 'davanagere',
    'udupi chikmagalur': 'udupi-chikmagalur',
    'vadakara': 'vatakara',
    'mandsour': 'mandsaur',
    'narmadapuram': 'hoshangabad',
    'bhubaneshwar': 'bhubaneswar',
    'palamu': 'palamau',
    'mahabubnagar': 'mahbubnagar',
    'peddapalli': 'peddapalle',
    'ayodhya': 'faizabad',
    'bagpat': 'baghpat',
    'hatkanangle': 'hatkanangale',
    'karauli-dholpur': 'karauli-dholpur',
    'anantnag - rajouri': 'anantnag-rajouri',
    'anantnag-rajouri': 'anantnag-rajouri',
    'bhiwani-mahendragarh': 'bhiwani-mahendragarh',
    # Assam: 2024 delimitation new names → old names in our data
    'guwahati': 'gauhati',
    'nagaon': 'nowgong',
    'kaziranga': 'kaliabor',
    'sonitpur': 'tezpur',
    'darrang-udalguri': 'mangaldoi',
    'diphu': 'autonomous district',
    # Uttar Pradesh
    'aonla': 'bareilly',
    # West Bengal
    'beharampore': 'baharampur',
    'berhampore': 'baharampur',
    'bardhaman-durgapur': 'bardhaman-durgapur',
    'jaynagar': 'joynagar',
}


def main():
    # Read existing Lok Sabha data for ID matching
    print("Reading Lok Sabha constituency data...")
    lok_sabha = read_lok_sabha_data()
    print(f"  Found {len(lok_sabha)} PCs")

    # Build reverse lookup: normalized name -> ID
    pc_name_to_id = {}
    for name, pc_id in lok_sabha.items():
        pc_name_to_id[name.lower()] = pc_id
        # Also add without common variations
        pc_name_to_id[normalize_pc_name(name).lower()] = pc_id

    # Scrape Wikipedia for AC → PC mapping
    print("\nScraping Wikipedia for AC→PC mappings...")

    # ac_no → pc_name per state
    all_ac_to_pc = {}  # (state_code, ac_no) -> pc_name

    for code, state, count, slug in STATES:
        print(f"\n  {state} ({count} ACs)...")
        page = fetch_wiki_page(slug)
        ac_to_pc = extract_ac_to_pc(page, count)
        print(f"    Found PC mapping for {len(ac_to_pc)}/{count} ACs")

        for ac_no, pc_name in ac_to_pc.items():
            all_ac_to_pc[(code, ac_no)] = pc_name

        time.sleep(1)

    # Build the mapping: PC ID -> [AC IDs]
    pc_to_ac = {}  # pc_id -> [ac_id, ...]
    unmatched_pcs = set()
    total_matched = 0
    total_unmatched = 0

    for (state_code, ac_no), pc_name in all_ac_to_pc.items():
        ac_id = f"{state_code}-AC-{ac_no:03d}"

        # Match PC name to our Lok Sabha ID
        pc_name_norm = normalize_pc_name(pc_name).lower()

        # Check alias first
        if pc_name_norm in PC_NAME_ALIASES:
            pc_name_norm = PC_NAME_ALIASES[pc_name_norm]

        pc_id = pc_name_to_id.get(pc_name_norm)

        if not pc_id:
            # Try partial match within the same state
            for name, pid in pc_name_to_id.items():
                if pid.startswith(state_code + '-') and (
                    name == pc_name_norm or
                    pc_name_norm in name or
                    name in pc_name_norm
                ):
                    pc_id = pid
                    break

        if pc_id:
            if pc_id not in pc_to_ac:
                pc_to_ac[pc_id] = []
            pc_to_ac[pc_id].append(ac_id)
            total_matched += 1
        else:
            unmatched_pcs.add((state_code, pc_name))
            total_unmatched += 1

    print(f"\n\nResults:")
    print(f"  PCs with AC mappings: {len(pc_to_ac)}")
    print(f"  ACs matched to PCs: {total_matched}")
    print(f"  ACs unmatched: {total_unmatched}")

    if unmatched_pcs:
        print(f"\n  Unmatched PC names ({len(unmatched_pcs)}):")
        for code, name in sorted(unmatched_pcs):
            print(f"    {code}: {name}")

    # Sort AC IDs within each PC
    for pc_id in pc_to_ac:
        pc_to_ac[pc_id].sort()

    # Write output
    output_path = os.path.join(PROJECT_DIR, "src", "data", "pcToAcMapping.js")

    lines = [
        "// Parliamentary Constituency → Assembly Constituency mapping",
        "// Each Lok Sabha PC ID maps to its constituent Vidhan Sabha AC IDs",
        f"// {len(pc_to_ac)} PCs mapped, {total_matched} ACs total",
        "",
        "const pcToAcMapping = {",
    ]

    for pc_id in sorted(pc_to_ac.keys()):
        ac_ids = pc_to_ac[pc_id]
        ac_str = ', '.join(f"'{a}'" for a in ac_ids)
        lines.append(f"  '{pc_id}': [{ac_str}],")

    lines.append("};")
    lines.append("")
    lines.append("export default pcToAcMapping;")
    lines.append("")

    with open(output_path, 'w') as f:
        f.write("\n".join(lines))

    size_kb = os.path.getsize(output_path) / 1024
    print(f"\nWrote {output_path} ({size_kb:.0f} KB)")

    # Verify: check average ACs per PC
    ac_counts = [len(v) for v in pc_to_ac.values()]
    if ac_counts:
        print(f"  ACs per PC: min={min(ac_counts)}, max={max(ac_counts)}, avg={sum(ac_counts)/len(ac_counts):.1f}")


if __name__ == "__main__":
    main()
