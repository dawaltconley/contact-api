import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const client = new SNSClient({});

export interface ContactInfo {
  email: string;
  subject: string;
  message: string;
  [field: string]: string;
}

export const isContactInfo = (
  obj: Record<string, string>,
): obj is ContactInfo => 'subject' in obj && 'message' in obj && 'email' in obj;

export const isSpam = (
  info: ContactInfo,
  honeypots = process.env.HONEYPOT_FIELDS?.split(','),
): boolean =>
  !!honeypots && honeypots.some((field) => field in info && info[field]);

export const sendContact = async (
  { subject, message, ...fields }: ContactInfo,
  { separator = '\n\n', topicArn = process.env.SNS_TOPIC_ARN } = {},
) => {
  if (!topicArn) throw new Error('No topic provided.');

  const metadata = Object.entries(fields)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .reduce<string[]>((msg, [k, v]) => [...msg, `${k}: ${v}`], []);

  const fullMessage = metadata.join('\n') + separator + message;

  const command = new PublishCommand({
    TopicArn: topicArn,
    Subject: subject,
    Message: fullMessage,
  });

  return client.send(command);
};
