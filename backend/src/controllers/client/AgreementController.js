import mongoose from "mongoose";
import { EmploymentAgreementModel, generateUniqueAgreementId } from "../../models/employmentAgreement.model.js";
import { logger } from "../../config/logger.js";

// Helper to normalize payload into Bengali Schema format
function mapPayloadToBengaliSchema(body = {}) {
  const mapped = {
    agreementId: body.agreementId || generateUniqueAgreementId(),
    প্রতিষ্ঠানের_তথ্য: {
      প্রতিষ্ঠানের_নাম: body.header?.companyName || body.প্রতিষ্ঠানের_তথ্য?.প্রতিষ্ঠানের_নাম || "মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)",
      অফিসের_ঠিকানা: body.header?.officeAddress || body.প্রতিষ্ঠানের_তথ্য?.অফিসের_ঠিকানা || "Mominpur Jagannathpur Road, Sunamganj, Post Code 3060",
      মোবাইল_নম্বর: body.header?.phone || body.প্রতিষ্ঠানের_তথ্য?.মোবাইল_নম্বর || "+8801345579534",
      ইমেইল_অ্যাড্রেস: body.header?.email || body.প্রতিষ্ঠানের_তথ্য?.ইমেইল_অ্যাড্রেস || "contact@monsuralitravels.com",
    },
    সাধারণ_তথ্য: {
      চুক্তির_তারিখ: body.parties?.agreementDate || body.সাধারণ_তথ্য?.চুক্তির_তারিখ || "",
      জাতীয়_পরিচয়পত্র_পাসপোর্ট: body.parties?.nidPassport || body.সাধারণ_তথ্য?.জাতীয়_পরিচয়পত্র_পাসপোর্ট || "",
      নিয়োগকর্তা_কর্তৃপক্ষ: body.parties?.employerName || body.সাধারণ_তথ্য?.নিয়োগকর্তা_কর্তৃপক্ষ || "মো: ইকরামুল হোসেন (ব্যবস্থাপনা পরিচালক)",
      কর্তৃপক্ষের_মোবাইল_নম্বর: body.parties?.employerPhone || body.সাধারণ_তথ্য?.কর্তৃপক্ষের_মোবাইল_নম্বর || "+8801345579534",
      কর্মচারীর_পূর্ণ_নাম: (body.parties?.employeeName || body.সাধারণ_তথ্য?.কর্মচারীর_পূর্ণ_নাম || "").trim(),
      কর্মচারীর_ইমেইল: body.parties?.employeeEmail || body.সাধারণ_তথ্য?.কর্মচারীর_ইমেইল || "",
      পিতা_স্বামীর_নাম: body.parties?.fatherHusbandName || body.সাধারণ_তথ্য?.পিতা_স্বামীর_নাম || "",
      বর্তমান_স্থায়ী_ঠিকানা: body.parties?.address || body.সাধারণ_তথ্য?.বর্তমান_স্থায়ী_ঠিকানা || "",
    },
    অভিভাবকের_তথ্য: {
      অভিভাবকের_নাম: body.guardian?.guardianName || body.অভিভাবকের_তথ্য?.অভিভাবকের_নাম || "",
      মোবাইল_নম্বর: body.guardian?.guardianPhone || body.অভিভাবকের_তথ্য?.মোবাইল_নম্বর || "",
      সম্পর্ক: body.guardian?.relationship || body.অভিভাবকের_তথ্য?.সম্পর্ক || "পিতা",
      বিকল্প_জরুরি_নম্বর: body.guardian?.emergencyPhone || body.অভিভাবকের_তথ্য?.বিকল্প_জরুরি_নম্বর || "",
      জাতীয়_পরিচয়পত্র_নং: body.guardian?.guardianNid || body.অভিভাবকের_তথ্য?.জাতীয়_পরিচয়পত্র_নং || "",
      ঠিকানা: body.guardian?.guardianAddress || body.অভিভাবকের_তথ্য?.ঠিকানা || "",
    },
    পদের_বিবরণ: {
      পদের_নাম: body.position?.designation || body.পদের_বিবরণ?.পদের_নাম || "",
      বিভাগ: body.position?.department || body.পদের_বিবরণ?.বিভাগ || "",
      যোগদানের_তারিখ: body.position?.joiningDate || body.পদের_বিবরণ?.যোগদানের_তারিখ || "",
      কর্মস্থল: body.position?.location || body.পদের_বিবরণ?.কর্মস্থল || "হেড অফিস, নাদampur",
      নিয়োগের_ধরন: body.position?.jobType || body.পদের_বিবরণ?.নিয়োগের_ধরন || "স্থায়ী / পূর্ণকালীন (Full-Time)",
      কাজের_সময়_ও_ছুটি: body.position?.workSchedule || body.পদের_বিবরণ?.কাজের_সময়_ও_ছুটি || "সকাল ৯:০০ - সন্ধ্যা ৬:০০, রবিবার হতে বৃহস্পতিবার",
    },
    বেতন_কাঠামো: {
      মূল_বেতন: body.salary?.basicSalary || body.বেতন_কাঠামো?.মূল_বেতন || "0",
      বাড়ি_ভাড়া_ভাতা: body.salary?.houseRent || body.বেতন_কাঠামো?.বাড়ি_ভাড়া_ভাতা || "0",
      চিকিৎসা_ভাতা: body.salary?.medical || body.বেতন_কাঠামো?.চিকিৎসা_ভাতা || "0",
      যাতায়াত_ভাতা: body.salary?.conveyance || body.বেতন_কাঠামো?.যাতায়াত_ভাতা || "0",
      বিশেষ_ভাতা: body.salary?.specialAllowance || body.বেতন_কাঠামো?.বিশেষ_ভাতা || "0",
      সর্বমোট_মাসিক_বেতন: body.salary?.grossSalary || body.বেতন_কাঠামো?.সর্বমোট_মাসিক_বেতন || "0",
      বেতন_কথায়: body.salary?.grossSalaryInWords || body.বেতন_কাঠামো?.বেতন_কথায় || "",
    },
    ছুটি_ও_সুবিধা: {
      নৈমিত্তিক_ছুটি_দিন: body.leave?.casualDays || body.ছুটি_ও_সুবিধা?.নৈমিত্তিক_ছুটি_দিন || "10",
      অসুস্থতাজনিত_ছুটি_দিন: body.leave?.sickDays || body.ছুটি_ও_সুবিধা?.অসুস্থতাজনিত_ছুটি_দিন || "14",
      অর্জিত_ছুটি_দিন: body.leave?.earnedDays || body.ছুটি_ও_সুবিধা?.অর্জিত_ছুটি_দিন || "18",
      ফ্রি_লাঞ্চ_সুবিধা: body.leave?.lunchProvided ?? body.ছুটি_ও_সুবিধা?.ফ্রি_লাঞ্চ_সুবিধা ?? true,
      চা_নাস্তা_সুবিধা: body.leave?.teaSnacks ?? body.ছুটি_ও_সুবিধা?.চা_নাস্তা_সুবিধা ?? true,
      লাঞ্চ_ভাতা: body.leave?.lunchAllowance || body.ছুটি_ও_সুবিধা?.লাঞ্চ_ভাতা || "",
    },
    স্বাক্ষীগণের_তথ্য: {
      প্রথম_পক্ষের_সাক্ষী: {
        নাম: body.witnesses?.firstWitnessName || body.স্বাক্ষীগণের_তথ্য?.প্রথম_পক্ষের_সাক্ষী?.নাম || "",
        মোবাইল_নম্বর: body.witnesses?.firstWitnessPhone || body.স্বাক্ষীগণের_তথ্য?.প্রথম_পক্ষের_সাক্ষী?.মোবাইল_নম্বর || "",
        ঠিকানা: body.witnesses?.firstWitnessAddress || body.স্বাক্ষীগণের_তথ্য?.প্রথম_পক্ষের_সাক্ষী?.ঠিকানা || "",
      },
      দ্বিতীয়_পক্ষের_সাক্ষী: {
        নাম: body.witnesses?.secondWitnessName || body.স্বাক্ষীগণের_তথ্য?.দ্বিতীয়_পক্ষের_সাক্ষী?.নাম || "",
        মোবাইল_নম্বর: body.witnesses?.secondWitnessPhone || body.স্বাক্ষীগণের_তথ্য?.দ্বিতীয়_পক্ষের_সাক্ষী?.মোবাইল_নম্বর || "",
        ঠিকানা: body.witnesses?.secondWitnessAddress || body.স্বাক্ষীগণের_তথ্য?.দ্বিতীয়_পক্ষের_সাক্ষী?.ঠিকানা || "",
      },
    },
    স্ট্যাটাস: body.status || body.স্ট্যাটাস || "active",
    isActive: true,
  };

  return mapped;
}

// GET /api/v1/docs/employment-agreement - List agreements
export const getEmploymentAgreements = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
    const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
    const { search, status } = req.query;

    const query = { isActive: { $ne: false } };

    if (status && status !== "all") {
      query.স্ট্যাটাস = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { agreementId: searchRegex },
        { "সাধারণ_তথ্য.কর্মচারীর_পূর্ণ_নাম": searchRegex },
        { "সাধারণ_তথ্য.জাতীয়_পরিচয়পত্র_পাসপোর্ট": searchRegex },
        { "সাধারণ_তথ্য.কর্মচারীর_ইমেইল": searchRegex },
        { "পদের_বিবরণ.পদের_নাম": searchRegex },
      ];
    }

    const totalCount = await EmploymentAgreementModel.countDocuments(query);
    const agreements = await EmploymentAgreementModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    res.json({
      status: "success",
      success: true,
      results: agreements.length,
      data: agreements,
      pagination: {
        skip,
        limit,
        totalCount,
        page,
        totalPages,
        hasNextPage: skip + agreements.length < totalCount,
        hasPrevPage: skip > 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/docs/employment-agreement/:id - Get single agreement
export const getEmploymentAgreementById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isMongoId = mongoose.isValidObjectId(id);
    const query = isMongoId
      ? { _id: id, isActive: { $ne: false } }
      : { agreementId: id, isActive: { $ne: false } };

    const agreement = await EmploymentAgreementModel.findOne(query);
    if (!agreement) {
      return res.status(404).json({ status: "error", message: "Employment agreement not found" });
    }

    res.json({
      status: "success",
      data: agreement,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/docs/employment-agreement - Create new agreement
export const createEmploymentAgreement = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const employeeName = body.parties?.employeeName || body.সাধারণ_তথ্য?.কর্মচারীর_পূর্ণ_নাম;

    if (!employeeName || !employeeName.trim()) {
      return res.status(400).json({
        status: "error",
        message: "কর্মচারীর পূর্ণ নাম (Employee Full Name) আবশ্যক।",
      });
    }

    const mappedData = mapPayloadToBengaliSchema(body);
    const agreement = await EmploymentAgreementModel.create(mappedData);

    logger.info({ agreementId: agreement.agreementId, _id: agreement._id, employeeName }, "Created Employment Agreement");

    res.status(201).json({
      status: "success",
      message: "নিয়োগ চুক্তিপত্র সফলভাবে সংরক্ষণ করা হয়েছে।",
      data: agreement,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/docs/employment-agreement/:id - Update agreement
export const updateEmploymentAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isMongoId = mongoose.isValidObjectId(id);
    const query = isMongoId ? { _id: id } : { agreementId: id };

    const body = req.body ?? {};
    const mappedData = mapPayloadToBengaliSchema(body);

    const agreement = await EmploymentAgreementModel.findOneAndUpdate(query, mappedData, {
      new: true,
      runValidators: true,
    });

    if (!agreement) {
      return res.status(404).json({ status: "error", message: "Employment agreement not found" });
    }

    res.json({
      status: "success",
      message: "নিয়োগ চুক্তিপত্র সফলভাবে আপডেট করা হয়েছে।",
      data: agreement,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/docs/employment-agreement/:id - Delete agreement
export const deleteEmploymentAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isMongoId = mongoose.isValidObjectId(id);
    const query = isMongoId ? { _id: id } : { agreementId: id };

    const agreement = await EmploymentAgreementModel.findOneAndUpdate(
      query,
      { isActive: false },
      { new: true }
    );

    if (!agreement) {
      return res.status(404).json({ status: "error", message: "Employment agreement not found" });
    }

    res.json({
      status: "success",
      message: "নিয়োগ চুক্তিপত্র মুছে ফেলা হয়েছে।",
    });
  } catch (err) {
    next(err);
  }
};
