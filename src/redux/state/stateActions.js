export const types = {
  TEACHER: "teacher",
  STUDENT: "student",
  ASSISTANT: "assistant",
};

export const { TEACHER, STUDENT, ASSISTANT } = types;

export function fromStateToName(state) {
  if (state == TEACHER) return "Преподаватель";
  if (state == STUDENT) return "Ученик";
  if (state == ASSISTANT) return "Помощник";
}

export function fromStateToParameter(state) {
  if (state == TEACHER) return "role=teacher";
  if (state == STUDENT) return "role=student";
  if (state == ASSISTANT) return "role=assistant";
}

export function fromStateToIcon(state) {
  if (state == TEACHER) return "fas fa-user-tie";
  if (state == STUDENT) return "fas fa-user-graduate";
  if (state == ASSISTANT) return "fas fa-hands-helping";
}
