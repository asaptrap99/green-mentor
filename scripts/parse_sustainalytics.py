import re, json

nic_re = re.compile(r"^NIC ([A-Z]) · (\d{2})$")
mei_count_re = re.compile(r"^(\d+) MEIs?$")
sector_line_re = re.compile(
    r"^Sector ([A-Z]) — (.+?) · Industry (\d{2}) — (.+?)(\s*\((\w+) confidence\))?$"
)

with open("/home/user/green-mentor/scripts/sustainalytics_mei_definitions.txt") as f:
    definitions = {}
    for line in f:
        line = line.rstrip("\n")
        if not line:
            continue
        name, desc = line.split("|", 1)
        definitions[name] = desc

with open("/home/user/green-mentor/scripts/sustainalytics_raw.txt") as f:
    lines = [l.rstrip("\n") for l in f]

n = len(lines)
i = 0
industries = []


def is_blank(s):
    return s.strip() == ""


while i < n:
    if is_blank(lines[i]):
        i += 1
        continue

    name = lines[i].strip()
    if i + 1 >= n or not nic_re.match(lines[i + 1].strip()):
        raise ValueError(f"Expected NIC line after {name!r} at line {i}, got {lines[i+1] if i+1<n else None!r}")

    nic_section, nic_industry_code = nic_re.match(lines[i + 1].strip()).groups()
    mei_count = int(mei_count_re.match(lines[i + 2].strip()).group(1))

    sector_match = sector_line_re.match(lines[i + 3].strip())
    if not sector_match:
        raise ValueError(f"Bad sector line at {i+3}: {lines[i+3]!r}")
    _, sector_name, industry_code2, industry_name, _, confidence = sector_match.groups()

    j = i + 4
    while j < n and is_blank(lines[j]):
        j += 1

    meis = []
    while j < n and not is_blank(lines[j]):
        mei_name = lines[j].strip()
        if mei_name not in definitions:
            raise ValueError(f"Unknown MEI {mei_name!r} in industry {name!r} at line {j}")
        meis.append(mei_name)
        j += 1

    industries.append({
        "name": name,
        "nicSection": nic_section,
        "nicIndustryCode": nic_industry_code,
        "meiCount": mei_count,
        "confidence": confidence or "high",
        "materialIssues": meis,
    })

    i = j

print(f"Parsed {len(industries)} Sustainalytics industries")
mismatches = [ind["name"] for ind in industries if len(ind["materialIssues"]) != ind["meiCount"]]
print("Mismatched MEI counts:", mismatches)

out = {
    "definitions": definitions,
    "industries": industries,
}

with open("/home/user/green-mentor/src/data/sustainalyticsIndustries.json", "w") as f:
    json.dump(out, f, indent=2)

print(json.dumps(industries[0], indent=2))
