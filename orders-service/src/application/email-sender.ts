import nodemailer, { SentMessageInfo } from 'nodemailer'

const transporter = nodemailer.createTransport({
	service: "Gmail",
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: "distributedcafe@gmail.com",
		pass: "naly yrdb rrix cmse",
	},
});

/**
 * This functionality is used to send an email to the customer to notify that the order is ready
 * @param customerEmail the email to use as the recipient
 */
export async function sendNotifyEmail(customerEmail: string): Promise<SentMessageInfo> {

	const mailOptions = {
		from: "distributedcafe@gmail.com",
		to: customerEmail,
		subject: "Distributed Cafe Order Ready",
		text: "Dear customer, your order is ready",
	};

	await transporter.sendMail(mailOptions)

}
