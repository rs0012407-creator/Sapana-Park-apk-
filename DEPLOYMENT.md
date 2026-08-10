# Sapana Park Resident Portal - Production & Deployment Guide

यह दस्तावेज़ वेब एप्लिकेशन को पब्लिक डिप्लॉय (Public Web Deployment) करने और एंड्रॉइड एपीके (Android APK) जनरेट करने की पूरी जानकारी प्रदान करता है।

---

## 1. Web Application Build (वेब ऐप बिल्ड)

वेब एप्लिकेशन को प्रोडक्शन के लिए कंपाइल/बिल्ड करने के लिए:

```bash
# 1. सभी डिपेंडेंसी इंस्टॉल करें
npm install

# 2. TypeScript / Linter चेक करें
npm run lint

# 3. प्रोडक्शन वेब बिल्ड और सर्वर बंडल जनरेट करें
npm run build
```

---

## 2. Public Web Deployment (पब्लिक डिप्लॉयमेंट)

यह एप्लिकेशन **Full-Stack Express + React Vite** पर आधारित है। इसे किसी भी क्लाउड प्रोवाइडर पर HTTPS URL के साथ डिप्लॉय किया जा सकता है:

### Option A: Cloud Run / Docker Container (Recommended)
1. **Repository** को Google Cloud या GitHub से कनेक्ट करें।
2. Port `3000` एक्सपोज़ करें।
3. Start command: `npm run start` (यह `dist/server.cjs` चलाता है)।

### Option B: Firebase Hosting / Static SPA
यदि आप इसे केवल Client-Side SPA की तरह डिप्लॉय करना चाहते हैं:
1. `npm run build` चलाएं (यह `dist/` फोल्डर में Static Files जनरेट करता है)।
2. Firebase CLI इंस्टॉल करें: `npm install -g firebase-tools`
3. `firebase init hosting` करके `public` डायरेक्टरी में `dist` सेट करें और SPA rewrites (`true`) इनेबल करें।
4. `firebase deploy` चलाएं।

---

## 3. Android APK Build (Capacitor)

वेब ऐप को एंड्रॉइड ऐप में बदलने के लिए `@capacitor/core` और `@capacitor/android` का उपयोग किया गया है।

### लोकल कंप्यूटर पर APK बनाने के चरण:

```bash
# 1.Dependencies इंस्टॉल करें
npm install

# 2. Production build बनाएं
npm run build

# 3. Android Platform जोड़ें और Sync करें
npx cap add android
npx cap sync android

# 4. Debug APK बनाएं
cd android
./gradlew assembleDebug --no-daemon
```

**APK फ़ाइल की लोकेशन:**
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 4. GitHub Actions Automated APK Workflow

जब आप अपने कोड को GitHub Repository (Branch: `main` या `master`) पर पुश करेंगे, तो स्वचालित रूप से एंड्रॉइड एपीके बिल्ड हो जाएगा:

1. GitHub पर अपने Repo के **Actions** टैब में जाएं।
2. **Build Android APK** वर्कफ़्लो चुनें।
3. **Run workflow** पर क्लिक करके मैनुअल बिल्ड भी ट्रिगर कर सकते हैं।
4. बिल्ड सफल होने के बाद **Artifacts** सेक्शन में `sapana-park-debug-apk` नाम से डाउनलोड योग्य `app-debug.apk` फ़ाइल मिल जाएगी।

---

## 5. Release APK Signing Guide (उत्पादन के लिए डिजिटल साइनिंग)

यदि आप Google Play Store पर ऐप अपलोड करना चाहते हैं:
1. Keytool से Keystore बनाएं:
   ```bash
   keytool -genkey -v -keystore sapana-park-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias sapana-park-key
   ```
2. Android Gradle प्रोजेक्ट में Signed Release APK बनाएं:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
