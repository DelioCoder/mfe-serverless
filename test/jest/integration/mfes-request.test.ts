import axios from 'axios';
describe("Integración - /mfes/requests", () => {
  it("POST /mfes/requests debería crear una solicitud", async () => {
    const res = await axios.post(
      `${process.env.API_CANAL}/mfes/requests`,
      {
        nombre: "integration-test",
        dominio: "it.com",
        tipo: "pagina",
        criticidad: "medio",
        estado: "pendiente",
        descripcion: "test",
        repositorio: "https://github.com/empresa/it",
        versionReact: "16.14.0",
        versionReactDom: "16.14.0",
        versionMfe: "0.5.2",
        equipo: "Integration",
        solicitado_por: "integration@test.com",
      },
      {
        headers: { Authorization: `Bearer ${process.env.USER_TOKEN}` },
      }
    );

    expect(res.status).toBe(201);
  });
});
