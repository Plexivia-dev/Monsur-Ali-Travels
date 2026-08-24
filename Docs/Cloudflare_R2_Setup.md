# Cloudflare R2 Storage Setup & Automated Architecture

## ১. ওভারভিউ (Overview)
মনসুর আলী ট্রাভেলস ইআরপি সিস্টেমের ফাইল (ইনভয়েস, পাসপোর্ট, ভিসা, মানি রিসিট)-এর জন্য **Cloudflare R2** ক্লাউড স্টোরেজ হিসেবে কনফিগার করা হয়েছে।

### মূল সুবিধাসমূহ:
- **Zero Egress Fees:** যতবারই ফাইল ভিউ বা ডাউনলোড হোক, ব্যান্ডউইথ সম্পূর্ণ ফ্রি।
- **১৮০ দিনের অটো-ডিলিশন:** Lifecycle Policy-এর মাধ্যমে ১৮০ দিন (৬ মাস) পুরনো ফাইল ক্লাউড থেকে অটোমেটিক পার্জ/ডিলিট হয়ে যাবে।
- **S3 API Standard:** যেকোনো S3 ক্লায়েন্ট লাইব্রেরি (`@aws-sdk/client-s3`) দিয়ে সরাসরি ব্যবহারযোগ্য।

---

## ২. অটোমেটেড সেটআপ পদ্ধতি (Automated 1-Click Setup)

### ধাপ ১: Cloudflare থেকে তথ্য সংগ্রহ
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) এ লগইন করুন।
2. **R2 Object Storage** এ যান।
3. আপনার **Account ID** কপি করুন (R2 পেজের ডানপাশে দেখতে পাবেন)।
4. **Manage R2 API Tokens** এ ক্লিক করে **Create API Token** চাপুন:
   - Permissions: **Object Read & Write**
5. সেখান থেকে **Access Key ID** এবং **Secret Access Key** কপি করুন।

### ধাপ ২: অটোমেশন স্ক্রিপ্টটি রান করুন

আপনার ব্যাকএন্ড ফোল্ডারে গিয়ে কমান্ড দিন:

```bash
node scripts/setup-r2.js
```
*(স্ক্রিপ্টটি আপনার কাছে Account ID, Access Key এবং Secret Key চাইবে এবং নিজে থেকেই বাকেট তৈরি, ১৮০ দিনের ডিলিশন রুল ও `.env` আপডেট করে দেবে)*
