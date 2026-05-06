import { Fee } from "@dpl/fbs";

export const getFeeObjectByFeeId = (feeObj: Fee[], feeId: number) => {
  return feeObj.filter((item) => {
    return item.feeId === feeId;
  });
};

export const getFeesBasedOnPayableByClient = (
  fees: Fee[],
  payableByClient: boolean
) => {
  return fees.filter((fee) => {
    return fee.payableByClient === payableByClient;
  });
};

export const calculateFeeAmount =
  (fees: Fee[], payableByClient: boolean) => () => {
    return getFeesBasedOnPayableByClient(fees, payableByClient).reduce(
      (accumulator, { amount }) => accumulator + amount,
      0
    );
  };
