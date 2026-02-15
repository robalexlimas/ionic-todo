import { ZodError } from 'zod';

export function firstZodErrorMessage(err: ZodError): string {
    return err.issues?.[0]?.message ?? 'Datos inválidos';
}
