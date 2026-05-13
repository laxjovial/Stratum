import os
from stellar_sdk import Server, Keypair, Network, TransactionBuilder, Asset
import uuid

class StellarService:
    def __init__(self):
        self.server_url = os.getenv("STELLAR_SERVER_URL", "https://horizon-testnet.stellar.org")
        self.server = Server(self.server_url)
        self.receiving_address = os.getenv("STELLAR_RECEIVING_ADDRESS")
        # For production, use Network.PUBLIC_NETWORK_PASSPHRASE
        self.network_passphrase = Network.TESTNET_NETWORK_PASSPHRASE if "testnet" in self.server_url else Network.PUBLIC_NETWORK_PASSPHRASE

    def generate_memo(self):
        """Generates a unique memo to identify a payment."""
        return str(uuid.uuid4())[:28] # Stellar memos have a length limit

    async def verify_payment(self, memo: str, expected_amount: float):
        """
        Checks the Stellar network for a payment with the given memo and amount.
        """
        if not self.receiving_address:
            raise ValueError("Stellar receiving address not configured.")

        # Query payments for the receiving account
        payments = self.server.payments().for_account(self.receiving_address).order(desc=True).limit(10).call()
        
        for payment in payments['_embedded']['records']:
            if payment['type'] == 'payment' and payment['asset_type'] == 'native':
                # Check if the transaction has the matching memo
                tx_hash = payment['transaction_hash']
                tx = self.server.transactions().transaction(tx_hash).call()
                
                if tx['memo'] == memo:
                    amount = float(payment['amount'])
                    if amount >= expected_amount:
                        return True
        return False

stellar_service = StellarService()
