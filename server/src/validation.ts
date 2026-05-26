import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(80, 'Имя слишком длинное'),
  phone: z
    .string()
    .trim()
    .min(10, 'Укажите корректный телефон')
    .max(20, 'Телефон слишком длинный')
    .regex(/^[\d\s+()-]+$/, 'Телефон может содержать только цифры и +()-'),
  email: z.string().trim().email('Некорректный email'),
  comment: z
    .string()
    .trim()
    .min(10, 'Комментарий должен быть не короче 10 символов')
    .max(2000, 'Комментарий слишком длинный'),
});

export const improveTextSchema = z.object({
  text: z
    .string()
    .trim()
    .min(5, 'Текст слишком короткий для улучшения')
    .max(2000, 'Текст слишком длинный'),
  context: z.enum(['comment', 'greeting']).optional().default('comment'),
});

export type ContactPayload = z.infer<typeof contactSchema>;
export type ImproveTextPayload = z.infer<typeof improveTextSchema>;
