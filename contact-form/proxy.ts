import type { APIGatewayProxyResult } from 'aws-lambda';

type ProxyHeaders = APIGatewayProxyResult['headers'];

const getHeaders = (
  headers: ProxyHeaders,
  corsOrigin = process.env.ALLOW_ORIGIN,
): ProxyHeaders =>
  corsOrigin
    ? {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        ...headers,
      }
    : headers;

const getBody = (message: string | ResponseBody): ResponseBody =>
  typeof message === 'string'
    ? {
        message,
      }
    : message;

export const getResponse = (
  statusCode: number,
  message: string | ResponseBody,
  headers?: ProxyHeaders,
  allowOrigin = process.env.ALLOW_ORIGIN,
): APIGatewayProxyResult => ({
  statusCode,
  headers: getHeaders(headers, allowOrigin),
  body: JSON.stringify(getBody(message)),
});

type JSONCompatible = string | number | boolean | null;

interface ResponseBody {
  message: string;
  [key: string]:
    | JSONCompatible
    | JSONCompatible[]
    | Record<string, JSONCompatible>;
}

export class HttpError extends Error {
  status: number;
  body: ResponseBody;
  constructor(statusCode: number, message: string | ResponseBody) {
    const body = getBody(message);
    super(body.message);
    this.status = statusCode;
    this.body = body;
  }
  get response(): APIGatewayProxyResult {
    return getResponse(this.status, this.body);
  }
}
