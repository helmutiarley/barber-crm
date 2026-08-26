import { describe, expect, it } from 'vitest';
import { ApiError, messageForApiError, parseErrorBody } from '../src/lib/errors';

describe('parseErrorBody', () => {
  it('extracts the envelope error', () => {
    const error = parseErrorBody(
      { error: { code: 'CONFLICT', message: 'Slug em uso' } },
      409,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('CONFLICT');
    expect(error.message).toBe('Slug em uso');
    expect(error.status).toBe(409);
  });

  it('falls back to INTERNAL on garbage', () => {
    const error = parseErrorBody('not-json-shaped', 500);

    expect(error.code).toBe('INTERNAL');
  });
});

describe('messageForApiError', () => {
  it('prefers the server message', () => {
    expect(messageForApiError(new ApiError('CONFLICT', 'Slug em uso', 409))).toBe('Slug em uso');
  });

  it('uses the stable fallback for INTERNAL', () => {
    expect(messageForApiError(new ApiError('INTERNAL', 'stack trace', 500))).toBe(
      'Algo deu errado. Tente de novo.',
    );
  });
});
