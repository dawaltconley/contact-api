import { APIGatewayProxyResult } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import {
  multipart as multipartEvent,
  urlencoded as urlencodedEvent,
  queryString as queryStringEvent,
} from '../test-events';
import { lambdaHandler } from '../../app';

process.env.SNS_TOPIC_ARN = 'mock';

const snsMock = mockClient(SNSClient);

describe('Form submission', function () {
  it('Parses form submissions using application/x-www-form-urlencoded GET requests', async () => {
    const result: APIGatewayProxyResult = await lambdaHandler(queryStringEvent);
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
    const result: APIGatewayProxyResult = await lambdaHandler(multipartEvent);

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
