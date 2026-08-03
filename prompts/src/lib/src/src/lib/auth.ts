import { NextRequest } from 'next/server';

/**
 * Returns true if the request carries the correct automation secret
 * (used by n8n to call event/snapshot/reveal routes). Never checked
 * against browser-facing routes like /api/predictions.
 */
export function isAuthorizedAutomation(req: NextRequest): boolean {
  const secret = req.headers.get('x-automation-secret');
  return secret === process.env.AUTOMATION_SHARED_SECRET;
}
