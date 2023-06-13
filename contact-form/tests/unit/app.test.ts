import { APIGatewayProxyResult } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import merge from 'lodash/merge';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import {
  multipart as multipartEvent,
  urlencoded as urlencodedEvent,
  queryString as queryStringEvent,
} from '../test-events';
import { lambdaHandler } from '../../app';

process.env.SNS_TOPIC_ARN = 'mock';
process.env.HONEYPOT_FIELDS = 'honeypot,foobar';

const snsMock = mockClient(SNSClient);
const consoleError = jest.spyOn(global.console, 'error').mockImplementation();

beforeEach(() => {
  snsMock.reset();
  consoleError.mockClear();
});

describe('Successful form submission', function () {
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

  it('Parses form submissions using application/x-www-form-urlencoded POST requests', async () => {
    const result: APIGatewayProxyResult = await lambdaHandler(urlencodedEvent);
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

  it('Succeeds with empty honeypot fields', async () => {
    const event = merge({}, queryStringEvent, {
      queryStringParameters: {
        honeypot: undefined,
        foobar: '',
      },
    });
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

describe('Fail conditions', () => {
  it('Errors on missing query string', async () => {
    const event = merge({}, queryStringEvent, {
      queryStringParameters: null,
    });
    const result: APIGatewayProxyResult = await lambdaHandler(event);

    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      JSON.stringify({
        message: 'Missing query string parameters',
      }),
    );
    expect(snsMock).not.toHaveReceivedCommand(PublishCommand);
    expect(consoleError).toHaveBeenCalled();
  });

  it('Errors on missing body', async () => {
    const event = merge({}, multipartEvent, {
      body: null,
      queryStringParameters: null,
    });
    const result: APIGatewayProxyResult = await lambdaHandler(event);

    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      JSON.stringify({
        message: 'Missing form data',
      }),
    );
    expect(snsMock).not.toHaveReceivedCommand(PublishCommand);
    expect(consoleError).toHaveBeenCalled();
  });

  it('Errors on missing fields', async () => {
    const event = merge({}, urlencodedEvent, {
      body: new URLSearchParams({
        name: 'Jane Doe',
        subject: 'Missing email',
      }).toString(),
    });
    const result: APIGatewayProxyResult = await lambdaHandler(event);

    expect(result.statusCode).toEqual(400);
    expect(JSON.parse(result.body).message).toEqual(
      'Missing required fields in form data',
    );
    expect(snsMock).not.toHaveReceivedCommand(PublishCommand);
    expect(consoleError).toHaveBeenCalled();
  });

  it('Silently fails on spam.', async () => {
    const event = merge({}, urlencodedEvent);
    const qs = new URLSearchParams(event.body);
    qs.append('honeypot', 'spam');
    event.body = qs.toString();

    const result: APIGatewayProxyResult = await lambdaHandler(event);

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      JSON.stringify({
        message: 'Message received',
      }),
    );
    expect(snsMock).not.toHaveReceivedCommand(PublishCommand);
    expect(consoleError).toHaveBeenCalled();
  });
});
