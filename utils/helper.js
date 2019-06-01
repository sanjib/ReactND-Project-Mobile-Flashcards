import { AsyncStorage } from "react-native";
import { Notifications, Permissions } from "expo";

const NOTIFICATION_STUDY_REMINDER_KEY = "Flashcards:NotificationsStudyReminder";

export function createRgbaFromAnyText(text = "") {
  // creates sequence of rgba values from strings

  function normalizeColorRange(charCodeAt) {
    // 1. reset a to 0 (minus 97), as charCodeAt(97) = a
    // 2. charCodeRange is now from 0 - 25 (26 alphabets)
    // 3. color range is from 0 - 255, so multiply by 10 (consistent results)
    const charCodeRange = charCodeAt - 97;
    return charCodeRange * 10;
  }

  let at = 0;
  const colors = text
    .split("")
    .map(char => normalizeColorRange(char.toLowerCase().charCodeAt(0)))
    .reduce(
      (rgb, code) => {
        at = at > 2 ? 0 : at;
        rgb[at] = rgb[at] + code > 255 ? rgb[at] + code - 255 : rgb[at] + code;
        at++;
        return rgb;
      },
      [0, 0, 0]
    );

  const alpha = 0.5;
  return [...colors, alpha];
}

export function createDeckObject(deckTitle) {
  return {
    [deckTitle]: {
      title: deckTitle,
      questions: []
    }
  };
}

export function createCardObject(question, answer) {
  return { question, answer };
}

export function getDummyData() {
  return {
    React: {
      title: "React",
      questions: [
        {
          question: "What is React?",
          answer: "A library for managing user interfaces"
        },
        {
          question: "Where do you make Ajax requests in React?",
          answer: "The componentDidMount lifecycle event"
        },
        {
          question: "What is JSX?",
          answer:
            "Stands for JavaScript XML. It allows combining JavaScript with HTML. Results in easier implementation and clean code."
        }
      ]
    },
    JavaScript: {
      title: "JavaScript",
      questions: [
        {
          question: "What is a closure?",
          answer:
            "The combination of a function and the lexical environment within which that function was declared."
        }
      ]
    },
    "HTML and CSS": {
      title: "HTML and CSS",
      questions: [
        {
          question: "What does HTML stand for?",
          answer: "Hyper Text Markup Language"
        },
        {
          question: "Who is making the Web standards?",
          answer: "The World Wide Web Consortium"
        },
        {
          question: "What's the tag to create a numbered list?",
          answer: "<ol>"
        },
        {
          question: "What does CSS stand for?",
          answer: "Cascading Style Sheets"
        }
      ]
    }
  };
}

function createNotification() {
  return {
    title: "Study with Flashcards",
    body: "📖 Don't forget to study today!",
    ios: {
      sound: true
    },
    android: {
      sound: true,
      priority: "high",
      sticky: false,
      vibrate: true
    }
  };
}

export async function clearLocalNotification() {
  await AsyncStorage.removeItem(NOTIFICATION_STUDY_REMINDER_KEY);
  Notifications.cancelAllScheduledNotificationsAsync();
}

export async function setLocalNotification() {
  const dataRaw = await AsyncStorage.getItem(NOTIFICATION_STUDY_REMINDER_KEY);
  const data = JSON.parse(dataRaw);

  if (data === null) {
    const permissionsNotifications = await Permissions.askAsync(
      Permissions.NOTIFICATIONS
    );
    if (permissionsNotifications.status === "granted") {
      Notifications.cancelAllScheduledNotificationsAsync();

      // schedule notification everyday at 3:00 pm
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(15);
      tomorrow.setMinutes(0);

      // used for testing - schedule a notification 5 seconds from now
      // let now = new Date();
      // now.setDate(now.getDate());
      // now.setSeconds(now.getSeconds() + 5);

      Notifications.scheduleLocalNotificationAsync(createNotification(), {
        time: tomorrow,
        // time: now,
        repeat: "day"
      });

      // Notifications.presentLocalNotificationAsync(createNotification());

      AsyncStorage.setItem(
        NOTIFICATION_STUDY_REMINDER_KEY,
        JSON.stringify(true)
      );
    }
  }
}
