import { store } from "react-notifications-component";

export const errorNotification = {
  title: "Произошла ошибка",
  message:
    "Что-то пошло не так, перезагрузите страницу. Если ошибка повторится то попробуйте позже",
  type: "danger",
  insert: "top",
  container: "top-right",
  animationIn: ["animate__animated animate__fadeIn"],
  animationOut: ["animate__animated animate__fadeOut"],
  showIcon: true,
  dismiss: {
    duration: 15000,
    onScreen: true,
  },
};

export function createError(msg, err) {
  var errorMsg =
    "Что-то пошло не так, перезагрузите страницу. Если ошибка повторится, то попробуйте позже";
  if (err.response?.data?.message) errorMsg = err.response?.data?.message;
  else errorMsg = err.message;
  store.addNotification({
    ...errorNotification,
    message: `${msg}\n ${errorMsg}`,
  });
}
