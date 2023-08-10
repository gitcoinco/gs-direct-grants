import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ApplicationDirectPayout from "../ApplicationDirectPayout";
import { makeGrantApplicationData, makeRoundData } from "../../../test-utils";
import { ROUND_PAYOUT_DIRECT } from "../../common/Utils";

import { useWallet } from "../../common/Auth";
import { useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { Erc20__factory } from "../../../types/generated/typechain";
import moment from "moment";
import { parseUnits } from "ethers/lib/utils.js";

jest.mock("../../../types/generated/typechain");
jest.mock("../../common/Auth");
jest.mock("wagmi");

const mockAddress = ethers.constants.AddressZero;
const mockWallet = {
  provider: {
    network: {
      chainId: 1,
    },
  },
  address: mockAddress,
  signer: {
    getChainId: () => {
      /* do nothing */
    },
  },
  chain: {
    name: "abc",
  },
};
const mockNetwork = {
  chain: {
    blockExplorers: {
      default: {
        url: "https://mock-blockexplorer.com",
      },
    },
  },
};

const correctAnswerBlocks = [
  {
    questionId: 0,
    question: "Email Address",
    answer: "johndoe@example.com",
  },
  {
    questionId: 1,
    question: "Payout token",
    answer: "DAI",
  },
  {
    questionId: 2,
    question: "Payout wallet address",
    answer: "0x444",
  },
];

describe("<ApplicationDirectPayout />", () => {
  let mockAllowance: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockAllowance = jest.fn().mockResolvedValue(BigNumber.from("0"));

    (Erc20__factory.connect as jest.Mock).mockImplementation(() => ({
      allowance: mockAllowance,
    }));
    (useWallet as jest.Mock).mockImplementation(() => mockWallet);
    (useSwitchNetwork as any).mockReturnValue({ chains: [] });
    (useDisconnect as any).mockReturnValue({});
    (useNetwork as jest.Mock).mockReturnValue(mockNetwork);
  });

  it('should trigger if "Payout token" answer is not present', () => {
    const mockProps = {
      round: makeRoundData({
        operatorWallets: [mockAddress],
      }),
      application: makeGrantApplicationData({
        applicationIndex: 1,
        payoutStrategy: {
          id: "1",
          strategyName: ROUND_PAYOUT_DIRECT,
          payouts: [],
        },
      }),
      answerBlocks: [
        {
          questionId: 0,
          question: "Email Address",
          answer: "johndoe@example.com",
        },
      ],
    };

    try {
      render(<ApplicationDirectPayout {...mockProps} />);
    } catch (error: any) {
      expect(error.message).toBe('"Payout token" not found in answers!');
    }
  });

  it("should trigger if the token of the answer is not known", () => {
    const mockProps = {
      round: makeRoundData({
        operatorWallets: [mockAddress],
      }),
      application: makeGrantApplicationData({
        applicationIndex: 1,
        payoutStrategy: {
          id: "1",
          strategyName: ROUND_PAYOUT_DIRECT,
          payouts: [],
        },
      }),
      answerBlocks: [
        {
          questionId: 0,
          question: "Email Address",
          answer: "johndoe@example.com",
        },
        {
          questionId: 1,
          question: "Payout token",
          answer: "UNKNOWN-TOKEN",
        },
      ],
    };

    try {
      render(<ApplicationDirectPayout {...mockProps} />);
    } catch (error: any) {
      expect(error.message).toContain("Token info not found for chain id");
    }
  });

  it('should trigger if the "Payout wallet address" answer is not present', () => {
    const mockProps = {
      round: makeRoundData({
        operatorWallets: [mockAddress],
      }),
      application: makeGrantApplicationData({
        applicationIndex: 1,
        payoutStrategy: {
          id: "1",
          strategyName: ROUND_PAYOUT_DIRECT,
          payouts: [],
        },
      }),
      answerBlocks: [
        {
          questionId: 0,
          question: "Email Address",
          answer: "johndoe@example.com",
        },
        {
          questionId: 1,
          question: "Payout token",
          answer: "DAI",
        },
      ],
    };

    try {
      render(<ApplicationDirectPayout {...mockProps} />);
      expect(
        screen.findByTestId("application-direct-payout")
      ).not.toBeInTheDocument();
    } catch (error: any) {
      expect(error.message).toBe(
        '"Payout wallet address" not found in answers!'
      );
    }
  });

  it('should display "Payouts have not been made yet." when there are no payouts', () => {
    const mockProps = {
      round: makeRoundData({
        operatorWallets: [mockAddress],
      }),
      application: makeGrantApplicationData({
        payoutStrategy: {
          id: "1",
          strategyName: ROUND_PAYOUT_DIRECT,
          payouts: [], // Empty payouts array
        },
      }),
      answerBlocks: correctAnswerBlocks,
    };

    render(<ApplicationDirectPayout {...mockProps} />);

    expect(
      screen.queryByText("Payouts have not been made yet.")
    ).toBeInTheDocument();
  });

  it("should display payout information when there are payouts", () => {
    const mockProps = {
      round: makeRoundData({
        operatorWallets: [mockAddress],
      }),
      application: makeGrantApplicationData({
        applicationIndex: 1,
        payoutStrategy: {
          id: "1",
          strategyName: ROUND_PAYOUT_DIRECT,
          payouts: [
            {
              amount: parseUnits("1", 18).toString(),
              applicationIndex: 1,
              createdAt: (
                moment().subtract(3, "day").valueOf() / 1000
              ).toString(),
              txnHash: "0x00001",
            },
            {
              amount: parseUnits("2", 18).toString(),
              applicationIndex: 1,
              createdAt: (
                moment().subtract(2, "day").valueOf() / 1000
              ).toString(),
              txnHash: "0x00002",
            },
            {
              amount: parseUnits("20", 18).toString(),
              applicationIndex: 2, // NOTE: This payout is for a different application
              createdAt: (
                moment().subtract(1, "day").valueOf() / 1000
              ).toString(),
              txnHash: "0x00003",
            },
          ],
        },
      }),
      answerBlocks: correctAnswerBlocks,
    };

    render(<ApplicationDirectPayout {...mockProps} />);

    const tbody = screen.getByTestId("direct-payout-payments-table");
    const filas = within(tbody).getAllByRole("row");
    const totalPaidOut = screen.getByTestId("direct-payout-payments-total");

    expect(filas.length).toBe(2);
    expect(filas[0].textContent).toContain("0x00001");
    expect(filas[1].textContent).toContain("0x00002");
    expect(totalPaidOut.textContent).toContain("3.0 DAI");
  });

  it("should not trigger payout if not amount or vault address is entered", async () => {
    const mockProps = {
      round: makeRoundData({
        operatorWallets: [mockAddress],
      }),
      application: makeGrantApplicationData({
        applicationIndex: 1,
        payoutStrategy: {
          id: "1",
          strategyName: ROUND_PAYOUT_DIRECT,
          payouts: [],
        },
      }),
      answerBlocks: correctAnswerBlocks,
    };

    render(<ApplicationDirectPayout {...mockProps} />);

    const button = screen.getByTestId("trigger-payment");
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText("Payment amount must be a number")
      ).toBeInTheDocument();
      expect(screen.getByText("Vault address is required")).toBeInTheDocument();
    });
  });

  it("should inform that allowance is not enough for the payout strategy when connected wallet is different than vault address", async () => {
    const mockProps = {
      round: makeRoundData({
        operatorWallets: [mockAddress],
      }),
      application: makeGrantApplicationData({
        applicationIndex: 1,
        payoutStrategy: {
          id: "1",
          strategyName: ROUND_PAYOUT_DIRECT,
          payouts: [],
        },
      }),
      answerBlocks: correctAnswerBlocks,
    };

    render(<ApplicationDirectPayout {...mockProps} />);

    const inputAmount = screen.getByTestId("payout-amount-input");
    const inputAddress = screen.getByTestId("payout-amount-address");
    fireEvent.change(inputAmount, { target: { value: "100" } });
    fireEvent.change(inputAddress, {
      target: { value: "0x1111111111111111111111111111111111111111" },
    });

    const button = screen.getByTestId("trigger-payment");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAllowance).toHaveBeenCalled();

      const needsAllowance =
        /In order to continue you need to allow the payout strategy contract with address .* to spend .* tokens\./;
      expect(screen.getByText(needsAllowance)).toBeInTheDocument();
    });
  });
});
