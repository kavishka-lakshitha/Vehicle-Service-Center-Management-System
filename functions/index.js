// Import necessary modules from Firebase Functions and Firestore
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const emailjs = require("emailjs-com");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Scheduled function to send next service emails
exports.sendNextServiceEmail = onSchedule("every 24 hours", async (event) => {
    try {
        const today = new Date();
        const serviceHistoryRef = db.collection('service_history');
        const snapshot = await serviceHistoryRef
            .where('next_service_date', '<=', today) // Check if the next service date is due
            .where('Nextservice_email_sent', '==', false) // Ensure the email hasn't been sent yet
            .get();

        if (!snapshot.empty) {
            snapshot.forEach(async (doc) => {
                const reservation = doc.data();
                const emailParams = {
                    to_email: reservation.email,
                    from_name: 'Ananda Auto Motor Techniques',
                    from_email: 'anandaautomoters@gmail.com',
                    subject: 'It’s Time for Your Next Service – Check Our Offers!',
                    content: `
                    <p>Dear Customer,</p>
                    <p>It's been 3 months since your last service for the vehicle <strong>${reservation.vehicle_number}</strong>.</p>
                    <p>It's time to schedule your next service.</p>
                    <p>Check our app for exclusive offers and deals!</p>
                    <p>If you have any questions, feel free to contact us at:</p>
                    <p><strong>Phone:</strong> 123-456-7890<br>
                    <strong>Email:</strong> anandaautomoters@gmail.com</p>
                    <p>Thank you!</p>
                    <p>Best Regards,<br>Ananda Auto Motor Techniques</p>
                    `,
                };

                // Send email using EmailJS
                await emailjs.send('service_p5y9bzo', 'template_bmyxksr', emailParams, 'G8dZDy5Vw9uH8bmhj');

                // Mark Nextservice_email_sent as true in Firestore
                await doc.ref.update({
                    Nextservice_email_sent: true,
                    next_service_email_sent_date: admin.firestore.FieldValue.serverTimestamp(), // Store the actual send date
                });
            });
        }
        logger.info('Next service emails sent successfully!');
    } catch (error) {
        logger.error('Error sending next service emails:', error);
    }
});




