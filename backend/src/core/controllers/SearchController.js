import { ProductModel } from "../models/product.model.js";
import { buildProductImageUrl } from "../utils/imageUrl.js";

export const searchProducts = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      res.json({ data: [] });
      return;
    }

    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "12", 10)));
    const regex = { $regex: q, $options: "i" };

    const filter = {
      $or: [{ name: regex }, { "brand.name": regex }, { "categories.name": regex }],
    };

    const docs = await ProductModel.find(filter).limit(limit).lean();

    const results = docs.map((p) => {
      const category = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0].name : null;
      const brand = p.brand?.name || null;
      const imageUrl = buildProductImageUrl(p.thumbnail?.url);

      return {
        id: p._id?.toString?.() ?? p.id,
        name: p.name,
        category,
        brand,
        image: imageUrl,
      };
    });

    res.json({ data: results });
  } catch (err) {
    next(err);
  }
};
