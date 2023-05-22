import { Round } from "../types";
import { makeRoundData } from "../../../test-utils";
import { TransactionBuilder } from "../round";
import { getWalletClient } from "@wagmi/core";
import { WalletClient } from "wagmi";
import RoundImplementationABI from "../abi/RoundImplementationABI";
import { ExtractAbiFunctionNames } from "abitype";
import { toHex } from "viem";

describe("TransactionBuilder", () => {
  const round: Round = makeRoundData();

  let transactionBuilder: TransactionBuilder;
  let walletClient: WalletClient;

  beforeEach(async () => {
    walletClient = (await getWalletClient({})) as WalletClient;
    transactionBuilder = new TransactionBuilder(round, walletClient);
  });

  it("should initialize correctly", () => {
    expect(transactionBuilder.round).toBe(round);
    expect(transactionBuilder.walletClient).toBe(walletClient);
    expect(transactionBuilder.transactions).toEqual([]);
  });

  it("should throw an error when round ID is undefined", () => {
    expect(
      () => new TransactionBuilder({ ...round, id: undefined }, walletClient)
    ).toThrowError("Round ID is undefined");
  });

  it("should add a transaction to the builder", () => {
    const args = [{ protocol: 1n, pointer: "abcd" }] as const;
    transactionBuilder.add("updateApplicationMetaPtr", args);

    const transactions = transactionBuilder.getTransactions();
    expect(transactions.length).toEqual(1);
  });

  it("should add multiple transactions to the builder", () => {
    const action1: ExtractAbiFunctionNames<typeof RoundImplementationABI> =
      "updateApplicationMetaPtr";
    const args1 = [{ protocol: 1n, pointer: "abcd" }] as const;
    transactionBuilder.add(action1, args1);

    const action2: ExtractAbiFunctionNames<typeof RoundImplementationABI> =
      "updateMatchAmount";
    const args2 = [1n] as const;

    transactionBuilder.add(action2, args2);

    const transactions = transactionBuilder.getTransactions();
    expect(transactions.length).toEqual(2);
  });

  it("should throw an error when there are no transactions to execute", async () => {
    await expect(transactionBuilder.execute()).rejects.toThrowError(
      "No transactions to execute"
    );
  });

  it("should return the transactions", () => {
    const transactions = Array(3).fill(toHex(Math.random(), { size: 32 }));
    transactionBuilder.transactions = transactions;

    const result = transactionBuilder.getTransactions();

    expect(result).toBe(transactions);
  });
});
