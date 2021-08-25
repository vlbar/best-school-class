export const toLocaleSecondsString = seconds => {
    return timeToRuLocale(seconds, 'секунда', 'секунды', 'секунд')
}

export const toLocaleMinutesString = minutes => {
    return timeToRuLocale(minutes, 'минута', 'минуты', 'минут')
}

export const toLocaleHoursString = hours => {
    return timeToRuLocale(hours, 'час', 'часа', 'часов')
}

export const toLocaleDaysString = days => {
    return timeToRuLocale(days, 'день', 'дня', 'дней')
}

const timeToRuLocale = (time, one, two, more) => {
    if (time % 10 == 1) return `${time} ${one}`
    else if (time % 10 >= 2 && time % 10 <= 4) return `${time} ${two}`
    else return `${time} ${more}`
}

const TYPE_NUMERIC = 'NUMERIC'
const TYPE_LONG = 'LONG'

const FORMAT_DAYS = 'd'
const FORMAT_HOURS = 'h'
const FORMAT_MINUTES = 'm'
const FORMAT_SECONDS = 's'

/*
    options = {
        trim: boolean,      (hide time if 0)
        format: string,     (replace d\h\m\s to formatted time if provided, text in [] will be ignored (example: 'd [h]' => '3 дня h'))
        type: numeric/long  (way of displaying the number (numeric as 2 digits adn more, long as num with words :\))
    }
*/

const defaultOptions = { type: TYPE_LONG, trim: true, format: 'd h m' }
export const toLocaleTimeDurationString = (seconds, options = defaultOptions) => {
    if (!options.format) options.format = 'd:h:m:s'

    // a это wee-wee lёt
    let isNeedDays = options.format.replace(/ *\[[^)]*\] */g, '').includes(FORMAT_DAYS)
    let isNeedHours = options.format.replace(/ *\[[^)]*\] */g, '').includes(FORMAT_HOURS)
    let isNeedMinutes = options.format.replace(/ *\[[^)]*\] */g, '').includes(FORMAT_MINUTES)
    let isNeedSeconds = options.format.replace(/ *\[[^)]*\] */g, '').includes(FORMAT_SECONDS)

    let resultString = options.format
    let currentSeconds = seconds

    const formatTime = (divide, formatChar, toLocaleCallback, pad = 0) => {
        let time = Math.floor(currentSeconds / divide)
        let timeFormatted = options.type.toUpperCase() === TYPE_LONG ? toLocaleCallback(time) : time.toString().padStart(pad, '0')
        if (options.trim && time === 0) timeFormatted = ''
        currentSeconds = currentSeconds % divide
        resultString = resultString.replace(formatChar, timeFormatted)
    }

    if (isNeedDays) formatTime(60 * 60 * 24, FORMAT_DAYS, days => toLocaleDaysString(days))
    if (isNeedHours) formatTime(60 * 60, FORMAT_HOURS, hours => toLocaleHoursString(hours), 2)
    if (isNeedMinutes) formatTime(60, FORMAT_MINUTES, minutes => toLocaleMinutesString(minutes), 2)
    if (isNeedSeconds) formatTime(1, FORMAT_SECONDS, seconds => toLocaleSecondsString(seconds), 2)

    return resultString.replace('[', '').replace(']', '')
}
