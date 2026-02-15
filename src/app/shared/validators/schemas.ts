import { z } from 'zod';

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');

export const todoCreateSchema = z.object({
    title: z
        .string()
        .transform(normalize)
        .refine((v) => v.length > 0, 'El título es obligatorio')
        .refine((v) => v.length <= 80, 'Máximo 80 caracteres'),
    categoryId: z.string().trim().nullable().optional(),
});

export const todoUpdateSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'El título es obligatorio')
        .max(80, 'Máximo 80 caracteres')
        .optional(),
    completed: z.boolean().optional(),
    categoryId: z.string().trim().nullable().optional(),
});

export const categoryCreateSchema = z.object({
    name: z
        .string()
        .transform(normalize)
        .refine((v) => v.length > 0, 'El nombre es obligatorio')
        .refine((v) => v.length <= 30, 'Máximo 30 caracteres'),
    color: z.string().trim().optional(),
});

export const categoryUpdateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio')
        .max(30, 'Máximo 30 caracteres')
        .optional(),
    color: z.string().trim().optional(),
});
