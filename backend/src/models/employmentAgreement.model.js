import mongoose, { Schema, model } from "mongoose";

const { models } = mongoose;

const employmentAgreementSchema = new Schema(
  {
    // ১. প্রতিষ্ঠানের তথ্য (Header)
    প্রতিষ্ঠানের_তথ্য: {
      প্রতিষ্ঠানের_নাম: { type: String, default: "মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)" },
      অফিসের_ঠিকানা: { type: String, default: "Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh" },
      মোবাইল_নম্বর: { type: String, default: "+8801345579534" },
      ইমেইল_অ্যাড্রেস: { type: String, default: "monsuralitravels@gmail.com" },
    },

    // ২. কর্মচারী ও নিয়োগকারীর সাধারণ তথ্য (Parties Details)
    সাধারণ_তথ্য: {
      চুক্তির_তারিখ: { type: String, default: "" },
      জাতীয়_পরিচয়পত্র_পাসপোর্ট: { type: String, default: "" },
      নিয়োগকর্তা_কর্তৃপক্ষ: { type: String, default: "মো: ইকরামুল হোসেন (ব্যবস্থাপনা পরিচালক)" },
      কর্তৃপক্ষের_মোবাইল_নম্বর: { type: String, default: "+8801345579534" },
      কর্মচারীর_পূর্ণ_নাম: { type: String, required: true, trim: true },
      কর্মচারীর_ইমেইল: { type: String, default: "" },
      পিতা_স্বামীর_নাম: { type: String, default: "" },
      বর্তমান_স্থায়ী_ঠিকানা: { type: String, default: "" },
    },

    // ৩. অভিভাবক / পিতামাতার যোগাযোগের বিবরণ (Guardian Details)
    অভিভাবকের_তথ্য: {
      অভিভাবকের_নাম: { type: String, default: "" },
      মোবাইল_নম্বর: { type: String, default: "" },
      সম্পর্ক: { type: String, default: "পিতা" },
      বিকল্প_জরুরি_নম্বর: { type: String, default: "" },
      জাতীয়_পরিচয়পত্র_নং: { type: String, default: "" },
      ঠিকানা: { type: String, default: "" },
    },

    // ৪. পদের বিবরণ ও কাজের সময়সূচি (Position & Schedule)
    পদের_বিবরণ: {
      পদের_নাম: { type: String, default: "" },
      বিভাগ: { type: String, default: "" },
      যোগদানের_তারিখ: { type: String, default: "" },
      কর্মস্থল: { type: String, default: "হেড অফিস, নাদampur" },
      নিয়োগের_ধরন: { type: String, default: "স্থায়ী / পূর্ণকালীন (Full-Time)" },
      কাজের_সময়_ও_ছুটি: { type: String, default: "সকাল ৯:০০ - সন্ধ্যা ৬:০০, রবিবার হতে বৃহস্পতিবার" },
    },

    // ৫. বেতন কাঠামো ও ইনক্রিমেন্ট (Salary Structure)
    বেতন_কাঠামো: {
      মূল_বেতন: { type: String, default: "0" },
      বাড়ি_ভাড়া_ভাতা: { type: String, default: "0" },
      চিকিৎসা_ভাতা: { type: String, default: "0" },
      যাতায়াত_ভাতা: { type: String, default: "0" },
      বিশেষ_ভাতা: { type: String, default: "0" },
      সর্বমোট_মাসিক_বেতন: { type: String, default: "0" },
      বেতন_কথায়: { type: String, default: "" },
    },

    // ৬. ছুটি, উৎসব এবং খাবার/নাস্তা সুবিধা (Leave Policy)
    ছুটি_ও_সুবিধা: {
      নৈমিত্তিক_ছুটি_দিন: { type: String, default: "10" },
      অসুস্থতাজনিত_ছুটি_দিন: { type: String, default: "14" },
      অর্জিত_ছুটি_দিন: { type: String, default: "18" },
      ফ্রি_লাঞ্চ_সুবিধা: { type: Boolean, default: true },
      চা_নাস্তা_সুবিধা: { type: Boolean, default: true },
      লাঞ্চ_ভাতা: { type: String, default: "" },
    },

    // ৭. স্বাক্ষীগণের বিবরণ (Witnesses)
    স্বাক্ষীগণের_তথ্য: {
      প্রথম_পক্ষের_সাক্ষী: {
        নাম: { type: String, default: "" },
        মোবাইল_নম্বর: { type: String, default: "" },
        ঠিকানা: { type: String, default: "" },
      },
      দ্বিতীয়_পক্ষের_সাক্ষী: {
        নাম: { type: String, default: "" },
        মোবাইল_নম্বর: { type: String, default: "" },
        ঠিকানা: { type: String, default: "" },
      },
    },

    // স্ট্যাটাস ও ট্র্যাকিং
    স্ট্যাটাস: {
      type: String,
      enum: ["draft", "active", "completed", "terminated"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "employment-agreement",
  }
);

export const EmploymentAgreementModel =
  models.EmploymentAgreement ||
  model("EmploymentAgreement", employmentAgreementSchema, "employment-agreement");
