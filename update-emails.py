#!/usr/bin/env python3
import re

# Read the file
with open('genzura-api/src/services/emailService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find methods that use transporter.sendMail
# We'll replace the pattern:
# const transporter = createTransporter();
# const logoUrl = await getLogoUrl();
# ...
# await transporter.sendMail({
#   from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
#   to: email,
#   subject: ...,
#   html: ...
# });

# Step 1: Remove "const transporter = createTransporter();" lines
content = re.sub(r'\s*const transporter = createTransporter\(\);\n', '', content)

# Step 2: Replace transporter.sendMail pattern with sendEmail
# This is complex, so let's do it method by method

# Pattern: await transporter.sendMail({ ... })
# Replace with: await sendEmail(to, subject, html)

def replace_sendmail(match):
    full_match = match.group(0)
    # Extract to, subject, and html from the sendMail call
    to_match = re.search(r"to:\s*([^,]+),", full_match)
    subject_match = re.search(r"subject:\s*([^,]+),", full_match)
    html_match = re.search(r"html:\s*`([\s\S]*?)`\s*\}", full_match)

    if to_match and subject_match and html_match:
        to = to_match.group(1).strip()
        subject = subject_match.group(1).strip()
        html = html_match.group(1)

        return f'await sendEmail({to}, {subject}, `{html}`)'

    return full_match

# Replace all transporter.sendMail calls
content = re.sub(
    r'await transporter\.sendMail\(\{[\s\S]*?from:[\s\S]*?to:\s*([^,]+),[\s\S]*?subject:\s*([^,]+),[\s\S]*?html:\s*`([\s\S]*?)`[\s\S]*?\}\)',
    lambda m: f'await sendEmail({m.group(1).strip()}, {m.group(2).strip()}, `{m.group(3)}`)',
    content
)

# Write back
with open('genzura-api/src/services/emailService.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated all email methods to use sendEmail helper")
