import * as Dto from './dto';
import { PAYSTACK } from '@/consts';
import { AxiosInstance } from 'axios';
import { RESPONSE } from '@/response';
import { httpDelete, httpGet, httpPost, httpPut } from '@/utils/http';
import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class PaystackService {
  constructor(@Inject(PAYSTACK.AXIOS) private readonly axios: AxiosInstance) {}

  async fetchBanks(country = 'nigeria'): Promise<Dto.TPaystackBank[]> {
    const [res, error] = await httpGet<Dto.TPaystackResponse<Dto.TPaystackBank[]>>({
      axiosInstance: this.axios,
      url: `/bank?country=${country}`,
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async resolveAccountNumber(
    body: Dto.TPaystackResolveAccountRequestBody,
  ): Promise<Dto.TPaystackResolveAccountResponse> {
    const [res, error] = await httpGet<Dto.TPaystackResponse<Dto.TPaystackResolveAccountResponse>>({
      axiosInstance: this.axios,
      url: `/bank/resolve?account_number=${body.account_number}&bank_code=${body.bank_code}`,
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async createSubaccount(body: Dto.TPaystackCreateSubaccountRequestBody): Promise<Dto.TPaystackSubaccount> {
    const [res, error] = await httpPost<Dto.TPaystackResponse<Dto.TPaystackSubaccount>>({
      body,
      url: '/subaccount',
      axiosInstance: this.axios,
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async updateSubaccount(
    subaccountIdOrCode: string,
    body: Partial<Dto.TPaystackCreateSubaccountRequestBody>,
  ): Promise<Dto.TPaystackSubaccount> {
    const [res, error] = await httpPut<Dto.TPaystackResponse<Dto.TPaystackSubaccount>>({
      body,
      axiosInstance: this.axios,
      url: `/subaccount/${subaccountIdOrCode}`,
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async createTransfer(body: Dto.TPaystackCreateTransferRequestBody): Promise<Dto.TPaystackTransfer> {
    const [res, error] = await httpPost<Dto.TPaystackResponse<Dto.TPaystackTransfer>>({
      axiosInstance: this.axios,
      url: '/transfer',
      body,
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async listTransfers(perPage = 50, page = 1): Promise<Dto.TPaystackListResponse<Dto.TPaystackTransfer>> {
    const [res, error] = await httpGet<Dto.TPaystackListResponse<Dto.TPaystackTransfer>>({
      axiosInstance: this.axios,
      url: `/transfer?perPage=${perPage}&page=${page}`,
    });

    if (res) return res;
    return this.handleError(error);
  }

  async fetchTransfer(transferId: string): Promise<Dto.TPaystackTransfer> {
    const [res, error] = await httpGet<Dto.TPaystackResponse<Dto.TPaystackTransfer>>({
      axiosInstance: this.axios,
      url: `/transfer/${transferId}`,
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async createRecipient(body: Dto.TPaystackCreateRecipientRequestBody): Promise<Dto.TPaystackRecipient> {
    const [res, error] = await httpPost<Dto.TPaystackResponse<Dto.TPaystackRecipient>>({
      axiosInstance: this.axios,
      url: '/transferrecipient',
      body,
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async listRecipients(perPage = 50, page = 1): Promise<Dto.TPaystackListResponse<Dto.TPaystackRecipient>> {
    const [res, error] = await httpGet<Dto.TPaystackListResponse<Dto.TPaystackRecipient>>({
      axiosInstance: this.axios,
      url: `/transferrecipient?perPage=${perPage}&page=${page}`,
    });

    if (res) return res;
    return this.handleError(error);
  }

  async fetchRecipient(recipientId: string): Promise<Dto.TPaystackRecipient> {
    const [res, error] = await httpGet<Dto.TPaystackResponse<Dto.TPaystackRecipient>>({
      axiosInstance: this.axios,
      url: `/transferrecipient/${recipientId}`,
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async updateRecipient(
    recipientId: string,
    body: Partial<Dto.TPaystackCreateRecipientRequestBody>,
  ): Promise<Dto.TPaystackRecipient> {
    const [res, error] = await httpPut<Dto.TPaystackResponse<Dto.TPaystackRecipient>>({
      axiosInstance: this.axios,
      url: `/transferrecipient/${recipientId}`,
      body,
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async deleteRecipient(recipientId: string): Promise<Dto.TPaystackResponse<null>> {
    const [res, error] = await httpDelete<Dto.TPaystackResponse<null>>({
      axiosInstance: this.axios,
      url: `/transferrecipient/${recipientId}`,
      body: {},
    });

    if (res) return res;
    return this.handleError(error);
  }

  async initializeTransaction(
    body: Dto.TPaystackInitializeTransactionRequestBody,
  ): Promise<Dto.TPaystackResponse<Dto.TPaystackInitializeTransactionResponse>> {
    const [res, error] = await httpPost<Dto.TPaystackResponse<Dto.TPaystackInitializeTransactionResponse>>({
      body,
      axiosInstance: this.axios,
      url: '/transaction/initialize',
    });

    if (res) return res;
    return this.handleError(error);
  }

  async createDedicatedAccount(
    body: Dto.TPaystackCreateDedicatedAccountRequestBody,
  ): Promise<Dto.TPaystackDedicatedAccount> {
    const [res, error] = await httpPost<Dto.TPaystackResponse<Dto.TPaystackDedicatedAccount>>({
      axiosInstance: this.axios,
      url: '/dedicated_account',
      body,
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async listDedicatedAccounts(
    query: Dto.TPaystackListDedicatedAccountRequestBody = {},
  ): Promise<Dto.TPaystackListResponse<Dto.TPaystackDedicatedAccount>> {
    const params = new URLSearchParams();

    if (query.active !== undefined) params.append('active', query.active.toString());
    if (query.currency) params.append('currency', query.currency);
    if (query.provider_slug) params.append('provider_slug', query.provider_slug);
    if (query.bank_id) params.append('bank_id', query.bank_id.toString());
    if (query.customer) params.append('customer', query.customer);
    if (query.perPage) params.append('perPage', query.perPage.toString());
    if (query.page) params.append('page', query.page.toString());

    const [res, error] = await httpGet<Dto.TPaystackListResponse<Dto.TPaystackDedicatedAccount>>({
      axiosInstance: this.axios,
      url: `/dedicated_account?${params.toString()}`,
    });

    if (res) return res;
    return this.handleError(error);
  }

  async fetchDedicatedAccount(dedicatedAccountId: string): Promise<Dto.TPaystackDedicatedAccount> {
    const [res, error] = await httpGet<Dto.TPaystackResponse<Dto.TPaystackDedicatedAccount>>({
      axiosInstance: this.axios,
      url: `/dedicated_account/${dedicatedAccountId}`,
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async fetchBankProviders(): Promise<Dto.TPaystackBankProvider[]> {
    const [res, error] = await httpGet<Dto.TPaystackResponse<Dto.TPaystackBankProvider[]>>({
      axiosInstance: this.axios,
      url: '/dedicated_account/available_providers',
    });

    if (res) return res.data;
    return this.handleError(error);
  }

  async deactivateDedicatedAccount(dedicatedAccountId: string): Promise<Dto.TPaystackResponse<null>> {
    const [res, error] = await httpDelete<Dto.TPaystackResponse<null>>({
      body: {},
      axiosInstance: this.axios,
      url: `/dedicated_account/${dedicatedAccountId}`,
    });

    if (res) return res;
    return this.handleError(error);
  }

  async splitDedicatedAccount(
    body: Dto.TPaystackSplitDedicatedAccountRequestBody,
  ): Promise<Dto.TPaystackResponse<null>> {
    const [res, error] = await httpPost<Dto.TPaystackResponse<null>>({
      axiosInstance: this.axios,
      url: `/dedicated_account/${body.dedicated_account_id}/split`,
      body: { split_code: body.split_code },
    });

    if (res) return res;
    return this.handleError(error);
  }

  private handleError(error: any): any {
    if (error?.response?.data?.message === 'Invalid account number') {
      throw new BadRequestException({
        cause: error.response.data,
        message: RESPONSE.INVALID_ACCOUNT_DETAILS,
      });
    }

    throw new InternalServerErrorException({
      cause: error?.response?.data,
      message: RESPONSE.SERVER_ERROR,
      technicalMessage: error?.response?.data?.message,
    });
  }
}
