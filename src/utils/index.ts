export type TResult<T, E> = [T, null] | [null, E];

const dbUrl = process.env.DATABASE_URL || '';
export const isLocalDb = dbUrl.includes('@localhost');

export const go = async <T, E>(fn: (...args: any[]) => Promise<T>): Promise<TResult<T, E>> => {
  try {
    const data = await fn();
    return [data, null];
  } catch (error) {
    return [null, error];
  }
};

export const generateOtp = (length = 6) => {
  let otp = '';
  const digits = '0123456789';

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
};

export const minutesFromNow = (minutes: number) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
};
