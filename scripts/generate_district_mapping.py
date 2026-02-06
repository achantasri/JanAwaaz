#!/usr/bin/env python3
"""
Generate district mapping data for assembly constituencies.

Step 1: Scrape Wikipedia to get district for each assembly constituency
Step 2: Read India Post PIN code CSV to get PIN → district mapping
Step 3: Generate two JS data files:
  - Updated assemblyConstituencies.js with district field
  - pincodeDistricts.js mapping PIN codes to districts
"""

import csv
import json
import re
import urllib.request
import html as html_module
import os
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.join(SCRIPT_DIR, "..")

# State config: (state_code, state_name_in_app, num_acs, wikipedia_list_slug)
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
    """Fetch raw HTML from Wikipedia with retries."""
    url = f"https://en.wikipedia.org/wiki/{slug}"
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except Exception as e:
            if attempt < retries - 1:
                print(f"    Retry {attempt + 1}/{retries} for {slug}: {e}")
                time.sleep(2)
            else:
                print(f"  Failed to fetch {slug}: {e}")
                return None


def parse_cell(cell_html):
    """Parse a single table cell, extracting text and rowspan."""
    attrs_match = re.match(r'<t[hd]([^>]*)>', cell_html)
    attrs = attrs_match.group(1) if attrs_match else ''

    rowspan = 1
    rs_match = re.search(r'rowspan\s*=\s*["\']?(\d+)', attrs)
    if rs_match:
        rowspan = int(rs_match.group(1))

    # Extract text content
    # Remove the opening tag
    inner = re.sub(r'^<t[hd][^>]*>', '', cell_html)
    inner = re.sub(r'</t[hd]>$', '', inner)
    text = re.sub(r'<[^>]+>', '', inner).strip()
    text = html_module.unescape(text)
    # Remove footnote markers
    text = re.sub(r'\[\d+\]', '', text).strip()

    return text, rowspan


def extract_ac_districts(page_html, expected_count, state_name):
    """Extract AC number → district mapping from Wikipedia table.

    Tables typically have columns like:
    [Number, Name, Category/Reservation, District, Lok Sabha]

    The District column uses rowspan to span multiple ACs.
    """
    if not page_html:
        return {}

    # Find all table cells including their tags for proper rowspan parsing
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', page_html, re.DOTALL)

    results = {}  # ac_number -> district
    name_to_district = {}  # ac_name -> district (for tables without numbers)
    carry = {}    # column_index -> (value, remaining_rows)
    district_col = None  # Auto-detect which column is the district
    header_detected = False

    for row_html in rows:
        # Find all cells in this row (both th and td)
        cells_raw = re.findall(r'<t[hd][^>]*>.*?</t[hd]>', row_html, re.DOTALL)

        # Build the full row by interleaving carried-over rowspan values
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

        # Detect header row to find district column
        # Check for header-like rows that contain "district" or "district(s)"
        # Must look like a proper table header (>=3 columns, has '#' or 'name' or 'constituency')
        lower_row = [c.lower() for c in full_row]
        if len(lower_row) >= 3:
            district_header_idx = None
            has_header_markers = any(
                c in ('#', 'no', 'no.', 's.no', 'sl.no', 'sl. no.', 'sl. no')
                or 'name' in c or 'constituency' in c
                for c in lower_row
            )
            if has_header_markers:
                for ci, cell_text in enumerate(lower_row):
                    if cell_text.startswith('district'):
                        district_header_idx = ci
                        break
            if district_header_idx is not None:
                new_col = district_header_idx
                district_col = new_col
                header_detected = True
                carry = {}
                results = {}
                name_to_district = {}
                continue

        if district_col is None:
            continue

        # Check if first cell is a constituency number
        num_text = full_row[0].strip()
        has_number = re.match(r'^\d{1,3}$', num_text)

        if has_number:
            num = int(num_text)
            if num < 1 or num > expected_count + 5:
                continue

            # Get district from the known column
            if district_col < len(full_row):
                district = full_row[district_col].strip()
                # If comma-separated (e.g. "District1, District2"), take the first
                if ',' in district:
                    district = district.split(',')[0].strip()
                # Remove parenthetical info and "district" suffix
                district = re.sub(r'\s*\([^)]*\)\s*', '', district).strip()
                district = re.sub(r'\s+district$', '', district, flags=re.IGNORECASE).strip()
                district = re.sub(r'\s*\[\d+\]\s*', '', district).strip()
                if district and len(district) > 1 and not district.isdigit():
                    if district.upper() not in ('SC', 'ST', 'NONE', 'GEN', 'GENERAL'):
                        results[num] = district
        else:
            # Some tables don't have row numbers (e.g., Karnataka)
            # Use name_col (col 1) to find the constituency name,
            # and match by name to assign ac_number later
            if len(full_row) > district_col:
                name = full_row[1].strip() if len(full_row) > 1 else ''
                district = full_row[district_col].strip()
                if ',' in district:
                    district = district.split(',')[0].strip()
                district = re.sub(r'\s*\([^)]*\)\s*', '', district).strip()
                district = re.sub(r'\s+district$', '', district, flags=re.IGNORECASE).strip()
                district = re.sub(r'\s*\[\d+\]\s*', '', district).strip()
                if name and district and len(district) > 1 and not district.isdigit():
                    if district.upper() not in ('SC', 'ST', 'NONE', 'GEN', 'GENERAL', ''):
                        name_to_district[name] = district

    return results, name_to_district


def read_existing_assembly_data():
    """Read existing assemblyConstituencies.js to get current entries."""
    path = os.path.join(PROJECT_DIR, "src", "data", "assemblyConstituencies.js")
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    entries = []
    # Match both old format (without district) and new format (with district)
    for match in re.finditer(
        r'\{ id: "([^"]+)", name: \'([^\']*)\', state: \'([^\']*)\','
        r'(?:\s*district: \'([^\']*)\',)?\s*acNo: (\d+) \}',
        content
    ):
        entry = {
            'id': match.group(1),
            'name': match.group(2),
            'state': match.group(3),
            'acNo': int(match.group(5)),
        }
        if match.group(4):
            entry['district'] = match.group(4)
        entries.append(entry)
    return entries


def build_pincode_to_district():
    """Read the India Post CSV and build PIN → district mapping."""
    csv_path = os.path.join(SCRIPT_DIR, "pincode_full.csv")

    # State name mapping: PIN data uses ALL CAPS, our app uses Title Case
    state_map = {
        "ANDHRA PRADESH": "Andhra Pradesh",
        "ARUNACHAL PRADESH": "Arunachal Pradesh",
        "ASSAM": "Assam",
        "BIHAR": "Bihar",
        "CHHATTISGARH": "Chhattisgarh",
        "GOA": "Goa",
        "GUJARAT": "Gujarat",
        "HARYANA": "Haryana",
        "HIMACHAL PRADESH": "Himachal Pradesh",
        "JHARKHAND": "Jharkhand",
        "KARNATAKA": "Karnataka",
        "KERALA": "Kerala",
        "MADHYA PRADESH": "Madhya Pradesh",
        "MAHARASHTRA": "Maharashtra",
        "MANIPUR": "Manipur",
        "MEGHALAYA": "Meghalaya",
        "MIZORAM": "Mizoram",
        "NAGALAND": "Nagaland",
        "ODISHA": "Odisha",
        "PUNJAB": "Punjab",
        "RAJASTHAN": "Rajasthan",
        "SIKKIM": "Sikkim",
        "TAMIL NADU": "Tamil Nadu",
        "TELANGANA": "Telangana",
        "TRIPURA": "Tripura",
        "UTTAR PRADESH": "Uttar Pradesh",
        "UTTARAKHAND": "Uttarakhand",
        "WEST BENGAL": "West Bengal",
        "DELHI": "NCT of Delhi",
        "JAMMU AND KASHMIR": "Jammu & Kashmir",
        "PUDUCHERRY": "Puducherry",
    }

    pin_to_district = {}  # pin -> {district, state}

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pin = row['pincode'].strip()
            district = row['district'].strip().title()  # Normalize to Title Case
            state_raw = row['statename'].strip()
            state = state_map.get(state_raw)

            if not state or not pin or len(pin) != 6:
                continue

            # Use first occurrence (they should all be same district for same pin)
            if pin not in pin_to_district:
                pin_to_district[pin] = {'district': district, 'state': state}

    return pin_to_district


def normalize_district_name(name):
    """Normalize district name for matching across datasets."""
    name = name.upper().strip()
    # Remove common suffixes
    name = re.sub(r'\s+(DISTRICT|DIST)\.?$', '', name)
    # Normalize spacing
    name = re.sub(r'\s+', ' ', name)
    # Common alternate spellings
    replacements = {
        'AHMADABAD': 'AHMEDABAD',
        'BANGALORE URBAN': 'BENGALURU URBAN',
        'BANGALORE RURAL': 'BENGALURU RURAL',
        'BELLARY': 'BALLARI',
        'BIJAPUR': 'VIJAYAPURA',
        'GULBARGA': 'KALABURAGI',
        'MYSORE': 'MYSURU',
        'SHIMOGA': 'SHIVAMOGGA',
        'TUMKUR': 'TUMAKURU',
        'RAICHUR': 'RAICHUR',
        'BELGAUM': 'BELAGAVI',
        'MANGALORE': 'DAKSHINA KANNADA',
        'PONDICHERRY': 'PUDUCHERRY',
        'BANAS KANTHA': 'BANASKANTHA',
        'SABAR KANTHA': 'SABARKANTHA',
        'PANCH MAHALS': 'PANCHMAHAL',
        'THE DANGS': 'DANG',
        'MAHESANA': 'MEHSANA',
        'KACHCHH': 'KUTCH',
        'BALESHWAR': 'BALASORE',
        'ANUGUL': 'ANGUL',
        'JAGATSINGHPUR': 'JAGATSINGHAPUR',
        'KEONJHAR': 'KENDUJHAR',
        'MAYURBHANJ': 'MAYURBHANJ',
        'SUBARNAPUR': 'SONEPUR',
        'BAUDH': 'BOUDH',
    }
    for old, new in replacements.items():
        if name == old:
            name = new
            break
    return name


def write_assembly_data_with_districts(entries, output_path):
    """Write updated assemblyConstituencies.js with district field."""
    states_count = {}
    for e in entries:
        states_count[e['state']] = states_count.get(e['state'], 0) + 1

    lines = [
        "// India's Vidhan Sabha (State Assembly) constituencies",
        "// Data compiled from Election Commission of India records",
        f"// Total: {len(entries)} constituencies across {len(states_count)} states/UTs",
        "",
        "const assemblyConstituencies = [",
    ]

    current_state = None
    for e in entries:
        if e['state'] != current_state:
            current_state = e['state']
            count = states_count[current_state]
            lines.append(f"  // {current_state} ({count})")

        name_esc = e['name'].replace("'", "\\'")
        district_esc = e.get('district', '').replace("'", "\\'")

        if district_esc:
            lines.append(
                f'  {{ id: "{e["id"]}", name: \'{name_esc}\', state: \'{e["state"]}\', '
                f'district: \'{district_esc}\', acNo: {e["acNo"]} }},'
            )
        else:
            lines.append(
                f'  {{ id: "{e["id"]}", name: \'{name_esc}\', state: \'{e["state"]}\', '
                f'acNo: {e["acNo"]} }},'
            )

    lines.append("];")
    lines.append("")
    lines.append("export default assemblyConstituencies;")
    lines.append("")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))

    print(f"Wrote {len(entries)} entries to {output_path}")


def write_pincode_district_map(pin_to_district, output_path):
    """Write compact PIN code → district mapping as JS file.

    Uses indexed format for compression:
    - districts: array of [district, state] pairs
    - pins: object mapping PIN code to district index

    Since many consecutive PIN codes map to the same district,
    we also check if simple object format is compact enough.
    """
    # Build district index
    districts = []
    district_to_idx = {}

    for pin in sorted(pin_to_district.keys()):
        data = pin_to_district[pin]
        key = f"{data['district']}|{data['state']}"
        if key not in district_to_idx:
            district_to_idx[key] = len(districts)
            districts.append((data['district'], data['state']))

    lines = [
        "// PIN code to district mapping (compact indexed format)",
        "// Source: India Post All India Pincode Directory",
        f"// {len(pin_to_district)} PIN codes, {len(districts)} unique districts",
        "",
        "// Districts: [name, state]",
        "const _d = [",
    ]

    for d, s in districts:
        d_esc = d.replace("'", "\\'")
        s_esc = s.replace("'", "\\'")
        lines.append(f"  ['{d_esc}','{s_esc}'],")

    lines.append("];")
    lines.append("")
    lines.append("// PIN code -> district index")
    lines.append("const _p = {")

    for pin in sorted(pin_to_district.keys()):
        data = pin_to_district[pin]
        key = f"{data['district']}|{data['state']}"
        idx = district_to_idx[key]
        lines.append(f"  {pin}:{idx},")

    lines.append("};")
    lines.append("")
    lines.append("// Lookup function: returns { district, state } or null")
    lines.append("export function lookupPinDistrict(pin) {")
    lines.append("  const idx = _p[pin];")
    lines.append("  if (idx === undefined) return null;")
    lines.append("  const [d, s] = _d[idx];")
    lines.append("  return { district: d, state: s };")
    lines.append("}")
    lines.append("")
    lines.append("export default { lookupPinDistrict };")
    lines.append("")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))

    size_kb = os.path.getsize(output_path) / 1024
    print(f"Wrote {len(pin_to_district)} PIN codes ({len(districts)} districts) to {output_path} ({size_kb:.0f} KB)")


def main():
    # Step 1: Read existing assembly data
    print("Reading existing assembly constituency data...")
    entries = read_existing_assembly_data()
    print(f"  Found {len(entries)} entries")

    # Step 2: Scrape Wikipedia for district data
    print("\nScraping Wikipedia for AC-to-district mappings...")

    state_entry_map = {}  # state -> {acNo -> entry}
    for e in entries:
        if e['state'] not in state_entry_map:
            state_entry_map[e['state']] = {}
        state_entry_map[e['state']][e['acNo']] = e

    total_with_district = 0
    total_without = 0

    for code, state, count, slug in STATES:
        print(f"\n  {state} ({count} ACs)...")
        page = fetch_wiki_page(slug)

        if not page:
            print(f"    Failed to fetch page")
            total_without += count
            continue

        ac_districts, name_districts = extract_ac_districts(page, count, state)

        # Match by name for tables without AC numbers
        if name_districts and state in state_entry_map:
            for ac_no, entry in state_entry_map[state].items():
                if ac_no not in ac_districts:
                    # Try fuzzy name match
                    name = entry['name']
                    if name in name_districts:
                        ac_districts[ac_no] = name_districts[name]
                    else:
                        # Try case-insensitive
                        name_lower = name.lower()
                        for wiki_name, dist in name_districts.items():
                            if wiki_name.lower() == name_lower:
                                ac_districts[ac_no] = dist
                                break

        print(f"    Found districts for {len(ac_districts)}/{count} ACs")

        if state in state_entry_map:
            for ac_no, entry in state_entry_map[state].items():
                if ac_no in ac_districts:
                    entry['district'] = ac_districts[ac_no]
                    total_with_district += 1
                else:
                    total_without += 1

        time.sleep(1)  # Be nice to Wikipedia

    print(f"\nDistrict coverage: {total_with_district}/{total_with_district + total_without} "
          f"({100 * total_with_district / (total_with_district + total_without):.1f}%)")

    # Step 3: Write updated assembly data
    output_ac = os.path.join(PROJECT_DIR, "src", "data", "assemblyConstituencies.js")
    write_assembly_data_with_districts(entries, output_ac)

    # Step 4: Build PIN → district mapping
    print("\nBuilding PIN code to district mapping...")
    pin_to_district = build_pincode_to_district()
    print(f"  Found {len(pin_to_district)} unique PIN codes")

    output_pin = os.path.join(PROJECT_DIR, "src", "data", "pincodeDistricts.js")
    write_pincode_district_map(pin_to_district, output_pin)

    # Step 5: Verify district name matching
    print("\nVerifying district name matching...")
    ac_districts = set()
    for e in entries:
        if 'district' in e:
            ac_districts.add(normalize_district_name(e['district']))

    pin_districts = set()
    for data in pin_to_district.values():
        pin_districts.add(normalize_district_name(data['district']))

    matching = ac_districts & pin_districts
    ac_only = ac_districts - pin_districts
    pin_only = pin_districts - ac_districts

    print(f"  AC districts: {len(ac_districts)}")
    print(f"  PIN districts: {len(pin_districts)}")
    print(f"  Matching: {len(matching)}")
    print(f"  AC only (no PIN match): {len(ac_only)}")
    if ac_only:
        for d in sorted(list(ac_only))[:20]:
            print(f"    {d}")
    print(f"  PIN only (no AC match): {len(pin_only)}")
    if pin_only:
        for d in sorted(list(pin_only))[:20]:
            print(f"    {d}")


if __name__ == "__main__":
    main()
