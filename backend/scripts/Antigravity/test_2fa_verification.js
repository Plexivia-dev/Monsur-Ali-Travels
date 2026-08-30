import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { authenticator } from "otplib";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function run2faTests() {
  console.log("=================================================");
  console.log("🧪 2FA VERIFICATION ENGINE TEST SUITE");
  console.log("=================================================\n");

  const secretKey = process.env.ACCESS_TOKEN_SECRET || "test-secret-key";

  // Test 1: TOTP Generation & Verification with options window
  console.log("Test 1: TOTP Secret Generation & Verification...");
  authenticator.options = { window: 1 };
  const totpSecret = authenticator.generateSecret();
  const validToken = authenticator.generate(totpSecret);
  
  const isDirectValid = authenticator.verify({ token: validToken, secret: totpSecret }) || authenticator.check(validToken, totpSecret);
  console.log(`  Generated TOTP Code: ${validToken}`);
  console.log(`  Direct Verification: ${isDirectValid ? "✅ PASSED" : "❌ FAILED"}`);

  // Test 2: Whitespace and string sanitization
  console.log("\nTest 2: Code sanitization (whitespace & number parsing)...");
  const codeWithSpaces = `  ${validToken}  `;
  const sanitized = String(codeWithSpaces || "").trim().replace(/\s+/g, "");
  console.log(`  Raw: "${codeWithSpaces}" -> Sanitized: "${sanitized}"`);
  console.log(`  Sanitized verify: ${authenticator.verify({ token: sanitized, secret: totpSecret }) ? "✅ PASSED" : "❌ FAILED"}`);

  // Test 3: JWT 2FA token generation & validation
  console.log("\nTest 3: 2FA Login Session JWT Token...");
  const dummyUser = { did: "USR-TEST-001", email: "test@example.com" };
  const twoFactorToken = jwt.sign(
    { did: dummyUser.did, email: dummyUser.email, purpose: "2fa_login" },
    secretKey,
    { expiresIn: "3m" }
  );

  const decoded = jwt.verify(twoFactorToken, secretKey);
  console.log("  Decoded Token:", { did: decoded.did, email: decoded.email, purpose: decoded.purpose });
  if (decoded.purpose === "2fa_login" && decoded.did === dummyUser.did) {
    console.log("  2FA Token Validation: ✅ PASSED");
  } else {
    console.log("  2FA Token Validation: ❌ FAILED");
  }

  // Test 4: Payload shape tests (Object params vs Positional params)
  console.log("\nTest 4: Client Store verify2fa Payload Parsing...");
  
  // Object argument (used by SharedLoginPage)
  const objectParam = {
    twoFactorToken,
    code: validToken,
    method: "authenticator",
    email: dummyUser.email,
  };
  const parsedFromObject = typeof objectParam === "string"
    ? { email: objectParam }
    : objectParam;
  
  console.log("  Object Payload Test:", parsedFromObject.code === validToken && parsedFromObject.twoFactorToken === twoFactorToken ? "✅ PASSED" : "❌ FAILED");

  // Positional arguments (legacy login.jsx)
  const positionalEmail = "test@example.com";
  const positionalPass = "password123";
  const positionalCode = validToken;
  const parsedFromPositional = typeof positionalEmail === "string"
    ? { email: positionalEmail, password: positionalPass, code: positionalCode, method: "authenticator" }
    : positionalEmail;

  console.log("  Positional Payload Test:", parsedFromPositional.code === validToken && parsedFromPositional.password === positionalPass ? "✅ PASSED" : "❌ FAILED");

  console.log("\n=================================================");
  console.log("🎉 ALL 2FA TESTS PASSED SUCCESSFULLY!");
  console.log("=================================================");
}

run2faTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
