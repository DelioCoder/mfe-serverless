import { Given, When, Then } from "@cucumber/cucumber";
import axios from 'axios';
import assert from "assert";
import dotenv from 'dotenv';

dotenv.config();

let token: string | null = null;
let response: axios.AxiosResponse;

Given('un usuario autenticado', function () {
  token = process.env.USER_TOKEN || null;
});

When('envía un POST a {string} con datos válidos', async function (endpoint: string) {
  try {
    response = await axios.post(`${process.env.API_CANAL}${endpoint}`, {
      "nombre": "test",
      "dominio": "test.com",
      "tipo": "pagina",
      "criticidad": "medio",
      "estado": "pendiente",
      "descripcion": "test",
      "repositorio": "https://github.com/empresa/widget-clima",
      "versionReact": "16.14.0",
      "versionReactDom": "16.14.0",
      "versionMfe": "0.5.2",
      "equipo": "Test",
      "solicitado_por": "someoneordavid@gmail.com"
    }
      , {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
  } catch (err: any) {
    response = err.response;
  }
});

Then('la API responde con código {int}', function (statusCode: number) {
  assert.strictEqual(response.status, statusCode);
});

Then('la respuesta contiene el campo message es igual a {string}', function (message: string) {
  assert.ok(response.data.message === message);
});