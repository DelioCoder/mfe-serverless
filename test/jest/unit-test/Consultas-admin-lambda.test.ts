import { handler } from "../../../src/lambdas/consultas-admin";
import * as dynamo from "../../../src/lambdas/consultas-admin/resources/dynamodb";
import * as audit from "../../../src/lambdas/consultas-admin/resources/dynamodb/audit";
import * as email from "../../../src/lambdas/consultas-admin/resources/sns";

// Jest Mocks
jest.spyOn(dynamo, "getRequestById").mockResolvedValue({
  detalle: { mfe_id: "mfe-001", nombre: "Estructura", tipo: "pagina" },
  solicitado_por: "test@example.com"
} as any);
jest.spyOn(dynamo, "getMfeById").mockResolvedValue({ mfe_id: "mfe-001" } as any);
jest.spyOn(dynamo, "updateMfeApproved").mockResolvedValue(undefined as any);
jest.spyOn(dynamo, "updateMfeRequestStatus").mockResolvedValue(undefined as any);
jest.spyOn(dynamo, "updateSecuencialTable").mockResolvedValue({ Attributes: { lastNumber: 1 } } as any);
jest.spyOn(dynamo, "insertMfeApproved").mockResolvedValue(undefined as any);
jest.spyOn(audit, "insertIntoAuditTable").mockResolvedValue(undefined as any);
jest.spyOn(email, "sendEmail").mockResolvedValue(undefined as any);

describe("Unit Test - consultasAdminLambda", () => {
  it("debería aprobar un MFE existente", async () => {
    const event = {
      httpMethod: "PUT",
      resource: "/admin/mfes-request/{id}/approve",
      path: "/admin/mfes-request/123/approve",
      pathParameters: { id: "123" },
      requestContext: {
        authorizer: {
          claims: {
            "cognito:groups": ["admin"],
            "cognito:username": "adminUser"
          }
        }
      },
      body: JSON.stringify({ mensaje: "Aprobado en test" }),
    };

    const result = await handler(event as any);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toContain("aprobada");
  });
});
