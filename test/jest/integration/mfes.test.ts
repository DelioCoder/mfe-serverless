import axios from "axios";

describe("Integración - /mfes", () => {
  it("[GET] /mfes debería devolver listado de MFEs", async () => {
    const res = await axios.get(`${process.env.API_CANAL}/mfes`, {
      headers: { Authorization: `Bearer ${process.env.USER_TOKEN}` },
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.data)).toBe(true);
  });

  it("[GET] /mfes/{term} debería devolver un MFE filtrado", async () => {
    const res = await axios.get(`${process.env.API_CANAL}/mfes/PerfilUsuario`, {
      headers: { Authorization: `Bearer ${process.env.USER_TOKEN}` },
    });

    expect(res.status).toBe(200);
    expect(res.data.mfe_id).toBeDefined();
  });
});
