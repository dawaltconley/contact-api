import type { APIGatewayProxyEvent } from 'aws-lambda';
import merge from 'lodash/merge';

const event: APIGatewayProxyEvent = {
  body: null,
  resource: '/{proxy+}',
  path: '/contact',
  httpMethod: 'GET',
  isBase64Encoded: false,
  multiValueHeaders: {},
  multiValueQueryStringParameters: {},
  queryStringParameters: null,
  pathParameters: {
    proxy: '/contact',
  },
  stageVariables: null,
  headers: {
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'en-US,en;q=0.8',
    'Cache-Control': 'max-age=0',
    'CloudFront-Forwarded-Proto': 'https',
    'CloudFront-Is-Desktop-Viewer': 'true',
    'CloudFront-Is-Mobile-Viewer': 'false',
    'CloudFront-Is-SmartTV-Viewer': 'false',
    'CloudFront-Is-Tablet-Viewer': 'false',
    'CloudFront-Viewer-Country': 'US',
    Host: '1234567890.execute-api.us-east-1.amazonaws.com',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Custom User Agent String',
    Via: '1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)',
    'X-Amz-Cf-Id': 'cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==',
    'X-Forwarded-For': '127.0.0.1, 127.0.0.2',
    'X-Forwarded-Port': '443',
    'X-Forwarded-Proto': 'https',
  },
  requestContext: {
    accountId: '123456789012',
    apiId: '1234',
    authorizer: {},
    httpMethod: 'get',
    identity: {
      accessKey: '',
      accountId: '',
      apiKey: '',
      apiKeyId: '',
      caller: '',
      clientCert: {
        clientCertPem: '',
        issuerDN: '',
        serialNumber: '',
        subjectDN: '',
        validity: { notAfter: '', notBefore: '' },
      },
      cognitoAuthenticationProvider: '',
      cognitoAuthenticationType: '',
      cognitoIdentityId: '',
      cognitoIdentityPoolId: '',
      principalOrgId: '',
      sourceIp: '',
      user: '',
      userAgent: '',
      userArn: '',
    },
    path: '/contact',
    protocol: 'HTTP/1.1',
    requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
    requestTimeEpoch: 1428582896000,
    resourceId: '123456',
    resourcePath: '/contact',
    stage: 'dev',
  },
};

export const formData = {
  name: 'Jane Doe',
  email: 'jane@example.net',
  subject: 'Email Subject',
  message: 'I would like to inquire about your services.',
};

export const multipart = merge({}, event, {
  body: '-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="name"\r\n\r\nJane Doe\r\n-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="email"\r\n\r\njane@example.net\r\n-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="subject"\r\n\r\nEmail Subject\r\n-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="message"\r\n\r\nI would like to inquire about your services.\r\n-----------------------------147122027520121970202652868316--\r\n',
  httpMethod: 'POST',
  headers: {
    'Content-Type':
      'multipart/form-data; boundary=---------------------------147122027520121970202652868316',
  },
});

export const urlencoded = merge({}, event, {
  body: 'name=Jane+Doe&email=jane%40example.net&subject=Email+Subject&message=I+would+like+to+inquire+about+your+services.',
  httpMethod: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export const queryString = merge({}, event, {
  httpMethod: 'GET',
  queryStringParameters: { ...formData },
});

export default event;
