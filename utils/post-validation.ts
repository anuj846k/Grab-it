import { z } from 'zod';

import { normalizePickupLocation } from '@/utils/location';

export const postFormSchema = z.object({
  title: z.string().trim().min(1, 'Add a title.'),
  description: z.string().trim().min(1, 'Add a description.'),
  condition: z.string().trim().min(1, 'Select a condition.'),
  category: z.string().trim().min(1, 'Select a category.'),
  images: z
    .array(
      z.object({
        uri: z.string().trim().min(1),
        base64: z.string().trim().min(1).optional(),
        type: z.string().optional(),
      }),
    )
    .min(1, 'Upload at least one photo.')
    .refine((images) => images.some((image) => image.base64), {
      message: 'Upload at least one valid photo.',
    }),
  neighborhood: z
    .string()
    .trim()
    .refine((value) => normalizePickupLocation(value) !== null, {
      message: 'Select a pickup location.',
    }),
  locationUrl: z.string().trim().url('Select a valid pickup location.'),
  city: z.string().trim().min(1, 'Select a pickup city.'),
});

export const editFormSchema = z.object({
  title: z.string().trim().min(1, 'Add a title.'),
  description: z.string().trim().min(1, 'Add a description.'),
  condition: z.string().trim().min(1, 'Select a condition.'),
  category: z.string().trim().min(1, 'Select a category.'),
  images: z
    .array(
      z.object({
        uri: z.string().trim().min(1),
        base64: z.string().trim().min(1).optional(),
        type: z.string().optional(),
      }),
    )
    .min(1, 'Upload at least one photo.'),
  neighborhood: z
    .string()
    .trim()
    .refine((value) => normalizePickupLocation(value) !== null, {
      message: 'Select a pickup location.',
    }),
  locationUrl: z.string().trim().url('Select a valid pickup location.').nullable(),
  city: z.string().trim().min(1, 'Select a pickup city.'),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

export const getValidationMessage = (error: z.ZodError) =>
  error.issues.map((issue) => issue.message).join('\n');
