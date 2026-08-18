import re, json

CATEGORIES = {
    "Environment",
    "Social Capital",
    "Human Capital",
    "Business Model and Innovation",
    "Leadership and Governance",
}

sasb_code_re = re.compile(r"^([A-Z]{2}-[A-Z]{2}) · (.+)$")
nic_re = re.compile(r"^NIC ([A-Z]) · (\d{2})$")
issues_re = re.compile(r"^(\d+) issues?$")
sector_line_re = re.compile(
    r"^Sector ([A-Z]) — (.+?) · Industry (\d{2}) — (.+?)(\s*\((\w+) confidence\))?$"
)
general_issue_re = re.compile(r"^(.+?)(\d{3})$")

with open("/home/user/green-mentor/scripts/sasb_raw.txt") as f:
    raw_lines = [l.rstrip("\n") for l in f]

# Split into blocks separated by blank lines, but industry blocks span multiple
# blank-line-separated chunks (metadata chunk + one chunk per category-run).
# Simpler: iterate line by line with a small state machine using lookahead.
lines = [l for l in raw_lines]  # keep blank lines as separators for now

industries = []
i = 0
n = len(lines)

def is_blank(s):
    return s.strip() == ""

while i < n:
    if is_blank(lines[i]):
        i += 1
        continue

    name = lines[i].strip()
    # must be followed (possibly with blanks skipped? no - format has no blank
    # between name and sasb code) by a SASB code line
    if i + 1 >= n or not sasb_code_re.match(lines[i + 1].strip()):
        raise ValueError(f"Expected SASB code line after industry name at line {i}: {name!r} / next={lines[i+1] if i+1<n else None!r}")

    sasb_match = sasb_code_re.match(lines[i + 1].strip())
    sasb_code, sasb_sector = sasb_match.groups()

    nic_match = nic_re.match(lines[i + 2].strip())
    nic_section, nic_industry_code = nic_match.groups()

    issues_match = issues_re.match(lines[i + 3].strip())
    issues_count = int(issues_match.group(1))

    sector_match = sector_line_re.match(lines[i + 4].strip())
    if not sector_match:
        raise ValueError(f"Bad sector line at {i+4}: {lines[i+4]!r}")
    _, sector_name, industry_code2, industry_name, _, confidence = sector_match.groups()

    industry = {
        "name": name,
        "sasbCode": sasb_code,
        "sasbSector": sasb_sector,
        "nicSection": nic_section,
        "nicIndustryCode": nic_industry_code,
        "issuesCount": issues_count,
        "confidence": confidence or "high",
        "generalIssues": [],
    }

    j = i + 5
    # skip blank line(s)
    while j < n and is_blank(lines[j]):
        j += 1

    current_category = None
    current_issue = None

    # consume until we hit a blank line followed by a non-category line that is
    # itself followed by a SASB-code line (i.e. the next industry's name)
    while j < n:
        line = lines[j].strip()
        if line == "":
            # peek: is this the start of the next industry?
            k = j + 1
            while k < n and is_blank(lines[k]):
                k += 1
            if k < n and k + 1 < n and sasb_code_re.match(lines[k + 1].strip()):
                j = k
                break
            j += 1
            continue

        if line in CATEGORIES:
            current_category = line
            current_issue = None
            j += 1
            continue

        m = general_issue_re.match(line)
        # A general-issue line: text immediately followed by a 3-digit SASB code,
        # AND we're inside a known category.
        if m and current_category is not None:
            issue_name, issue_code = m.groups()
            current_issue = {
                "pillarCategory": current_category,
                "generalIssueName": issue_name,
                "generalIssueCode": issue_code,
                "disclosureTopics": [],
            }
            industry["generalIssues"].append(current_issue)
            j += 1
            continue

        # Otherwise it's a disclosure topic name under the current issue
        if current_issue is not None:
            current_issue["disclosureTopics"].append(line)
            j += 1
            continue

        raise ValueError(f"Unhandled line at {j}: {line!r} (industry={name})")

    industries.append(industry)
    i = j

print(f"Parsed {len(industries)} SASB industries")

# sanity: issuesCount should equal number of generalIssues parsed
mismatches = [ind["name"] for ind in industries if len(ind["generalIssues"]) != ind["issuesCount"]]
print("Mismatched issue counts:", mismatches)

with open("/home/user/green-mentor/src/data/sasbIndustries.json", "w") as f:
    json.dump(industries, f, indent=2)

# print a sample
print(json.dumps(industries[0], indent=2))
print(json.dumps(industries[6], indent=2))  # Biotechnology & Pharmaceuticals - multi-topic issue
