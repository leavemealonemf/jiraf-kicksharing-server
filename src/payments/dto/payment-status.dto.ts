export enum PaymentEvent {
  SUCCEEDED = 'payment.succeeded',
  CANCELED = 'payment.canceled',
  CAPTURE = 'payment.waiting_for_capture',
}

type PaymentId = string;

export type PaymentCard = {
  first6: string;
  last4: string;
  expiry_year: string;
  expiry_month: string;
  card_type: string;
  issuer_country: string;
};

type PaymentMethod = {
  type: 'bank_card';
  id: PaymentId;
  saved: boolean;
  title: string;
  card: PaymentCard;
};

type PaymentObject = {
  id: PaymentId;
  status: string;
  amount: object;
  income_amount: object;
  description: PaymentDescription;
  recipient: object;
  payment_method: PaymentMethod;
};

export enum PaymentDescription {
  ADD_PAYMENT_METHOD = 'Привязка метода',
  SCOOTER_RENT = 'Опрата аренды',
  TRIP_PAYMENT = 'Оплата поездки',
}

export class PaymentStatusDto {
  type: string;
  event: PaymentEvent;
  object: PaymentObject;
}
