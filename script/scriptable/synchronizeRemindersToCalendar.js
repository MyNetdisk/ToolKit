let durMonth = 1
const startDate = new Date()
startDate.setMonth(startDate.getMonth()-durMonth)
console.log(`日历开始时间：${startDate.toLocaleDateString()}`)

const endDate = new Date()
endDate.setMonth(endDate.getMonth()+durMonth)
console.log(`日历结束时间：${endDate.toLocaleDateString()}`)

const reminders = await Reminder.allDueBetween(startDate,endDate)
console.log(`获取${reminders.length}条提醒事项`)

let calendar = await Calendar.forEvents()

// 获取日历名及对应的日历
let mDict = {}

for(let cal of calendar){
    mDict[cal.title] = cal
}

const events = await CalendarEvent.between(startDate,endDate,calendar)
console.log(`获取${events.length}日历`)

let remindersIdSet = new Set(reminders.map(e=>e.identifier))
// 删除日历里提醒事项删除的事项
let eventsCreated = events.filter(e=>e.notes != null && e.notes.includes("[Reminder]"))
for(let event of eventsCreated){
    let reg = /(\[Reminder\])\s([A-Z0-9\-]*)/
    let r = event.notes.match(reg)
    if(!remindersIdSet.has(r[2])){
        event.remove()
    }
}

for(const reminder of reminders){
    // reminder的标识符
    const targetNode = `[Reminder] ${reminder.identifier}`
    const [targetEvent] = events.filter(e => e.notes != null && e.notes.includes(targetNode))//过滤重复的reminder
    if(!mDict[reminder.calendar.title]){
        console.warn(`找不到日历${reminder.calendar.title}`)
    }
    if(targetEvent){
        //console.log(`找到已经创建的事项 ${reminder.title}`)
        updateEvent(targetEvent,reminder)
    }else{
        console.warn(`创建事项${reminder.title}到${reminder.calendar.title}`)
        const newEvent = new CalendarEvent()
        newEvent.notes = `${targetNode}\n${reminder.notes}`//要加入备注
        updateEvent(newEvent,reminder)
    }
}

Script.complete()

function updateEvent(event,reminder){
    event.title = `${reminder.title}`
    calName = reminder.calendar.title
    cal = mDict[calName]
    event.calendar = cal
    // 已完成事项
    if(reminder.isCompleted){
        event.title = `✅${reminder.title}`
        event.isAllDay = true
        event.startDate = reminder.completionDate
        event.endDate = reminder.completionDate
        let period = (reminder.dueDate - reminder.completionDate)/1000/3600/24
        period = period.toFixed(1)
        if(period<1){
            period = -period
            event.location = `延期${period}天完成`
        }else if(period == 0){
            event.location = "准时完成"
        }else{
            event.location = `提前${period}天完成`
        }
    //未完成事项
    }else{
        const nowTime = new Date()
        let period = (reminder.dueDate-nowTime)/1000/3600/24
        period = period.toFixed(1)
        if(period<0){
            // 待办延期
            event.location = `延期${-period}天`
            //如果不是在同一天,设置为全天事项
            if(reminder.dueDate.getDate()!=nowTime.getDate()){
                event.title = `❌${reminder.title}`
                event.startDate = nowTime
                event.endDate = nowTime
                event.isAllDay = true
            //在同一天的保持原来的时间
            }else{
                event.title = `⭕️${reminder.title}`
                event.isAllDay = false
                event.startDate = reminder.dueDate
                event.endDate = reminder.dueDate
            }
            console.log(`【${reminder.title}】待办顺延${-period}天`)
        }else{
            event.title = `⭕️${reminder.title}`
            event.isAllDay = false
            event.location = `还剩${period}天`
            event.startDate = reminder.dueDate
            event.endDate = reminder.dueDate
        }
    }
    if(!reminder.dueDateIncludesTime) event.isAllDay = true
    event.save()
}