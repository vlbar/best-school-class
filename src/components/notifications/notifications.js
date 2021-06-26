export const errorNotification = {
    title: "Произошла ошибка",
    message: "Что-то пошло не так, перезагрузите страницу. Если ошибка повторится то попробуйте позже",
    type: "danger",
    insert: "top",
    container: "top-right",
    animationIn: ["animate__animated animate__fadeIn"],
    animationOut: ["animate__animated animate__fadeOut"],
    showIcon: true,
    dismiss: {
        duration: 15000,
        onScreen: true
    }
}