import sgMail from '@sendgrid/mail';
import getEnv from '../envs';
import {PoapEvent} from "../types";

export async function sendNewEventEmailToAdmins(event: PoapEvent): Promise<boolean> {
    const env = getEnv();

    const sendgridApiKey = env.sendgridApiKey;
    const sendgridNewEventTemplate = env.sendgridNewEventTemplate;
    const sendgridSenderEmail = env.sendgridSenderEmail;
    const adminEmails = env.adminEmails;

    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    sgMail.setApiKey(sendgridApiKey);

    const email = {
        to: adminEmails,
        from: sendgridSenderEmail,
        subject: 'New POAP event created',
        templateId: sendgridNewEventTemplate,
        dynamic_template_data: {
            name: event.name,
            description: event.description,
            start_date: event.start_date,
            website: event.event_url,
            img_url: event.image_url,
            fancy_id: event.fancy_id,
        }
    };

    sgMail.sendMultiple(email).then(m => {
        return true
    }).catch(error => {
        // Log friendly error
        // console.error(error.toString());
        return false
    });
    return false
}


export async function sendRedeemTokensEmail(recipient: string, token: string): Promise<boolean> {
  const env = getEnv();

  const sendgridApiKey = env.sendgridApiKey;
  const sendgridRedeemTokensTemplate = env.sendgridRedeemTokensTemplate;
  const sendgridSenderEmail = env.sendgridSenderEmail;

  // using Twilio SendGrid's v3 Node.js Library
  // https://github.com/sendgrid/sendgrid-nodejs
  sgMail.setApiKey(sendgridApiKey);

  const email = {
    to: recipient,
    from: sendgridSenderEmail,
    subject: 'Claim your POAPs!',
    templateId: sendgridRedeemTokensTemplate,
    dynamic_template_data: {
      token: token
    }
  };

  try {
    await sgMail.send(email);
    return true
  } catch (e){
    console.log(e.toString());
  }
  return false
}
