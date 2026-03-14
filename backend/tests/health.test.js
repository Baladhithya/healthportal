const request = require("supertest");
const app = require("../server");

describe("Health Check API", () => {

  test("GET /api/health should return status ok", async () => {

    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");

  });

});