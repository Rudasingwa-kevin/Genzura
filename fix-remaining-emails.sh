#!/bin/bash
# Remove all remaining "const transporter = createTransporter();" lines
sed -i 's/^\s*const transporter = createTransporter();$//' genzura-api/src/services/emailService.ts

# Replace remaining transporter.sendMail patterns
# This is complex, so we'll output what needs manual fixing
grep -n "await transporter.sendMail" genzura-api/src/services/emailService.ts || echo "All transporter.sendMail calls replaced!"
