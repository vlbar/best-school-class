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

export function fromStateToParameter(state) {
  if (state == TEACHER) return "r=t";
  if (state == STUDENT) return "r=s";
  if (state == HELPER) return "r=a";
}
