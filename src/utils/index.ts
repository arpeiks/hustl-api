export type TResult<T, E> = [T, null] | [null, E];
type IGetPage = { page?: number; pageSize?: number };

const dbUrl = process.env.DATABASE_URL || '';
export const isLocalDb = dbUrl.includes('@localhost');

const initialGetPage: IGetPage = { page: 1, pageSize: 50 };

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

export const getPage = (data: IGetPage = initialGetPage) => {
  const page = data.page || initialGetPage.page;
  const pageSize = data.pageSize || initialGetPage.pageSize;

  const limit = pageSize || 50;
  const offset = ((page || 1) - 1) * limit;

  return { limit, offset, page, pageSize };
};

export const generatePagination = (currentPage = 1, pageSize = 50, totalDataSize = 0) => {
  const totalPages = Math.ceil(totalDataSize / pageSize);

  currentPage = Math.max(1, Math.min(currentPage, totalPages));

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + pageSize - 1, totalDataSize);

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return {
    pageSize,
    endIndex,
    totalPages,
    startIndex,
    currentPage,
    hasNextPage,
    totalDataSize,
    hasPreviousPage,
  };
};
