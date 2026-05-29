# ✏️ How to Edit Attorney Profile

## 📍 Where to Edit

**Location:** Settings → Personal Profile

**URL:** `/settings` (when logged in)

---

## 🎯 What Can Be Edited

### Basic Profile (All Users):
- ✅ First Name / Last Name
- ✅ Phone
- ✅ Job Title
- ✅ Location
- ✅ Avatar/Profile Photo

### Attorney-Specific Fields (Attorneys Only):
- ✅ **Professional Bio** - Tell your story (2000 characters)
- ✅ **Education** - Degrees and qualifications
- ✅ **Bar Number** - Bar association license number
- ✅ **Years of Experience** - Total years practicing law

---

## 🚀 How to Access

### Step 1: Login to Genzura
```
http://localhost:5173/login
```

### Step 2: Go to Settings
- Click your profile icon (top right)
- Select "Settings"
- OR navigate to `/settings`

### Step 3: Edit Profile
- Stay on "Personal Profile" tab (default)
- Scroll down to see **all** fields
- If you're an Attorney or Senior_Attorney, you'll see:
  - Standard fields (name, phone, etc.)
  - **"Professional Profile"** section with bio, education, bar number

### Step 4: Save
- Click **"Save Changes"** button at bottom
- Changes save to database
- Immediately visible on public profile

---

## 📝 Field Guide

### 1. Professional Bio
**Character Limit:** 2000  
**Purpose:** Tell potential clients about yourself  
**Shown:** Public attorney profile  

**Example:**
```
Experienced attorney specializing in corporate law and intellectual 
property. Over 10 years of practice representing startups and 
established businesses across Rwanda. Member of the East African 
Law Society. Passionate about helping entrepreneurs navigate legal 
complexities and protect their innovations.
```

**Tips:**
- ✅ Highlight your specializations
- ✅ Mention years of experience
- ✅ Include notable achievements
- ✅ Keep it professional but personable
- ❌ Avoid jargon
- ❌ Don't write in third person

---

### 2. Education
**Purpose:** Show your academic credentials  
**Shown:** Public profile sidebar  

**Examples:**
```
LLB, University of Rwanda (2013)
```
```
LLB, University of Rwanda (2013); LLM, University of Cape Town (2015)
```
```
Bachelor of Laws, UNILAK (2010)
Master of Commercial Law, UCT (2012)
```

---

### 3. Bar Number
**Purpose:** Bar association license verification  
**Shown:** Public profile sidebar  

**Example:**
```
RBA-2013-0123
```

**Format:** Use your official bar association number

---

### 4. Years of Experience
**Type:** Number  
**Range:** 0-50  
**Purpose:** Quick credibility indicator  
**Shown:** Public profile (multiple places)  

**Example:** `10`

**Note:** This overrides the auto-calculated years based on account age

---

## 🎨 How It Looks on Public Profile

### Before (No Bio):
```
┌─────────────────────────────────────┐
│  [Statistics Section]               │
│  [Areas of Expertise]               │
└─────────────────────────────────────┘
```

### After (With Bio):
```
┌─────────────────────────────────────┐
│  📄 About                           │
│                                     │
│  Experienced attorney specializing  │
│  in corporate law...                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [Statistics Section]               │
│  [Areas of Expertise]               │
└─────────────────────────────────────┘
```

**Sidebar Shows:**
```
┌─────────────────────────────────────┐
│  Education & Credentials            │
│                                     │
│  🎓 Education                       │
│     LLB, University of Rwanda       │
│                                     │
│  ✓ Bar Number                       │
│     RBA-2013-0123                   │
└─────────────────────────────────────┘
```

---

## 🔒 Who Can See What

### Private (Login Required):
- Settings page (obviously!)
- Edit capabilities
- Dashboard

### Public (Anyone):
- Attorney profile at `/attorneys/[id]`
- Bio, education, bar number
- Statistics and expertise
- Contact information

### Hidden from Public:
- Email (domain shown, full email hidden until profile clicked)
- Internal notes
- Dashboard data
- Financial info

---

## ⚠️ Current Limitations

### Not Yet Available:
- ❌ Document uploads (CV, certificates) - coming soon!
- ❌ Specialization tags - auto-calculated from cases
- ❌ Profile visibility toggle - all attorneys are public
- ❌ Custom URL - uses system ID

### Workarounds:
- **Documents:** Can be added directly via database (see ATTORNEY_BIO_DOCUMENTS_GUIDE.md)
- **Visibility:** All active attorneys appear in directory
- **Specializations:** Automatically calculated from your cases

---

## 🧪 Testing

### Test Your Profile:

1. **Edit Your Info:**
   - Go to Settings
   - Fill in bio, education, bar number
   - Save changes

2. **View Public Profile:**
   - Copy your attorney ID from URL or database
   - Visit: `/attorneys/[your-id]`
   - OR use directory: `/attorneys` → Search your name

3. **Check Display:**
   - ✅ Bio appears in "About" section
   - ✅ Education shows in sidebar
   - ✅ Bar number displays
   - ✅ Years of experience accurate

---

## 💡 Pro Tips

### Writing a Great Bio:
1. **Start with your expertise**
   ```
   "Experienced corporate attorney specializing in..."
   ```

2. **Add credibility markers**
   ```
   "Over 10 years representing Fortune 500 companies..."
   ```

3. **Show personality**
   ```
   "Passionate about helping startups navigate legal challenges..."
   ```

4. **End with a differentiator**
   ```
   "Known for translating complex legal concepts into actionable business advice."
   ```

### Example Complete Bio:
```
Experienced corporate attorney specializing in mergers & acquisitions 
and commercial law. Licensed to practice in Rwanda since 2013, with 
over 10 years representing startups, SMEs, and established corporations 
across East Africa.

Graduate of University of Rwanda (LLB, 2013) and University of Cape Town 
(LLM in Commercial Law, 2015). Member of the Rwanda Bar Association and 
East African Law Society.

Practice focus includes contract negotiation, corporate governance, 
intellectual property protection, and cross-border transactions. Fluent 
in Kinyarwanda, English, and French.

Recognized by Chambers East Africa (2023-2024) for corporate/commercial 
work. Passionate about empowering entrepreneurs with clear, practical 
legal guidance that drives business growth.
```

---

## 🐛 Troubleshooting

### Changes Not Showing:
1. **Clear browser cache** - Ctrl+Shift+R
2. **Check save confirmation** - Should see success toast
3. **Verify in database:**
   ```sql
   SELECT bio, education, "barNumber", "yearsOfExperience"
   FROM "User"
   WHERE email = 'your@email.com';
   ```

### Fields Not Visible:
- **Check your role** - Must be Attorney or Senior_Attorney
- **Scroll down** - Attorney fields appear below basic profile
- **Refresh page** - Might need to reload

### Can't Save:
- **Fill required fields** - First name, last name, email
- **Check character limits** - Bio max 2000 characters
- **Valid numbers** - Years of experience must be 0-50

---

## 📊 Impact

### With Complete Profile:
- ✅ **3x more profile views** (est.)
- ✅ **2x more inquiries** (est.)
- ✅ **Higher trust** from potential clients
- ✅ **Better search ranking** in directory
- ✅ **Professional appearance**

### vs Incomplete Profile:
- ❌ Generic "Attorney at Law"
- ❌ No personal story
- ❌ Less credible
- ❌ Lower conversion

---

## ✅ Checklist

Complete your attorney profile:

- [ ] Login to Genzura
- [ ] Go to Settings → Personal Profile
- [ ] Upload professional photo
- [ ] Fill in basic info (phone, location, job title)
- [ ] Write compelling bio (200-500 words)
- [ ] Add education credentials
- [ ] Enter bar association number
- [ ] Set years of experience
- [ ] Click "Save Changes"
- [ ] View your public profile
- [ ] Share profile link with clients!

---

## 🚀 Next Steps

1. **Complete Your Profile** - Fill in all fields
2. **Add Documents** - Upload CV, certificates (coming soon)
3. **Get Cases** - Statistics auto-update from your cases
4. **Share Your Profile** - Use link in marketing materials
5. **Monitor Inquiries** - Check for contact form submissions

---

**Location:** Settings → Personal Profile  
**Time to Complete:** 10-15 minutes  
**Impact:** Significant improvement in client trust & inquiries  

**Start editing now!** 📝
