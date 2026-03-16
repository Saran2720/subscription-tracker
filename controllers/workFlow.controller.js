import { serve } from "@upstash/workflow";
import Subscription from "../models/subscription.model";
import dayjs from "dayjs";

export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;

    const subscription = await fetchSubscription(context, subscriptionId);

    if (!subscription || subscription.status !== active) {
        return;
    }

    const renewalDate = dayjs(subscription.renewalDate);

    //if already expired
    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`)
        return;
    }

    //hold the subscription renewal message upto the date
    // eg : if today is 16/3/2026 , but the renewal day is 30/3/2026
    // 14 days to remaining
    // so 7th beore day updating be like -> 30-7 = 23
    // so hold the message in the queue upto 23
    //when the 23rd date is come send the email msg to the user
    const DAYS = [7, 4, 1];

    for (const daysBefore of DAYS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');

        //if the remiderday is comming here afters means put to sleep
        // meaning -> add to queue

        //sleep schedular
        if(reminderDate.isAfter(dayjs())){
            await sleepUntilReminder(context, `Reminder-${daysBefore} days before`, reminderDate);
        }
        //after the sleep is over that means The date 23 has come just trigger to send msg
        await triggerReminder(context, `Reminder ${daysBefore} days before`);

    }
})


const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async() => {
        return await Subscription.findById(subscriptionId).populate('user', 'name email');
    })
}

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleep until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async(context, label)=>{
    return await context.run(label,()=>{
        console.log(`triggering ${label} reminder`);

        //sending email logic
    })
}