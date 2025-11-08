# EmailJS Setup Guide

To enable the contact form to send emails to shraddha.surana@gmail.com, you need to set up EmailJS.

## Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Sign up for a free account (free tier allows 200 emails/month)

## Step 2: Add Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (or your preferred email provider)
4. Connect your Gmail account (shraddha.surana@gmail.com)
5. Copy the **Service ID** (you'll need this) 

## Step 3: Create Email Template

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use the following template:

**Template Name:** Contact Form

**Subject:** New Contact Form Message: {{subject}}

**Content:**
```
From: {{from_name}} ({{from_email}})
Subject: {{subject}}

Message:
{{message}}

---
Reply to: {{reply_to}}
```

4. Save the template and copy the **Template ID** 

## Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Copy your **Public Key**

## Step 5: Update the Code

### In `index.html` (line 22):
Replace `YOUR_PUBLIC_KEY` with your actual EmailJS Public Key:
```javascript
emailjs.init("your-actual-public-key-here");
```

### In `script.js` (lines 267-268):
Replace the placeholders with your actual IDs:
```javascript
const SERVICE_ID = 'your-service-id';
const TEMPLATE_ID = 'your-template-id';
```

## Step 6: Test

1. Open your website
2. Fill out the contact form
3. Submit it
4. Check shraddha.surana@gmail.com inbox for the email

## Troubleshooting

- Make sure all three values (Public Key, Service ID, Template ID) are correctly entered
- Check browser console for any error messages
- Verify your EmailJS account is active
- Ensure Gmail service is properly connected in EmailJS dashboard

## Alternative: Formspree

If you prefer not to use EmailJS, you can use Formspree instead:
1. Sign up at https://formspree.io/
2. Create a form endpoint
3. Update the form action in `index.html` to point to your Formspree endpoint



