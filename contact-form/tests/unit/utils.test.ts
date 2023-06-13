import merge from 'lodash/merge';
import { parseFormBody, parseQueryString, getFormData } from '../../utils';
import baseEvent from '../test-events';

const result = {
  name: 'Jane Doe',
  email: 'jane@example.net',
  subject: 'Email Subject',
  message: 'I would like to inquire about your services.',
};

const multipartEvent = merge({}, baseEvent, {
  body: '-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="name"\r\n\r\nJane Doe\r\n-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="email"\r\n\r\njane@example.net\r\n-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="subject"\r\n\r\nEmail Subject\r\n-----------------------------147122027520121970202652868316\r\nContent-Disposition: form-data; name="message"\r\n\r\nI would like to inquire about your services.\r\n-----------------------------147122027520121970202652868316--\r\n',
  httpMethod: 'POST',
  headers: {
    'Content-Type':
      'multipart/form-data; boundary=---------------------------147122027520121970202652868316',
  },
});

const urlencodedEvent = merge({}, baseEvent, {
  body: 'name=Jane+Doe&email=jane%40example.net&subject=Email+Subject&message=I+would+like+to+inquire+about+your+services.',
  httpMethod: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

const queryStringEvent = merge({}, baseEvent, {
  httpMethod: 'GET',
  queryStringParameters: { ...result },
});

describe('Utilities for extracting form data', () => {
  it('Parses multipart/form-data', async () => {
    const { body, headers } = multipartEvent;
    const result = await parseFormBody(body, headers);
    expect(result).toEqual(result);
  });

  it('Parses application/x-www-form-urlencoded', async () => {
    const { body, headers } = urlencodedEvent;
    const result = await parseFormBody(body, headers);
    expect(result).toEqual(result);
  });

  it('Normalizes undefined query string params', () => {
    expect(
      parseQueryString({
        foo: 'bar',
        baz: undefined,
      }),
    ).toEqual({
      foo: 'bar',
      baz: '',
    });
  });

  it('Correctly parses GET requests', async () => {
    const event = merge({}, queryStringEvent, {
      queryStringParameters: { honeypot: undefined },
    });
    const expected = merge({}, result, {
      honeypot: '',
    });
    expect(await getFormData(event)).toEqual(expected);
  });

  it('Correctly parses POST requests', async () => {
    expect(await getFormData(multipartEvent)).toEqual(result);
    expect(await getFormData(urlencodedEvent)).toEqual(result);
  });
});
