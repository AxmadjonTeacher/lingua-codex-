// Admin email addresses with upload permissions
export const ADMIN_EMAILS = [
    'ahmetyadgarovjust@gmail.com',
    'axmadjonyodgorov@gmail.com'
] as const;

/**
 * Check if the given email has admin permissions
 */
export function isAdmin(email: string | undefined | null): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email as typeof ADMIN_EMAILS[number]);
}
