import {
  AccountRequest,
  CustomDataNotification,
  TransactionStatus,
  ValidCurrency,
} from 'cloudpayments';

export interface IDefaultTransactionNotification
  extends AccountRequest,
    CustomDataNotification {
  TransactionId: number;
  Amount: number;
  Currency: ValidCurrency;
  DateTime: string;
  CardFirstSix: string;
  CardLastFour: string;
  CardType: string;
  CardExpDate: string;
  TestMode: 1 | 0;
  InvoiceId?: string;
  SubscriptionId?: string;
  Name?: string;
  IpAddress?: string;
  IpCountry?: string;
  IpCity?: string;
  IpRegion?: string;
  IpDistrict?: string;
  Issuer?: string;
  IssuerBankCountry?: string;
  Description?: string;
  Status?: TransactionStatus;
  Token?: string;
}
