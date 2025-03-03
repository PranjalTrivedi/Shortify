const axios = require("axios");

const FCM_SERVER_KEY = "YOUR_SERVER_KEY";  // Replace with your Firebase server key
const DEVICE_TOKEN = "YOUR_DEVICE_TOKEN";  // Replace with your test device token

const sendNotification = async () => {
    try {
        const response = await axios.post(
            "https://fcm.googleapis.com/fcm/send",
            {
                to: DEVICE_TOKEN,
                notification: {
                    title: "Test Notification",
                    body: "This is a test notification from Shortify!",
                    click_action: "https://yourwebsite.com",
                },
                data: {
                    extra_info: "Some additional data",
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `key=${FCM_SERVER_KEY}`,
                },
            }
        );

        console.log("Notification sent successfully:", response.data);
    } catch (error) {
        console.error("Error sending notification:", error.response ? error.response.data : error.message);
    }
};

sendNotification();
