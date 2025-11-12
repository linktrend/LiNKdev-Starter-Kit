# Onboarding Flow - Quick Reference Card

## 🎯 The 4-Step Flow

```
1. CREATE          2. PROFILE         3. PREFERENCES     4. WELCOME
   ACCOUNT            COMPLETE           CUSTOMIZE          & OFFERS
   
[Social/Email]  →  [Auto-fill +    →  [All Settings  →  [Resources +
[Phone Login]      Full Profile]      Optional]          Special Offers]
                   
Progress: 25%      Progress: 50%      Progress: 75%      Progress: 100%
No Back/Skip       Back|Skip|Next     Back|Skip|Next     [Get Started]
```

---

## ⚡ Quick Facts

| Aspect | Detail |
|--------|--------|
| **Total Steps** | 4 |
| **Required Fields** | Username, Name, Email OR Phone |
| **Optional Sections** | About, Business Info, All Preferences |
| **Progress Bar** | On all 4 steps |
| **Skip Option** | Steps 2 & 3 only |
| **Estimated Time** | 3-5 minutes |
| **Mobile Friendly** | ✅ Yes |

---

## 📝 Step-by-Step Checklist

### Step 1: Create Account
- [ ] Choose auth method (social/email/phone)
- [ ] Accept terms
- [ ] Continue to Step 2

### Step 2: Complete Profile
- [ ] Username (auto-suggested) ✅
- [ ] Display Name
- [ ] First & Last Name
- [ ] Email OR Phone (pre-filled) 🔒
- [ ] Optional: Address, About, Business
- [ ] Choose: Back | Skip | Continue

### Step 3: Preferences
- [ ] Optional: Set all preferences
- [ ] Default values provided
- [ ] Choose: Back | Skip | Continue

### Step 4: Welcome & Resources
- [ ] View quick links
- [ ] Check special offers
- [ ] Copy referral link (optional)
- [ ] Click "Get Started"

---

## 🎨 Visual Patterns

### Progress Bar
```
Step X of 4: [Name]            XX%
████████████░░░░░░░░░░░░░░░░
```

### Button Layout (Steps 2 & 3)
```
[← Back]         [Skip]     [Continue →]
```

### Pre-filled Fields
```
[john.doe@example.com 🔒]  ← Locked
[5551234567]              ← Editable
```

### Collapsible Sections
```
Personal Information ▲     ← Expanded
About (Optional) ▼         ← Collapsed
```

---

## 🔧 Technical Quick Ref

### Username Generation
```typescript
Email → localpart before @, no special chars
Phone → user + last 7 digits
```

### Pre-filling Rules
```typescript
if (authMethod === 'email')
  → email locked, phone editable
if (authMethod === 'phone')
  → phone locked, email editable
```

### Validation
```typescript
Step 1: authMethod + terms
Step 2: username + displayName + firstName + lastName + (email|phone)
Step 3: all optional
Step 4: no validation
```

---

## 📊 Files to Modify

```
/hooks/
  └── useOnboarding.ts          [Update interface, totalSteps=4]

/onboarding/
  ├── page.tsx                  [Main orchestrator]
  └── components/
      ├── Step1CreateAccount.tsx    [Minimal changes]
      ├── Step2CompleteProfile.tsx  [NEW - 3h]
      ├── Step3Preferences.tsx      [NEW - 2h]
      ├── Step4Welcome.tsx          [NEW - 2h]
      └── ProgressBar.tsx           [NEW - 0.5h]
```

---

## ⏱️ Time Breakdown

| Task | Hours |
|------|-------|
| Hook updates | 1h |
| Progress bar | 0.5h |
| Step 1 tweaks | 0.5h |
| Step 2 Profile | 3h |
| Step 3 Preferences | 2h |
| Step 4 Welcome | 2h |
| Testing | 3h |
| **TOTAL** | **12h** |

---

## 🎁 Step 4 Offers Structure

```
Quick Links          Special Offers
├── Getting Started  ├── Refer a Friend (with link)
├── Documentation    ├── Premium 20% Off
├── Help Center      └── Free Onboarding Call
├── Video Tutorials
└── Community Forum
```

---

## ✅ Acceptance Criteria

- [ ] 4 steps flow correctly
- [ ] Progress bar on all steps
- [ ] Username auto-suggested
- [ ] Email/phone pre-filled
- [ ] Back/Skip/Continue work
- [ ] All profile fields present
- [ ] All preferences available
- [ ] Resources + offers shown
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] No linting errors

---

## 🚀 Launch Checklist

- [ ] Code review complete
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Mobile testing done
- [ ] Analytics events added
- [ ] Documentation updated
- [ ] Staging deployment
- [ ] QA sign-off
- [ ] Production deployment
- [ ] Monitor metrics

---

## 📈 Success Metrics

**Target KPIs:**
- Completion rate: 85%+
- Time to complete: 3-5 min
- Profile completeness: 70%+
- Referral link usage: 15%+
- Premium interest: 10%+
- Help resource clicks: 30%+

---

## 🆘 Troubleshooting

### Username not suggested?
→ Check email/phone captured in Step 1

### Pre-filling not working?
→ Verify authMethod set correctly

### Progress bar stuck?
→ Check currentStep state update

### Skip not working?
→ Ensure nextStep() called on skip

### Mobile layout broken?
→ Check Tailwind responsive classes

---

## 📞 Resources

- **Full Plan:** `/docs/COMPREHENSIVE_ONBOARDING_FLOW_PLAN.md`
- **Visual Guide:** `/docs/ONBOARDING_VISUAL_GUIDE.md`
- **Executive Summary:** `/docs/ONBOARDING_EXECUTIVE_SUMMARY.md`
- **This Card:** `/docs/ONBOARDING_QUICK_REFERENCE.md`

---

## 💡 Pro Tips

1. **Start with Step 2** - Most complex, tackle first
2. **Reuse components** - ProfileForm from edit profile
3. **Test mobile early** - Don't wait until end
4. **Add analytics** - Track every step transition
5. **Use TypeScript** - Catch errors early
6. **Progressive enhancement** - Basic first, polish later

---

**Status:** 📋 Ready for Implementation  
**Est. Time:** 12 hours  
**Complexity:** Medium-High  
**Priority:** High

