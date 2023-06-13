import type { APIGatewayProxyResult } from 'aws-lambda';

type ProxyHeaders = APIGatewayProxyResult['headers'];

const { ALLOW_ORIGIN } = process.env;
const cors: ProxyHeaders = ALLOW_ORIGIN
  ? {
      'Access-Control-Allow-Origin': ALLOW_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    }
  : {};

export const getResponse = (
  statusCode: number,
  message: string | ResponseBody,
  headers?: ProxyHeaders,
): APIGatewayProxyResult => ({
  statusCode,
  headers: { ...cors, ...headers },
  body: JSON.stringify(
    typeof message === 'string'
      ? {
          message,
        }
      : message,
  ),
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
    const body = typeof message === 'string' ? { message } : message;
    super(body.message);
    this.status = statusCode;
    this.body = body;
  }
  get response(): APIGatewayProxyResult {
    return getResponse(this.status, this.body);
  }
}
