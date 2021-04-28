import mail from "@sendgrid/mail"
mail.setApiKey(process.env.SENDGRID_API_KEY)

export default mail