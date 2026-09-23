export const ROLE = {
  STUDENT: "student",
  DOZENT: "dozent",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
