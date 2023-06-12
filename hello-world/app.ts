import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import busboy from 'busboy';

const parseFormData = (
  body: string,
  headers: APIGatewayProxyEvent['headers'],
): Promise<Record<string, string>> =>
  new Promise((resolve, reject) => {
    const parsed: Record<string, string> = {};
    const bb = busboy({
      headers: Object.entries(headers).reduce<
        Record<string, string | undefined>
      >(
        (headers, [k, v]) => ({
          ...headers,
          [k.toLowerCase()]: v,
        }),
        {},
      ),
    });
    bb.on('field', (name, value) => {
      parsed[name] = value;
    });
    bb.on('close', () => resolve(parsed));
    bb.on('error', reject);
    bb.end(body);
  });

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) throw new Error('Event missing a body.');
    const data = await parseFormData(event.body, event.headers);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers':
          'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'some error happened',
      }),
    };
  }
};
