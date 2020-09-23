const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const to = process.env.SENDGRID_TO_ADDRESS
const from = process.env.SENDGRID_FROM_ADDRESS

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        //to: email,
        to,
        from,
        subject: 'Welcome to the task manager app!',
        text: `Hello there ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        //to: email,
        to,
        from,
        subject: 'You have deleted your account!',
        text: `We are sorry to see you go ${name}. Is there anything we could have do to make you stay?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}