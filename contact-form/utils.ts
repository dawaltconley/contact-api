import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventQueryStringParameters,
} from 'aws-lambda';
import busboy from 'busboy';
import { HttpError } from './proxy';

export const parseFormBody = (
  body: string,
  headers: APIGatewayProxyEventHeaders,
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

export const parseQueryString = (
  qs: APIGatewayProxyEventQueryStringParameters,
): Record<string, string> =>
  Object.entries(qs).reduce(
    (data: Record<string, string>, [k, v]) => ({
      ...data,
      [k]: v ?? '',
    }),
    {},
  );

export const getFormData = async (
  event: APIGatewayProxyEvent,
): Promise<Record<string, string>> => {
  if (event.httpMethod === 'GET') {
    if (!event.queryStringParameters) {
      throw new HttpError(400, 'Missing query string parameters');
    }
    return parseQueryString(event.queryStringParameters);
  }

  if (event.httpMethod === 'POST') {
    if (!event.body) {
      if (!event.queryStringParameters)
        throw new HttpError(400, 'Missing form data');
      return parseQueryString(event.queryStringParameters);
    }
    return parseFormBody(event.body, event.headers).catch((e) => {
      throw new HttpError(400, e.message);
    });
  }

  throw new HttpError(400, 'Bad request');
};
