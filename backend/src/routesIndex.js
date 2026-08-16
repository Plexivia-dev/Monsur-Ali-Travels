import { Router } from "express";

// Retail / E-commerce routes commented out for standalone ERP operations
// import productsRouter from "./routes/ProductsRoute.js";
// import imagesRouter from "./routes/ImagesRoute.js";
import authRouter from "./routes/AuthRoute.js";
import usersRouter from "./routes/UsersRoute.js";
import assetsRouter from "./routes/AssetsRoute.js";
import membersRouter from "./routes/MembersRoute.js";
import emailRouter from "./routes/EmailRoute.js";
import ordersRouter from "./routes/OrdersRoute.js";
import paymentsRouter from "./routes/PaymentsRoute.js";
import billingRouter from "./routes/BillingRoute.js";
// import categoriesRouter from "./routes/CategoryRoute.js";
// import brandRouter from "./routes/BrandRoute.js";
import dashboardRouter from "./routes/DashboardRoute.js";
// import couponRouter from "./routes/CouponRoute.js";
import systemRouter from "./routes/SystemRoute.js";
// import searchRouter from "./routes/SearchRoute.js";
// import { searchProducts } from "./controllers/SearchController.js";

import candidateRouter from "./routes/CandidateRoute.js";
import docsRouter from "./routes/DocsRoute.js";

const coreRouter = Router();

// Core ERP Operational Routes
coreRouter.use("/auth", authRouter);
coreRouter.use("/users", usersRouter);
coreRouter.use("/assets", assetsRouter);
coreRouter.use("/members", membersRouter);
coreRouter.use("/candidates", candidateRouter);
coreRouter.use("/docs", docsRouter);
coreRouter.use("/sendEmail", emailRouter);
coreRouter.use("/orders", ordersRouter);
coreRouter.use("/payments", paymentsRouter);
coreRouter.use("/billing", billingRouter);
coreRouter.use("/dashboard", dashboardRouter);
coreRouter.use("/system", systemRouter);

// Inventory & Retail Routes (Preserved/Commented Out for Future ERP Stock Integration)
// coreRouter.use("/products", productsRouter);
// coreRouter.use("/images", imagesRouter);
// coreRouter.use("/categories", categoriesRouter);
// coreRouter.use("/brands", brandRouter);
// coreRouter.use("/coupons", couponRouter);
// coreRouter.use("/search", searchRouter);
// coreRouter.get("/search-products", searchProducts);

export default coreRouter;
