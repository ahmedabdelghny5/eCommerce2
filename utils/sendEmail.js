import nodemailer from 'nodemailer'

export const emailFunction = async (email, subject, html) => {

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_SENDER,
            pass: process.env.EMAIL_Password,
        },
    });
    let info = await transporter.sendMail({
        from: process.env.EMAIL_SENDER, // sender address
        to: email,
        subject,
        html,
    });
    console.log('Confirmation email sent successfully')
    return info;
}