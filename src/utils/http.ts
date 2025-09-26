import { TResult } from '@/types';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

type THttpGet = { url: string; options?: AxiosRequestConfig; axiosInstance?: AxiosInstance };
type THttpPost = { url: string; body: any; options?: AxiosRequestConfig; axiosInstance?: AxiosInstance };
type THttpDelete = { url: string; body: any; options?: AxiosRequestConfig; axiosInstance?: AxiosInstance };

export const go = async <T>(fn: (...args: any[]) => Promise<T>): Promise<TResult<T>> => {
  try {
    const data = await fn();
    return [data, null];
  } catch (error) {
    return [null, error];
  }
};

export const httpGet = async <T>({ url, options, axiosInstance = axios.create() }: THttpGet): Promise<TResult<T>> => {
  return await go<T>(async () => {
    const res = await axiosInstance.get(url, options);
    return res.data;
  });
};

export const httpPost = async <T>({
  url,
  body,
  options,
  axiosInstance = axios.create(),
}: THttpPost): Promise<TResult<T>> => {
  return await go<T>(async () => {
    const res = await axiosInstance.post(url, body, options);
    return res.data;
  });
};

export const httpDelete = async <T>({
  url,
  body,
  options,
  axiosInstance = axios.create(),
}: THttpDelete): Promise<TResult<T>> => {
  return await go<T>(async () => {
    const res = await axiosInstance.delete(url, { data: body, ...options });
    return res.data;
  });
};

export const httpPut = async <T>({
  url,
  body,
  options,
  axiosInstance = axios.create(),
}: THttpPost): Promise<TResult<T>> => {
  return await go<T>(async () => {
    const res = await axiosInstance.put(url, body, options);
    return res.data;
  });
};
