import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { HttpError } from './proxy';

const client = new SNSClient({});

const hasAllProps = (obj: object, properties: string[]): boolean =>
  properties.every((p) => p in obj);

export interface ContactInfo {
  subject: string;
  message: string;
  [field: string]: string;
}

export const isContactInfo = (
  obj: Record<string, string>,
): obj is ContactInfo => hasAllProps(obj, ['subject', 'message']);

export const isSpam = (
  info: ContactInfo,
  honeypots = process.env.HONEYPOT_FIELDS?.split(','),
): boolean =>
  !!honeypots && honeypots.some((field) => field in info && info[field]);

export const validateFormData = (
  obj: Record<string, string | undefined>,
  required = process.env.REQUIRED_FIELDS?.split(',') ?? [],
): ContactInfo => {
  // filter out any undefined or empty values
  const data = Object.entries(obj).reduce<Record<string, string>>(
    (data, [k, v]) => (v ? { ...data, [k]: v } : data),
    {},
  );
  if (!isContactInfo(data) || !hasAllProps(data, required))
    throw new HttpError(400, {
      message: 'Missing required fields in form data',
      required: ['subject', 'message', ...required],
      received: data,
    });
  return data;
};

export const sendContact = async (
  { subject, message, ...fields }: ContactInfo,
  { separator = '\n\n', topicArn = process.env.SNS_TOPIC_ARN } = {},
) => {
  if (!topicArn) throw new Error('No topic provided.');

  const metadata = Object.entries(fields)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .reduce<string[]>((msg, [k, v]) => (v ? [...msg, `${k}: ${v}`] : msg), [])
    .join('\n');

  const fullMessage = metadata ? metadata + separator + message : message;

  const command = new PublishCommand({
    TopicArn: topicArn,
    Subject: subject,
    Message: fullMessage,
  });

  return client.send(command);
};
