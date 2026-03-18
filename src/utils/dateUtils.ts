import dayjs from 'dayjs'

// Function to add days to a date
export function addDays(date: Date, days: number) {
    const newDate = new Date(date)
    newDate.setDate(date.getDate() + days)
    return newDate
}

export function getRandomAPODDate() {
    const start = dayjs('1995-06-16')
    const end = dayjs()
    const diff = end.diff(start, 'day')
    const randomDays = Math.floor(Math.random() * diff)
    return start.add(randomDays, 'day')
}