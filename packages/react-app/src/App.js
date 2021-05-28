import React from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header, Image, Link } from "./components";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";



function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  async function getFaucetContract(web3) {
    const contract = new web3.eth.Contract(abis.faucet, addresses.faucet);
    return contract;
  }
  async function getErc20Contract(web3) {
    const contract = new web3.eth.Contract(abis.erc20, addresses.erc20);
    return contract;
  }

  async function faucetBalance() {
    const contract = await getErc20Contract(provider);
    var balance = await contract.methods
      .balanceOf(addresses.faucet)
      .call();
    return provider.utils.fromWei(balance);

  }
  async function checkForUserStatus() {
    const contract = await getFaucetContract(provider);
    const wallet = await provider.eth.getAccounts();
    var status = await contract.methods
      .checkWithdraw(wallet[0])
      .call();
    return status;

  }
  async function userBalance() {
    const contract = await getErc20Contract(provider);
    const wallet = await provider.eth.getAccounts();
    var balance = await contract.methods
      .balanceOf(wallet[0])
      .call();
    return provider.utils.fromWei(balance);

  }
  async function getToken() {
    const contract = await getFaucetContract(provider);
    const wallet = await provider.eth.getAccounts();
    var tx = await contract.methods.withdraw(addresses.erc20).send({ from: wallet[0] });
    return tx

  }

  async function getUserAddress() {
    const wallet = await provider.eth.getAccounts();
    return wallet[0];
  }

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Body>
        <Image src={logo} alt="react-logo" />
        <p>
          Edit <code>packages/react-app/src/App.js</code> and save to reload.
        </p>
        {/* Remove the "hidden" prop and open the JavaScript console in the browser to see what this function does */}
        <Button hidden>
          Read On-Chain Balance
        </Button>
        <Link href="https://ethereum.org/developers/#getting-started" style={{ marginTop: "8px" }}>
          Learn Ethereum
        </Link>
        <Link href="https://reactjs.org">Learn React</Link>
        <Link href="https://thegraph.com/docs/quick-start">Learn The Graph</Link>
      </Body>
    </div>
  );
}

export default App;
