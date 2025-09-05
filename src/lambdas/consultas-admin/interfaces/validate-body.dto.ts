import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

export const bodyValidation = async<T>(body: string, dtoClass: new () => T) => {

    const input = JSON.parse(body || '');
    const bodyFormatted = plainToInstance(dtoClass, input);
    const errors = await validate(bodyFormatted as any, { whitelist: true, forbidNonWhitelisted: true });

     if (errors.length > 0) {
        throw new Error(JSON.stringify({ errors: "Validation failed", details: errors }));
    }

    return bodyFormatted;

}