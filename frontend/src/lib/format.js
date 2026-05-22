export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 'Not provided';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatDate(value) {
  if (!value) {
    return 'Not provided';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) {
    return 'Not provided';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export function humanizeEnum(value) {
  if (!value) {
    return 'Not available';
  }

  return String(value)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function titleFromFilingPath(path) {
  switch (path) {
    case 'NY_OAG_RENT_SECURITY_COMPLAINT':
      return 'New York Attorney General complaint';
    case 'NYC_SMALL_CLAIMS_SECURITY_DEPOSIT_CIV_SC_50':
      return 'NYC small claims filing';
    case 'NYC_HP_ACTION_REPAIRS_PACKET':
      return 'NYC Housing Court repairs packet';
    default:
      return humanizeEnum(path);
  }
}
