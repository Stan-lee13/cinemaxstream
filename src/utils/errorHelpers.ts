export function getErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  const maybeMessage = (err as { message?: unknown })?.message;
  return typeof maybeMessage === 'string' ? maybeMessage : JSON.stringify(err);
}

export default getErrorMessage;