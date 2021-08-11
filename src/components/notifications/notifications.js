import { store } from 'react-notifications-component'

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

export const infoNotification = {
    message: "Ну тут должно быть важное сообщение, но его никто не написал :(",
    type: "info",
    insert: "top",
    container: "top-right",
    animationIn: ["animate__animated animate__fadeIn"],
    animationOut: ["animate__animated animate__fadeOut"],
    showIcon: true,
    dismiss: {
        duration: 8000,
        onScreen: true
    }
}

export const addErrorNotification = (message) => {
    store.addNotification({
        ...errorNotification,
        message: message
    });
}

// как же хочется перегрузочку
export const addInfoNotification = (message, title) => {
    store.addNotification({
        ...infoNotification,
        title: title,
        message: message
    });
}