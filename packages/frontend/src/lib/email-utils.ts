export const getEmailProviderUrl = (email: string): { name: string; url: string | null } => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return { name: 'Email App', url: null };

  const providers: Record<string, { name: string; url: string }> = {
    'gmail.com': { name: 'Gmail', url: 'https://mail.google.com' },
    'googlemail.com': { name: 'Gmail', url: 'https://mail.google.com' },
    'outlook.com': { name: 'Outlook', url: 'https://outlook.live.com/mail' },
    'hotmail.com': { name: 'Outlook', url: 'https://outlook.live.com/mail' },
    'live.com': { name: 'Outlook', url: 'https://outlook.live.com/mail' },
    'msn.com': { name: 'Outlook', url: 'https://outlook.live.com/mail' },
    'yahoo.com': { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' },
    'ymail.com': { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' },
    'icloud.com': { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' },
    'me.com': { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' },
    'mac.com': { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' },
    'proton.me': { name: 'ProtonMail', url: 'https://mail.proton.me' },
    'protonmail.com': { name: 'ProtonMail', url: 'https://mail.proton.me' },
  };

  if (providers[domain]) {
    return providers[domain];
  }

  // Best guess for custom domains
  return {
    name: domain,
    url: `https://mail.${domain}`
  };
};
