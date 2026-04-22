
export const validateTime = (time) => {
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time)
}
export const isDigit = (digit) => {
    const regex = /^\d+$/
    return regex.test(digit)
}
export const formatDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}