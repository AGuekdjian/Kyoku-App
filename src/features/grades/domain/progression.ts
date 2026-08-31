export type Grade = { id: string; order: number; active: boolean };

export function nextGrade(currentId: string, grades: readonly Grade[]): Grade | null {
  const current = grades.find((grade) => grade.id === currentId);
  if (!current) throw new Error("Current grade does not exist");
  return grades.filter((grade) => grade.active && grade.order > current.order).sort((a, b) => a.order - b.order)[0] ?? null;
}

export function assertGradeProgression(from: Grade, to: Grade): void {
  if (!to.active || to.order <= from.order) throw new Error("INVALID_GRADE_PROGRESSION");
}
