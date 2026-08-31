import { calculateAge } from "@/features/students/domain/age";

export type TournamentSnapshot = {
  fullName: string;
  birthDate: Date;
  age: number;
  weight?: number;
  height?: number;
  gradeId: string;
  gradeName: string;
};

export function createTournamentSnapshot(student: {
  firstName: string; lastName: string; birthDate: Date; weight?: number; height?: number; currentGradeId: string;
}, gradeName: string, registrationDate: Date): TournamentSnapshot {
  return {
    fullName: `${student.firstName.trim()} ${student.lastName.trim()}`,
    birthDate: new Date(student.birthDate),
    age: calculateAge(student.birthDate, registrationDate),
    weight: student.weight,
    height: student.height,
    gradeId: student.currentGradeId,
    gradeName,
  };
}
