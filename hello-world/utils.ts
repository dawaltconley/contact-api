import type { APIGatewayProxyEvent } from 'aws-lambda';
import busboy from 'busboy';

export const parseFormData = (
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
