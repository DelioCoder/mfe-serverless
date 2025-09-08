import { handler } from "../../../src/lambdas/consultas-relaciones";
import * as dynamo from "../../../src/lambdas/consultas-relaciones/resources/dynamodb";

jest.spyOn(dynamo, "getRelacionesByMfeId").mockResolvedValue({
  plataforma: "BackOffice Finanzas",
  mfes: [
    { mfe_id: "mfe-001", mfe_nombre: "Estructura", repositorio: "https://github.com/empresa/finanzas-estructura" },
    { mfe_id: "mfe-002", mfe_nombre: "Remesas", repositorio: "https://github.com/empresa/finanzas-remesas" },
  ],
});

describe("Unit Test - relacionesLambda", () => {
  it("debería devolver relaciones de un MFE", async () => {
    const event = {
      httpMethod: "GET",
      resource: "/mfe-relaciones/{id}",
      pathParameters: { id: "mfe-001" },
    };

    const result = await handler(event as any);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.plataforma).toBe("BackOffice Finanzas");
    expect(body.mfes).toHaveLength(2);
  });
});
