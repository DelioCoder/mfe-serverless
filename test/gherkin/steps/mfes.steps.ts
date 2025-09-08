import { Given, When, Then } from "@cucumber/cucumber";
import request, { Response } from "supertest";
import assert from "assert";

let response: Response;
let createdId: string;

Given("un usuario autenticado", function () {
  // Aquí podrías guardar un token JWT válido si tu API requiere Cognito
  // this.token = "Bearer eyJ....";
});

When("envía un POST a {string} con datos válidos", async function (endpoint: string) {
  response = await request("http://localhost:3000")
    .post(endpoint)
    .set("Authorization", this.token || "")
    .send({
      nombre: "gherkin-test",
      dominio: "gherkin.com",
      tipo: "pagina",
      criticidad: "medio",
      estado: "pendiente",
      descripcion: "test gherkin",
      repositorio: "https://github.com/empresa/widget-gherkin",
      versionReact: "16.14.0",
      versionReactDom: "16.14.0",
      versionMfe: "0.5.2",
      equipo: "QA",
      solicitado_por: "qa@test.com",
    });

  createdId = response.body.id;
});

Then("la API responde con código {int}", function (statusCode: number) {
  assert.strictEqual(response.status, statusCode);
});

Then("la respuesta contiene el campo {string} igual a {string}", function (field: string, value: string) {
  assert.strictEqual(response.body[field], value);
});

Given("un administrador autenticado", function () {
  // Aquí podrías simular un token de admin
  // this.token = "Bearer adminToken..."
});

When("envía un PUT a {string} con un mensaje", async function (endpoint: string) {
  const finalEndpoint = endpoint.replace("{id}", createdId || "123");
  response = await request("http://localhost:3000")
    .put(finalEndpoint)
    .set("Authorization", this.token || "")
    .send({ mensaje: "Aprobado por QA" });
});

Then("el campo {string} debe ser {string}", function (field: string, value: string) {
  assert.strictEqual(response.body[field], value);
});
