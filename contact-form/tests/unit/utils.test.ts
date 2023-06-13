import merge from 'lodash/merge';
import { parseFormBody, parseQueryString, getFormData } from '../../utils';
import {
  formData,
  multipart as multipartEvent,
  urlencoded as urlencodedEvent,
  queryString as queryStringEvent,
} from '../test-events';

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
    const expected = merge({}, formData, {
      honeypot: '',
    });
    expect(await getFormData(event)).toEqual(expected);
  });

  it('Correctly parses POST requests', async () => {
    expect(await getFormData(multipartEvent)).toEqual(formData);
    expect(await getFormData(urlencodedEvent)).toEqual(formData);
  });
});
