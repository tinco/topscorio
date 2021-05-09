import mail from "@sendgrid/mail"
import dotenv from "dotenv"
dotenv.config()

mail.setApiKey(process.env.SENDGRID_API_KEY)

export default mail