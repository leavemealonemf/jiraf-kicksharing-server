export enum AcquiringPaymentEvent {
  SUCCEEDED = 'payment.succeeded',
  CANCELED = 'payment.canceled',
  CAPTURE = 'payment.waiting_for_capture',
}

type AcquiringPaymentId = string;

export type AcquiringPaymentCard = {
  first6: string;
  last4: string;
  expiry_year: string;
  expiry_month: string;
  card_type: string;
  issuer_country: string;
};

type AcquiringPaymentMethod = {
  type: 'bank_card';
  id: AcquiringPaymentId;
  saved: boolean;
  title: string;
  card: AcquiringPaymentCard;
};

type AcquiringPaymentObject = {
  id: AcquiringPaymentId;
  status: string;
  amount: object;
  income_amount: object;
  description: AcquiringPaymentDescription;
  recipient: object;
  payment_method: AcquiringPaymentMethod;
};

export enum AcquiringPaymentDescription {
  ADD_PAYMENT_METHOD = 'Привязка метода',
  SCOOTER_RENT = 'Опрата аренды',
  TRIP_PAYMENT = 'Оплата поездки',
}

export class AcquiringPaymentStatusDto {
  type: string;
  event: AcquiringPaymentEvent;
  object: AcquiringPaymentObject;
}
