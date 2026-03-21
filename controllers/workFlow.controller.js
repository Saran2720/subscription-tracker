import Subscription from "../models/subscription.model.js";
import dayjs from "dayjs";
import { sendReminderEmail } from "../utils/send-email.js";

const sendReminder = async (context) => {
  console.log("Workflow triggered with payload:", context.requestPayload);

  const { subscriptionId } = context.requestPayload;
  // console.log("Fetching subscription...");
  const subscription = await fetchSubscription(context, subscriptionId);
  // console.log("Subscription fetched:", subscription);

  if (!subscription || subscription.status !== "active") {
    console.log("Subscription not active or not found — stopping");
    return;
  }

  const renewalDate = dayjs(subscription.renewalDate);
  // console.log("Renewal date:", subscription.renewalDate);

  //if already expired

  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`,
    );
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
    const reminderDate = renewalDate.subtract(daysBefore, "day");

    // if reminder date already passed, skip it entirely
    if (reminderDate.isBefore(dayjs())) {
      // console.log(`Skipping ${daysBefore}-day reminder — date already passed`);
      continue; 
    }

    //if the remiderday is comming here afters means put to sleep
    // meaning -> add to queue

    //sleep schedular

    // sleep until the reminder date
    await sleepUntilReminder(
      context,
      `Reminder-${daysBefore} days before`,
      reminderDate,
    );

    // send the email
    await triggerReminder(
      context,
      `${daysBefore} days before reminder`,
      subscription,
    );
  }
};

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return await Subscription.findById(subscriptionId).populate(
      "user",
      "name email",
    );
  });
};

//putting into sleep
const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleep until ${label} reminder at ${date}`);
  await context.sleepUntil(label, date.toDate());
};


const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`triggering ${label}`);

    //sending email
    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });
  });
};

export default sendReminder;
