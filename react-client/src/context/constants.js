// for tab control
export const DISPATCHER = 0
export const DRIVER = 1

// users ids and names
export const DISPATCHER_ROLE = "dispatcher"
export const DISPATCHER_NAME = "fancy-dispatcher"
export const FIERCE_BOB_ROLE = "driver"
export const FIERCE_BOB_NAME = "fierce-bob"
export const ELEGANT_TESLA_ROLE = "driver"
export const ELEGANT_TESLA_NAME = "elegant-tesla"
export const HOPEFUL_HAMILTON_ROLE = "driver"
export const HOPEFUL_HAMILTON_NAME = "hopeful-hamilton"

// convert id to name
export const DRIVERS = {
    "fierce-bob": "Fierce Bob",
    "elegant-tesla": "Elegant Tesla",
    "hopeful-hamilton": "Hopeful Hamilton"
}

// task names
export const TASK_PICK_UP = "Pickup"
export const TASK_DROP_OFF = "Drop-off"
export const TASK_OTHER = "Other"

// table header names
export const TIME_SLOT = "Time Slot"
export const MONDAY = "Monday 1"
export const TUESDAY = "Tuesday 2"
export const WEDNESDAY = "Wednesday 3"
export const THURSDAY = "Thursday 4"
export const FRIDAY = "Friday 5"
export const SATURDAY = "Saturday 6"
export const SUNDAY = "Sunday 7"

// convert day ints to days
export const DAY_INT = {
    1: MONDAY,
    2: TUESDAY,
    3: WEDNESDAY,
    4: THURSDAY,
    5: FRIDAY,
    6: SATURDAY,
    7: SUNDAY
}

// default start and end times
export const DEFAULT_START_HR = "00:00"
export const DEFAULT_END_HR = "01:00"

// define year and week days to build the timetable
export const YEAR_WEEKS = new Array(52).fill(0, 0, 52)
export const INT_WEEK_DAYS = ['1', '2', '3', '4', '5', '6', '7']

// used for building time table
export const WEEK_DAYS = [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
export const TABLE_ROWS_HEADER = [TIME_SLOT, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
export const TIME_SLOTS = [
    ["00:00","00:00 - 01:00"],
    ["01:00","01:00 - 02:00"],
    ["02:00","02:00 - 03:00"],
    ["03:00","03:00 - 04:00"],
    ["04:00","04:00 - 05:00"],
    ["05:00","05:00 - 06:00"],
    ["06:00","06:00 - 07:00"],
    ["07:00","07:00 - 08:00"],
    ["08:00","08:00 - 09:00"],
    ["09:00","09:00 - 10:00"],
    ["10:00","10:00 - 11:00"],
    ["11:00","11:00 - 12:00"],
    ["12:00","12:00 - 13:00"],
    ["13:00","13:00 - 14:00"],
    ["14:00","14:00 - 15:00"],
    ["15:00","15:00 - 16:00"],
    ["16:00","16:00 - 17:00"],
    ["17:00","17:00 - 18:00"],
    ["18:00","18:00 - 19:00"],
    ["19:00","19:00 - 20:00"],
    ["20:00","20:00 - 21:00"],
    ["21:00","21:00 - 22:00"],
    ["22:00","22:00 - 23:00"],
    ["23:00","23:00 - 00:00"],
]