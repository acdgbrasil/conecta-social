// 🎨 Códigos de cor ANSI fáceis de acessar
export const colors = {
  reset: '\x1b[0m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
};

const getTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export const logMongo = (message: string) => {
  console.log(`${getTimestamp()} ${colors.green}[MongoDB] ${message}${colors.reset}`);
};

export const logPostgres = (message: string) => {
  console.log(`${getTimestamp()} ${colors.blue}[PostgreSQL] ${message}${colors.reset}`);
};

export const logSendgrid = (message: string) => {
  console.log(`${getTimestamp()} ${colors.magenta}[SendGrid] ${message}${colors.reset}`);
};

export const logError = (message: string) => {
  console.error(`${getTimestamp()} ${colors.red}[ERROR] ${message}${colors.reset}`);
};