import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getFormData } from './utils';
import { sendContact, validateFormData, isSpam } from './notify';
import { getResponse, HttpError } from './proxy';

const success = getResponse(200, 'Message received');

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
    console.log(event);
    const data = await getFormData(event).then(validateFormData);
    if (isSpam(data)) {
      console.error('Detected spam', data);
      return success; // abort silently
    }
    await sendContact(data);
    return success;
  } catch (err) {
    console.error(err);
    return err instanceof HttpError
      ? err.response
      : getResponse(500, 'Server Error');
  }
};
