import { Given, When, Then } from "@cucumber/cucumber";
import axios from 'axios';
import assert from "assert";
import dotenv from 'dotenv';

dotenv.config();

let token: string | null = null;
let response: axios.AxiosResponse;

Given('un administrador autenticado', function () {
  token = process.env.ADMIN_TOKEN || null;
});

When('envía una solicitud HTTPS [PUT] a {string} con un mensaje', async function (endpoint: string) {
  try {
    response = await axios.put(`${process.env.API_CANAL}${endpoint}`, {
        "mensaje": "Este es el mensaje enviado desde los testing"
    }
      , {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
  } catch (err: any) {
    response = err.response;
  }
});

Then('la API para el manejo de administradores responde con código {int}', function (statusCode: number) {
  assert.strictEqual(response.status, statusCode);
});