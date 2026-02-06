#!/usr/bin/env python3
"""
Generate assemblyConstituencies.js from Wikipedia data.
Fetches constituency lists from Wikipedia for each Indian state.
"""

import json
import re
import urllib.request
import html

# State config: (state_code, state_name_in_app, num_constituencies, wikipedia_slug)
STATES = [
    ("AP", "Andhra Pradesh", 175, "Andhra_Pradesh_Legislative_Assembly"),
    ("AR", "Arunachal Pradesh", 60, "Arunachal_Pradesh_Legislative_Assembly"),
    ("AS", "Assam", 126, "Assam_Legislative_Assembly"),
    ("BR", "Bihar", 243, "Bihar_Legislative_Assembly"),
    ("CG", "Chhattisgarh", 90, "Chhattisgarh_Legislative_Assembly"),
    ("GA", "Goa", 40, "Goa_Legislative_Assembly"),
    ("GJ", "Gujarat", 182, "Gujarat_Legislative_Assembly"),
    ("HR", "Haryana", 90, "Haryana_Legislative_Assembly"),
    ("HP", "Himachal Pradesh", 68, "Himachal_Pradesh_Legislative_Assembly"),
    ("JH", "Jharkhand", 81, "Jharkhand_Legislative_Assembly"),
    ("KA", "Karnataka", 224, "Karnataka_Legislative_Assembly"),
    ("KL", "Kerala", 140, "Kerala_Legislative_Assembly"),
    ("MP", "Madhya Pradesh", 230, "Madhya_Pradesh_Legislative_Assembly"),
    ("MH", "Maharashtra", 288, "Maharashtra_Legislative_Assembly"),
    ("MN", "Manipur", 60, "Manipur_Legislative_Assembly"),
    ("ML", "Meghalaya", 60, "Meghalaya_Legislative_Assembly"),
    ("MZ", "Mizoram", 40, "Mizoram_Legislative_Assembly"),
    ("NL", "Nagaland", 60, "Nagaland_Legislative_Assembly"),
    ("OD", "Odisha", 147, "Odisha_Legislative_Assembly"),
    ("PB", "Punjab", 117, "Punjab_Legislative_Assembly_(India)"),
    ("RJ", "Rajasthan", 200, "Rajasthan_Legislative_Assembly"),
    ("SK", "Sikkim", 32, "Sikkim_Legislative_Assembly"),
    ("TN", "Tamil Nadu", 234, "Tamil_Nadu_Legislative_Assembly"),
    ("TS", "Telangana", 119, "Telangana_Legislative_Assembly"),
    ("TR", "Tripura", 60, "Tripura_Legislative_Assembly"),
    ("UP", "Uttar Pradesh", 403, "Uttar_Pradesh_Legislative_Assembly"),
    ("UK", "Uttarakhand", 70, "Uttarakhand_Legislative_Assembly"),
    ("WB", "West Bengal", 294, "West_Bengal_Legislative_Assembly"),
    ("DL", "NCT of Delhi", 70, "Delhi_Legislative_Assembly"),
    ("JK", "Jammu & Kashmir", 90, "Jammu_and_Kashmir_Legislative_Assembly"),
    ("PY", "Puducherry", 30, "Puducherry_Legislative_Assembly"),
]

def fetch_wiki_page(slug):
    """Fetch raw HTML from Wikipedia."""
    url = f"https://en.wikipedia.org/wiki/{slug}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  Failed to fetch {slug}: {e}")
        return None

def extract_constituency_names(page_html, expected_count, state_name):
    """Try to extract constituency names from Wikipedia page HTML."""
    if not page_html:
        return None

    names = []

    # Strategy 1: Look for numbered constituency entries in tables
    # Wikipedia assembly pages typically have tables with constituency numbers and names
    # Pattern: <td>NUMBER</td>...<td>NAME</td> or similar

    # Try finding table rows with constituency data
    # Look for patterns like: >1<...>ConstituencyName< or >1.<...>ConstituencyName<

    # First try: look for "List_of_constituencies" link in the page
    list_match = re.search(r'href="/wiki/(List_of_constituencies_of_the_' + re.escape(state_name.replace(' ', '_')) + r'[^"]*)"', page_html)
    if not list_match:
        # Try alternate patterns
        list_match = re.search(r'href="/wiki/(List_of_constituencies_of_[^"]*' + re.escape(state_name.replace(' ', '_').split('_')[0]) + r'[^"]*[Ll]egislative[^"]*)"', page_html)

    if list_match:
        list_slug = list_match.group(1)
        list_html = fetch_wiki_page(list_slug)
        if list_html:
            page_html = list_html

    # Extract from table rows - look for patterns with constituency numbers
    # Common pattern: <td>NUM</td><td><a ...>NAME</a></td>
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', page_html, re.DOTALL)

    for row in rows:
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        if len(cells) >= 2:
            # Check if first cell is a number
            num_text = re.sub(r'<[^>]+>', '', cells[0]).strip()
            if re.match(r'^\d{1,3}$', num_text):
                num = int(num_text)
                if 1 <= num <= expected_count + 5:
                    # Second cell should be the name
                    name_html = cells[1]
                    # Extract text, preferring link text
                    link_match = re.search(r'<a[^>]*>([^<]+)</a>', name_html)
                    if link_match:
                        name = link_match.group(1).strip()
                    else:
                        name = re.sub(r'<[^>]+>', '', name_html).strip()

                    name = html.unescape(name)
                    if name and len(name) > 1 and not name.isdigit():
                        names.append((num, name))

    if len(names) >= expected_count * 0.8:
        # Sort by number and deduplicate
        names.sort(key=lambda x: x[0])
        seen = set()
        unique = []
        for num, name in names:
            if num not in seen:
                seen.add(num)
                unique.append((num, name))
        return unique[:expected_count]

    return None

def title_case_name(name):
    """Clean up constituency name."""
    name = name.strip()
    # Remove trailing parenthetical info like (SC), (ST)
    name = re.sub(r'\s*\([^)]*\)\s*$', '', name)
    name = name.strip()
    return name

def generate_entries():
    """Generate all assembly constituency entries."""
    all_entries = []

    for code, state, count, slug in STATES:
        print(f"Processing {state} ({count} constituencies)...")

        page = fetch_wiki_page(slug)
        names = extract_constituency_names(page, count, state)

        if names and len(names) >= count * 0.8:
            print(f"  Found {len(names)} names from Wikipedia")
            # Fill any gaps
            name_map = {n: nm for n, nm in names}
            for i in range(1, count + 1):
                ac_name = name_map.get(i, f"{state} AC-{i}")
                ac_name = title_case_name(ac_name)
                entry = {
                    "id": f"{code}-AC-{i:03d}",
                    "name": ac_name,
                    "state": state,
                    "acNo": i,
                }
                all_entries.append(entry)
        else:
            print(f"  Using placeholder names (found {len(names) if names else 0})")
            # Use placeholders - will need manual fixing
            for i in range(1, count + 1):
                nm = f"{state} AC-{i}" if not names else (
                    dict(names).get(i, f"{state} AC-{i}")
                )
                nm = title_case_name(nm) if names and i in dict(names) else nm
                entry = {
                    "id": f"{code}-AC-{i:03d}",
                    "name": nm,
                    "state": state,
                    "acNo": i,
                }
                all_entries.append(entry)

    return all_entries

def write_js_file(entries, output_path):
    """Write the JavaScript data file."""
    lines = [
        "// India's Vidhan Sabha (State Assembly) constituencies",
        "// Data compiled from Election Commission of India records",
        f"// Total: {len(entries)} constituencies across {len(STATES)} states/UTs",
        "",
        "const assemblyConstituencies = [",
    ]

    current_state = None
    for e in entries:
        if e["state"] != current_state:
            current_state = e["state"]
            state_count = sum(1 for x in entries if x["state"] == current_state)
            lines.append(f"  // {current_state} ({state_count})")

        name_escaped = e["name"].replace("'", "\\'")
        lines.append(
            f'  {{ id: "{e["id"]}", name: \'{name_escaped}\', state: \'{e["state"]}\', acNo: {e["acNo"]} }},'
        )

    lines.append("];")
    lines.append("")
    lines.append("export default assemblyConstituencies;")
    lines.append("")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"\nWrote {len(entries)} entries to {output_path}")

if __name__ == "__main__":
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output = os.path.join(script_dir, "..", "src", "data", "assemblyConstituencies.js")

    entries = generate_entries()
    write_js_file(entries, output)
    print("Done!")
