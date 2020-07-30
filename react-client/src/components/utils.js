import moment from 'moment';
require('twix');
const mds = require("moment-duration-format");
mds(moment);

export const validateTask = (day, start, end, schedule) => {
    if (schedule.hasOwnProperty(day)) {
        // loop over the day schedule and create a range array
        const entries = Object.entries(schedule[day]);
        const ranges = entries.filter(([x, y]) => { return (y[1] !== 0)}).map(([time, task]) => {
            const startTime = moment.utc(time, 'HH:mm')
            const tempStartTime = moment.utc(time, 'HH:mm')
            const endTime = tempStartTime.add(task[1], 'h')
            return moment.twix(startTime, endTime)
        })
        // create the new task range
        const newTaskRange = moment.twix(moment.utc(start, 'HH:mm'), moment.utc(end, 'HH:mm'))
        // check if the added task range overlaps with the schedule range
        const overlap = ranges.filter((range) => {
            return newTaskRange.overlaps(range)
        })
        return overlap.map((x => x.start().format('HH:mm')))
    }
    return []
}

export const nextTimeSlot = (startTime) => {
    const startMoment = moment.utc(startTime, "HH:mm")
    return startMoment.add(1, 'hours').format("HH:mm")
}

export const getTaskDuration = (start, end) => {
    const startTime = moment.utc(start, 'HH:mm').hours()
    const endTime = moment.utc(end, 'HH:mm').hours()
    if (end === '00:00' && start !== '00:00') {
        return 24 - startTime
    }
    return endTime - startTime
}

export const createViewSchedule = (dbSchedule) => {
    let newSchedule = {}
    Object.entries(dbSchedule).forEach(([day, slots]) => {
        newSchedule[day] = {}
        Object.entries(slots).forEach(([key, slot]) => {
            const duration = parseInt(slot['taskSlot'][1])
            const starthr = slot['startHour']
            newSchedule[day][starthr] = [slot['taskSlot'][0], duration]
            if (duration >=2) {
                let nextTaskSlot = nextTimeSlot(starthr)
                for (let i = duration - 1;  i > 0; i--) {
                    newSchedule[day][nextTaskSlot] = [slot['taskSlot'][0], 0]
                    nextTaskSlot = nextTimeSlot(nextTaskSlot)
                }
            }
        })
    })
    return newSchedule
}