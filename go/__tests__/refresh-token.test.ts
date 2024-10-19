// @vitest-environment node

import { add } from "date-fns";
import { getIronSession, IronSession,  } from "iron-session";
import { testApiHandler } from 'next-test-api-route-handler'; // ◄ Must be first import
import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";

import * as tokenRefreshHandler from '@/app/auth/token/refresh/route';
import { accessTokenShouldBeRefreshed, TSessionData } from "@/lib/session/session";

vi.mock('iron-session', () => ({
  getIronSession: vi.fn(),
}));

beforeAll(() => {
  const fixedDate = new Date('2024-01-01T00:00:00Z');
  vi.useFakeTimers();
  vi.setSystemTime(fixedDate);
});

afterAll(() => {
  // Restore real timers
  vi.useRealTimers();
});

beforeEach(() => {
  getIronSession.mockResolvedValue({
    isLoggedIn: true,
  });
})

const sessionThatShouldBeRefreshed = () => ({
  isLoggedIn: true,
  type: "unilogin",
  expires: add(new Date(), {seconds: 59}),
  refresh_expires: add(new Date(), {seconds: 59}),
  access_token: "access_token",
  refresh_token: "refresh",
  id_token: "id",
});

test('That the refresh endpoint returns unauthorized if there is no active session', async () => {
  // Simulate an anonymous session.
  getIronSession.mockResolvedValue({
    isLoggedIn: false,
  });


  await testApiHandler({
    appHandler: tokenRefreshHandler,
    async test({ fetch }) {
      const res = await fetch({ method: 'POST', body: JSON.stringify({type: "unilogin"}) });
      const json = await res.json();
      expect(res.status).toEqual(401);
      expect(json).toMatchObject({ message: 'Unauthorized' });
    }
  });
});


test('Gives an error if type is not provided in payload and only the type', async () => {
  await testApiHandler({
    appHandler: tokenRefreshHandler,
    async test({ fetch }) {
      const res = await fetch({ method: 'POST', body: JSON.stringify({animal: "horse"}) });
      const json = await res.json();
      expect(json.errors).toHaveLength(2);
      expect(json.errors[0].code).toEqual("invalid_type");
      expect(json.errors[1].code).toEqual("unrecognized_keys");
   }
  });
  await testApiHandler({
    appHandler: tokenRefreshHandler,
    async test({ fetch }) {
      const res = await fetch({ method: 'POST', body: JSON.stringify({animal: "horse", type: "unilogin"}) });
      const json = await res.json();
       expect(json.errors).toHaveLength(1);
       expect(json.errors[0].code).toEqual("unrecognized_keys");

    }
  });
});

test('That the refresh endpoint only accepts known types', async () => {
  // This is an authorized session that should be refreshed.
  getIronSession.mockResolvedValue(sessionThatShouldBeRefreshed());

  await testApiHandler({
    appHandler: tokenRefreshHandler,
    async test({ fetch }) {
      const res = await fetch({ method: 'POST', body: JSON.stringify({type: "foo"}) });
      const json = await res.json();
       expect(json.errors).toHaveLength(1);
       expect(json.errors[0].code).toEqual("invalid_enum_value");
    }
  });
  await testApiHandler({
    appHandler: tokenRefreshHandler,
    async test({ fetch }) {
      const res = await fetch({ method: 'POST', body: JSON.stringify({type: "unilogin"}) });
      const json = await res.json();
      expect(json).toMatchObject({message: "Access token was refreshed"});
    }
  });
});

test('That the refresh endpoint informs that the access token was refreshed if needed', async () => {
  // This is an authorized session that should be refreshed.
  getIronSession.mockResolvedValue(sessionThatShouldBeRefreshed());

  await testApiHandler({
    appHandler: tokenRefreshHandler,
    async test({ fetch }) {
      const res = await fetch({ method: 'POST', body: JSON.stringify({type: "unilogin"}) });
      const json = await res.json();
      expect(json).toMatchObject({message: "Access token was refreshed"});
    }
  });

    // This is an authorized session that should NOT be refreshed.
    getIronSession.mockResolvedValue({
      isLoggedIn: true,
      expires: add(new Date(), {seconds: 300}),
      refresh_expires: add(new Date(), {seconds: 1800}),
      access_token: "access_token",
      refresh_token: "refresh"
    });

    await testApiHandler({
      appHandler: tokenRefreshHandler,
      async test({ fetch }) {
        const res = await fetch({ method: 'POST', body: JSON.stringify({type: "unilogin"}) });
        const json = await res.json();
        expect(json).toMatchObject({message: "Access token was NOT refreshed"});
      }
    });
});

test('That the refreshValidation validates if the access token should be refreshed correctly', async () => {
  // Since there is a buffer of 1 minute added to the refresh time,
  // the access token should be refreshed 1 minute before it expires.
  expect(accessTokenShouldBeRefreshed({
    type: "unilogin",
    expires: add(new Date(), {seconds: 59}),
    refresh_expires: add(new Date(), {seconds: 59}),
  } as IronSession<TSessionData>)).toBe(true);

  // Since there is a buffer of 1 minute added to the refresh time,
  // the access token should be refreshed 1 minute before it expires.
  // The tipping point in this case is the 60th second.
  expect(accessTokenShouldBeRefreshed({
    type: "unilogin",
    expires: add(new Date(), {seconds: 60}),
    refresh_expires: add(new Date(), {seconds: 60}),
  } as IronSession<TSessionData>)).toBe(false);

  // The refresh logic looks at both expires and refresh_expires.
  // Here the expires is the tipping point.
  expect(accessTokenShouldBeRefreshed({
    type: "unilogin",
    expires: add(new Date(), {seconds: 59}),
    refresh_expires: add(new Date(), {seconds: 1800}),
  } as IronSession<TSessionData>)).toBe(true);
  // Here the refresh_expires is the tipping point.
  expect(accessTokenShouldBeRefreshed({
    type: "unilogin",
    expires: add(new Date(), {seconds: 300}),
    refresh_expires: add(new Date(), {seconds: 59}),
  } as IronSession<TSessionData>)).toBe(true);
});
