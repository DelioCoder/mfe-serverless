import "reflect-metadata";
import { Readable } from "stream";
import { S3Handler, S3Event } from "aws-lambda";
import * as yaml from "js-yaml";
import { v4 as uuid } from 'uuid';
import { streamToString } from "./resources/stream";
import { getFileFromBucket } from "./resources/s3";
import { insertIntoDynamoDB } from "./resources/dynamodb";
import { RelacionItem } from "./interfaces/relacion";
import { plainToInstance } from 'class-transformer';
import { MetadataDto } from "./dto/metadata-dto";
import { validate } from 'class-validator';

const RELACIONES_TABLE = process.env.RELACIONES_TABLE!;

export const handler: S3Handler = async (event: S3Event) => {
  try {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name; // nombre del bucket
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " ")); // path en S3

      const resp = await getFileFromBucket(bucket, key);
      if (!resp.Body) throw new Error("Archivo vacío");

      const fileContent = await streamToString(resp.Body as Readable);

      const metadataRaw = yaml.load(fileContent) as any;
      const metadataDto = plainToInstance(MetadataDto, metadataRaw);

      const errors = await validate(metadataDto, { whitelist: true, forbidNonWhitelisted: true });

      if (errors.length > 0) {
        console.error(errors);
        throw new Error("Metadata inválida");
      }

      for (const mfe of metadataDto.instancias) {
        const item: RelacionItem = {
          relacion_id: uuid(),
          app_cmdb: metadataDto.app_cmdb,
          module_cmdb: metadataDto.module_cmdb,
          categoria: metadataDto.categoria,
          estructura: metadataDto.estructura,
          mfe_id: mfe.codigo,
          nombre: mfe.nombre,
          tipo: mfe.tipo,
          version: mfe.version,
          repositorio: mfe.repositorio,
          path: mfe.path && mfe.path,
          estado: mfe.estado,
          funcionalidades: mfe.funcionalidades,
          // 🔹 Casuística 3: conexiones cruzadas (si vienen en el DTO)
          ...(mfe.conexiones && { conexiones: mfe.conexiones }),
          // 🔹 Casuística 4: múltiples auth (si vienen en el DTO)
          ...(mfe.authProviders && { authProviders: mfe.authProviders }),
          createdAt: Date.now(),
        };

        await insertIntoDynamoDB(RELACIONES_TABLE, item);

      }
    }
  } catch (err) {
    console.error("Error procesando archivo:", err);
    throw err;
  }
};