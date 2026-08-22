import { z } from "zod";

export const createSubmissionSchema = z.object({
  eventId: z.string().uuid(),
  guestName: z.string().min(1).max(100),
  frameId: z.string().uuid().nullable(),
  photoObjectKey: z.string().min(1),
  audioObjectKey: z.string().min(1).nullable(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
