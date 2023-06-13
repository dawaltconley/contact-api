import { APIGatewayProxyResult } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import baseEvent from '../test-events';
import { lambdaHandler } from '../../app';

process.env.SNS_TOPIC_ARN = 'mock';

const snsMock = mockClient(SNSClient);

describe('Form submission', function () {
  it('Parses form submissions using application/x-www-form-urlencoded GET requests', async () => {
    const event = structuredClone(baseEvent);
    event.queryStringParameters = {
      name: 'Jane Doe',
      email: 'jane@example.net',
      subject: 'Email Subject',
      message: 'I would like to inquire about your services.',
    };

    const result: APIGatewayProxyResult = await lambdaHandler(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      JSON.stringify({
        message: 'Message received',
      }),
    );
    expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
      Subject: 'Email Subject',
      Message:
        'email: jane@example.net\nname: Jane Doe\n\nI would like to inquire about your services.',
    });
  });
  it('Parses form submissions using multipart/form-data POST requests', async () => {
    const event = structuredClone(baseEvent);
    event.body =
      '-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="name"\r\n\r\nJane Doe\r\n-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="email"\r\n\r\njane@example.net\r\n-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="subject"\r\n\r\nEmail Subject\r\n-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="message"\r\n\r\nI would like to inquire about your services.\r\n-----------------------------147122027520121970202652868316--\r\n';
    event.httpMethod = 'POST';
    event.headers['Content-Type'] =
      'multipart/form-data; boundary=---------------------------147122027520121970202652868316';
    event.headers['Content-Length'] = '591';

    const result: APIGatewayProxyResult = await lambdaHandler(event);

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      JSON.stringify({
        message: 'Message received',
      }),
    );
    expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
      Subject: 'Email Subject',
      Message:
        'email: jane@example.net\nname: Jane Doe\n\nI would like to inquire about your services.',
    });
  });
});
