import { useState, useCallback } from 'react';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { useApi } from './useApi';
import { useErrorHandler } from './useErrorHandler';
import { endpoints } from '../services/api';
import PaymentContractABI from '../contracts/PaymentContract.json';

interface BlockchainConfig {
	networkUrl: string;
	contractAddress: string;
}

export function useBlockchain() {
	const [web3] = useState(() => new Web3(window.ethereum || process.env.REACT_APP_ETHEREUM_NETWORK));
	const [contract, setContract] = useState<Contract | null>(null);
	const [account, setAccount] = useState<string | null>(null);
	const api = useApi();
	const handleError = useErrorHandler();

	const initialize = useCallback(async () => {
		try {
			if (window.ethereum) {
				await window.ethereum.request({ method: 'eth_requestAccounts' });
				const accounts = await web3.eth.getAccounts();
				setAccount(accounts[0]);

				const paymentContract = new web3.eth.Contract(
					PaymentContractABI,
					process.env.REACT_APP_CONTRACT_ADDRESS
				);
				setContract(paymentContract);
			}
		} catch (error) {
			handleError(error as Error);
		}
	}, [web3, handleError]);

	const createPayment = useCallback(async (amount: string, recipient: string) => {
		if (!contract || !account) throw new Error('Blockchain not initialized');

		try {
			const tx = await contract.methods.createPayment(recipient).send({
				from: account,
				value: web3.utils.toWei(amount, 'ether'),
			});

			await api.request('post', `${endpoints.blockchain}/transactions/`, {
				hash: tx.transactionHash,
				amount,
				recipient,
			});

			return tx;
		} catch (error) {
			handleError(error as Error);
			throw error;
		}
	}, [contract, account, web3, api, handleError]);

	const verifyPayment = useCallback(async (txHash: string) => {
		try {
			const receipt = await web3.eth.getTransactionReceipt(txHash);
			return receipt?.status;
		} catch (error) {
			handleError(error as Error);
			return false;
		}
	}, [web3, handleError]);

	return {
		web3,
		contract,
		account,
		initialize,
		createPayment,
		verifyPayment,
	};
}