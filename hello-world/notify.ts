import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const { SNS_TOPIC_ARN } = process.env;

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

export const sendContact = async (
  { subject, message, ...fields }: ContactInfo,
  separator = '\n\n',
) => {
  const metadata = Object.entries(fields)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .reduce<string[]>((msg, [k, v]) => [...msg, `${k}: ${v}`], []);

  const fullMessage = metadata.join('\n') + separator + message;

  const command = new PublishCommand({
    TopicArn: SNS_TOPIC_ARN,
    Subject: subject,
    Message: fullMessage,
  });

  return client.send(command);
};
