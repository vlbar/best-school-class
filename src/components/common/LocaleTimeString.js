export const toLocaleSecondsString = seconds => {
    if (seconds == 1) return '1 секунда'
    else if (seconds >= 2 && seconds <= 4) return `${seconds} секунды`
    else return `${seconds} секунд`
}

export const toLocaleMinutesString = minutes => {
    if (minutes == 1) return '1 минута'
    else if (minutes >= 2 && minutes <= 4) return `${minutes} минуты`
    else return `${minutes} минут`
}

export const toLocaleHoursString = hours => {
    if (hours == 1) return '1 час'
    else if (hours >= 2 && hours <= 4) return `${hours} часа`
    else return `${hours} часов`
}

export const toLocaleDaysString = days => {
    if (days == 1) return '1 день'
    else if (days >= 2 && days <= 4) return `${days} дня`
    else return `${days} дней`
}

export const toLocaleTimeDurationString = seconds => {
    let remainSeconds = seconds % 60

    let minutes = Math.floor(seconds / 60)
    let remainMinutes = minutes % 60

    let hours = Math.floor(minutes / 60)
    let remainHours = hours % 60

    let days = Math.floor(hours / 24)

    return `${days > 0 ? toLocaleDaysString(days) + '' : ''}
    ${remainHours > 0 ? toLocaleHoursString(remainHours) + ' ' : ''}
    ${remainMinutes > 0 ? toLocaleMinutesString(remainMinutes) + ' ' : ''}
    ${remainSeconds > 0 ? toLocaleSecondsString(remainSeconds) + ' ' : ''}`
}
