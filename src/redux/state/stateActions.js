const types = {
  TEACHER: "teacher",
  STUDENT: "student",
  HELPER: "helper",
};

export const { TEACHER, STUDENT, HELPER } = types;

export function fromStateToName(state) {
  if (state == TEACHER) return "Преподаватель";
  if (state == STUDENT) return "Ученик";
  if (state == HELPER) return "Помощник";
}

export function fromStateToPath(state) {
  if (state == TEACHER) return "/teacher";
  if (state == STUDENT) return "/student";
  if (state == HELPER) return "/helper";
}
