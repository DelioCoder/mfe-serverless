import { handler } from "../../../src/lambdas/consultas-mfe";
import * as dynamo from "../../../src/lambdas/consultas-mfe/resources/dynamodb";

jest.spyOn(dynamo, "getAllMfes").mockResolvedValue({
  Items: [{ mfe_id: "mfe-001", nombre: "Test" }],
  LastEvaluatedKey: null
} as any);
describe("Unit Test - consultasLambda", () => {
  it("GET /mfes debería devolver lista de MFEs", async () => {
    const event = {
      httpMethod: "GET",
      resource: "/mfes",
      queryStringParameters: { limit: "5" }
    };

    const result = await handler(event as any);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });
});