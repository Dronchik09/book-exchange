import * as yup from 'yup';
import { createHttpError } from './http-error';

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Ім'я має містити щонайменше 2 символи")
    .required("Ім'я є обов'язковим"),
  email: yup
    .string()
    .trim()
    .email('Введіть коректну адресу електронної пошти')
    .required('Email є обов’язковим'),
  password: yup
    .string()
    .min(6, 'Пароль має містити щонайменше 6 символів')
    .required('Пароль є обов’язковим'),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Введіть коректну адресу електронної пошти')
    .required('Введіть email'),
  password: yup.string().required('Введіть пароль'),
});

export const updateProfileSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Ім'я має містити щонайменше 2 символи")
    .optional(),
  email: yup
    .string()
    .trim()
    .email('Введіть коректну адресу електронної пошти')
    .optional(),
  avatar: yup.string().nullable().optional(),
});

export const createBookSchema = yup.object({
  name: yup.string().trim().required('Введіть назву книги'),
  author: yup.string().trim().required('Введіть автора книги'),
  photo: yup.string().nullable().optional(),
  description: yup.string().nullable().optional(),
});

export const updateBookSchema = yup.object({
  name: yup.string().trim().min(1, 'Назва книги не може бути порожньою').optional(),
  author: yup.string().trim().min(1, 'Ім’я автора не може бути порожнім').optional(),
  photo: yup.string().nullable().optional(),
  description: yup.string().nullable().optional(),
});

export const updateExchangeStatusSchema = yup.object({
  status: yup
    .string()
    .oneOf(['ACCEPTED', 'REJECTED'], 'Статус має бути ACCEPTED або REJECTED')
    .required('Статус є обов’язковим'),
});

export const validateBody = <T extends yup.AnyObject>(
  schema: yup.ObjectSchema<T>,
  data: unknown
): T => {
  try {
    return schema.validateSync(data, { abortEarly: true, stripUnknown: true }) as T;
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      throw createHttpError(400, err.message);
    }
    throw err;
  }
};
