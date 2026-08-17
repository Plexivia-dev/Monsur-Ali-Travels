async function testHttp() {
  try {
    const res1 = await fetch("http://localhost:5092/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ihkhan997@gmail.com", password: "11223345" })
    });
    const data1 = await res1.json();
    console.log("Account 1 (ihkhan997@gmail.com) status:", res1.status, data1);

    const res2 = await fetch("http://localhost:5092/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "mr.monsur1988@gmail.com", password: "11223345" })
    });
    const data2 = await res2.json();
    console.log("Account 2 (mr.monsur1988@gmail.com) status:", res2.status, data2);
  } catch (e) {
    console.error("Test failed:", e);
  }
}

testHttp();
