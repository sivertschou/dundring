import { Status } from '@dundring/types';
import nodemailer from 'nodemailer';
import { generateMailToken } from '../validationService';
import { registerMailTemplate, signInMailTemplate } from './htmlTemplates';
import { isSuccess, successMap } from '@dundring/utils';
import { userService } from '..';
require('dotenv').config();

export const checkMailConfig = () => {
  const config = mailConfigFromEnv();
  if (!config.host) {
    console.log(
      '[.env]: No mail host provided. Override this by setting the MAIL_HOST in the environment config.'
    );
  }
  if (!config.port) {
    console.log(
      '[.env]: No mail port provided. Override this by setting the MAIL_PORT in the environment config.'
    );
  }
  if (!config.user) {
    console.log(
      '[.env]: No mail user provided. Override this by setting the MAIL_USER in the environment config.'
    );
  }
  if (!config.password) {
    console.log(
      '[.env]: No mail password provided. Override this by setting the MAIL_PASSWORD in the environment config.'
    );
  }
};

const mailConfigFromEnv = () => ({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || ''),
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
});

const validMailConfigOrNull = () => {
  const { host, port, user, password } = mailConfigFromEnv();
  if (host && port && user && password) {
    return { host, port, auth: { user, pass: password } };
  }

  return null;
};

const config = validMailConfigOrNull();
const transporter = config && nodemailer.createTransport(config);

const sendMail = async ({
  to,
  subject,
  htmlContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
}): Promise<Status<'', 'Something went wrong while sending the e-mail'>> => {
  if (!transporter) {
    console.log(
      `[mail]: To: ${to}\n[mail]: Subject: ${subject}\n[mail]: content: ${htmlContent}`
    );
    return { status: 'SUCCESS', data: '' };
  }

  try {
    const info = await transporter.sendMail({
      from: '"dundring.com" <no-reply@dundring.com>',
      to,
      subject,
      html: htmlContent,
    });

    if (info.rejected.length) {
      return {
        status: 'ERROR',
        type: 'Something went wrong while sending the e-mail',
      };
    }
    return { status: 'SUCCESS', data: '' };
  } catch (error) {
    return {
      status: 'ERROR',
      type: 'Something went wrong while sending the e-mail',
    };
  }
};

export const sendLoginOrRegisterMail = async (
  mail: string
): Promise<
  Status<
    'Login link sent' | 'Register link sent',
    'Something went wrong while sending the e-mail'
  >
> => {
  const token = generateMailToken(mail);
  const frontendBaseUrl =
    process.env.FRONTEND_BASE_URL || 'https://dundring.com';

  const loginLink = `${frontendBaseUrl}/auth?ticket=${token}`;
  if (isSuccess(await userService.getUserByMail(mail))) {
    if (!transporter) {
      console.log(`[mail]: To: ${mail}\n[mail]: Login link: ${loginLink}`);
      return { status: 'SUCCESS', data: 'Login link sent' };
    }

    return successMap(
      await sendMail({
        to: mail,
        subject: 'Sign in link',
        htmlContent: signInMailTemplate(loginLink),
      }),
      (_) => 'Login link sent'
    );
  } else {
    if (!transporter) {
      console.log(`[mail]: To: ${mail}\n[mail]: Register link: ${loginLink}`);
      return { status: 'SUCCESS', data: 'Register link sent' };
    }

    return successMap(
      await sendMail({
        to: mail,
        subject: 'Create a user for dundring.com',
        htmlContent: registerMailTemplate(loginLink),
      }),
      (_) => 'Register link sent'
    );
  }
};
