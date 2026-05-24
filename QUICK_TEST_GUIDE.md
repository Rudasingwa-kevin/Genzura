# Quick Testing Guide - Premium Signup with OTP

## 🚀 Ready to Test!

**Frontend:** http://localhost:5173/register  
**Backend:** http://localhost:5000

---

## ✅ Test the Complete Flow (2 minutes)

### Step 1: Fill Basic Info
```
First Name: John
Last Name: Doe
Email: john.doe@test.com
```

### Step 2: Verify Email
1. Click the **"Verify"** button next to email field
2. A toast notification will show: **"DEV MODE: Your code is 123456"** (or similar)
3. A modal popup will appear
4. Enter the 6-digit code shown in the toast
5. Click **"Verify"**
6. You'll see **"✓ Verified"** badge next to email

### Step 3: Fill Remaining Fields
```
Phone Number: +250 788 000 000
Organization: Apex Legal Group (optional - you can skip this)
Password: TestPassword123!
Confirm Password: TestPassword123!
☑ Check "I agree to Terms"
```

### Step 4: Submit
1. Click **"Create My Account"**
2. You should see: **"Account created successfully!"**
3. You'll be redirected to **/dashboard**

---

## 🎯 What to Check

### Visual Indicators
- ✅ **Email field**: "Verify" button appears when email is valid
- ✅ **After OTP**: "✓ Verified" badge shows, field becomes disabled (green background)
- ✅ **Password strength**: Colored bar (red/orange/yellow/green)
- ✅ **Requirements checklist**: Shows ✓ or ❌ for each requirement
- ✅ **Confirm password**: Shows "✓ Passwords match" or "❌ Do not match"

### Error Handling
Try these to see validation:
- Submit without verifying email → ❌ "Please verify your email address"
- Submit without phone → ❌ "Please enter your phone number"
- Passwords don't match → ❌ "Passwords do not match"
- Weak password → ❌ "Please use a stronger password"
- Terms not checked → ❌ "Please accept the Terms of Service"

### OTP Modal
- Clean white modal with Genzura branding
- 6-digit input field (large, centered)
- "Cancel" and "Verify" buttons
- "Resend code" link at bottom

---

## 🔧 Development Mode Features

### OTP Code Display
When you click "Verify":
- A toast shows: **"DEV MODE: Your code is 123456"**
- The code stays visible for 10 seconds
- You can also check the backend console logs for the code

### Any 6-Digit Code Works
In development mode, you can enter ANY 6-digit number and it will work:
- `123456` ✅
- `000000` ✅
- `999999` ✅

### Backend Console
Check the backend console (`genzura-api` terminal) to see:
```
=================================================
📧 DEVELOPMENT MODE - OTP for john.doe@test.com
🔑 OTP CODE: 123456
=================================================
```

---

## 📊 Check Database

After successful registration:

```bash
# Connect to database
cd genzura-api
npx prisma studio
```

Navigate to **User** table and verify:
- ✅ New user created
- ✅ `phone` field populated: "+250 788 000 000"
- ✅ `company` field populated: "Apex Legal Group" (if entered)
- ✅ `email` field: "john.doe@test.com"
- ✅ `subscriptionPlan`: "Genzura"

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to send verification code"
**Solution:** This should now be fixed! The backend uses development mode.

If still happening:
1. Check backend console for errors
2. Verify backend is running on port 5000
3. Check frontend can connect to backend

### Issue: OTP modal doesn't appear
**Solution:**
- Make sure email is valid (green checkmark)
- Click the "Verify" button (not just the email field)
- Check browser console for errors

### Issue: "Email verified" but field still editable
**Solution:** Refresh the page and try again

### Issue: Password strength not updating
**Solution:**
- Make sure you're typing in the password field
- Try a stronger password: `TestPassword123!`

---

## 📱 Test Different Scenarios

### Scenario 1: Valid International Phone
```
+1 555 123 4567   ✅
+44 20 7946 0958  ✅
+250 788 000 000  ✅
(555) 123-4567    ✅
```

### Scenario 2: Invalid Phone
```
123               ❌ Too short
abc               ❌ Invalid characters
                  ❌ Empty (required)
```

### Scenario 3: Password Strength
```
password          ❌ Weak (common pattern)
Password1         ❌ Fair (missing special char)
Password123       ❌ Fair (missing special char)
Password123!      ✅ Good
P@ssw0rd!2024     ✅ Strong
```

### Scenario 4: Email Validation
```
test@example.com      ✅ Valid
test                  ❌ Invalid
@example.com          ❌ Invalid
test @example.com     ❌ Invalid (space)
test@.com             ❌ Invalid
```

---

## ✨ What's Working

### Form Features
- [x] Real-time email validation
- [x] OTP verification modal
- [x] Password strength meter
- [x] Password confirmation matching
- [x] Required fields marked with *
- [x] Visual feedback (✓/❌)
- [x] Loading states
- [x] Clear error messages
- [x] Terms acceptance checkbox

### Backend Features
- [x] OTP generation (6 digits)
- [x] Development mode (any code works)
- [x] Phone validation
- [x] Password strength validation
- [x] Rate limiting (5 attempts / 15 min)
- [x] Input sanitization
- [x] Company/organization storage

### Security
- [x] Password hashing (bcrypt)
- [x] Email verification
- [x] Strong password enforcement
- [x] Rate limiting
- [x] Input validation
- [x] XSS prevention

---

## 🎨 UI/UX Features

### Colors & Branding
- **Brand Blue**: Primary buttons, links
- **Emerald Green**: Success states, validated fields
- **Red**: Errors, invalid fields
- **Orange/Yellow**: Warnings, weak passwords

### Animations
- Smooth modal fade-in
- Field focus transitions
- Button hover effects
- Loading spinners

### Responsive Design
- Works on mobile (< 768px)
- Works on tablet (768px - 1024px)
- Works on desktop (> 1024px)

---

## 🚀 Next Steps (Optional)

### 1. Production Email Setup
Configure Brevo SMTP in `.env`:
```env
BREVO_SMTP_USER=your-email@example.com
BREVO_SMTP_KEY=your-api-key
SENDER_EMAIL=noreply@genzura.law
```

### 2. Redis for OTP Storage
Install Redis for production OTP storage:
```bash
npm install ioredis
```

Update authController to use Redis instead of dev mode.

### 3. SMS Verification
Add Twilio/Africa's Talking for SMS OTP as alternative to email.

---

## 📞 Need Help?

### Check Logs
**Frontend Console:** Press F12 in browser
**Backend Console:** Check terminal running `npm run dev`

### Common Commands
```bash
# Restart frontend
cd genzura-web
npm run dev

# Restart backend
cd genzura-api
npm run dev

# Check database
cd genzura-api
npx prisma studio

# View API logs
cd genzura-api
tail -f server.log
```

---

## ✅ Success Checklist

Before marking as complete, verify:
- [ ] Can send OTP (see dev code in toast)
- [ ] Can enter OTP and verify email
- [ ] Phone number required and validated
- [ ] Password confirmation works
- [ ] Terms checkbox required
- [ ] All fields validate properly
- [ ] Account created in database
- [ ] Redirect to dashboard works
- [ ] User data stored correctly (phone, company)

---

## 🎉 You're All Set!

The premium signup with email verification is fully functional in development mode. Test it out at:

**http://localhost:5173/register**

Enjoy your professional, secure signup flow! 🚀
