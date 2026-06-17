import { Inngest } from 'inngest';

function resolveInngestDevMode() {
  const raw = process.env.INNGEST_DEV?.trim();

  if (raw === '0' || raw?.toLowerCase() === 'false') {
    return false;
  }

  if (raw === '1' || raw?.toLowerCase() === 'true') {
    return true;
  }

  return process.env.NODE_ENV !== 'production';
}

export function createInngestClient(appId: string) {
  return new Inngest({
    id: appId,
    isDev: resolveInngestDevMode(),
  });
}
