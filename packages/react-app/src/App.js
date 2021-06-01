import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Body,
  Imagediv as ImageDiv,
  Logo,
  BodyMain,
  Main,
  DisclaimerMain,
  Title,
  SubTitle,
  Text,
  List,
  FloatingDiv,
  FloatingInnerDiv,
  FloatingInnerLink,
  FloatingSpan,
  FloatingImg,
  ClaimButton,
  ConnectButton,
  BadgeButton,
  Bold,
  AccordionDiv,
  AccordionItemButtonDiv,
  AccordionItemDiv,
  FontAwesomeIconSet,
  AccordionItemPanelDiv,
  TopHeader,
  ThanksHeading,
  TransactionHeading,
  MainHeader,
  MenuBar,
  Line,
  Note,
} from "./components/styles";
import logo from "./argoLogo.png";
import disclaimerlogo from "./disclaimerLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";
import { addresses, abis } from "@project/contracts";
import BounceLoader from "react-spinners/BounceLoader";
import "react-accessible-accordion/dist/fancy-example.css";
import { css } from "@emotion/core";
import { MATIC_CHAIN_ID } from "./config";

const override = css`
  display: block;
  margin: 0px 0.5rem;
`;

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <ConnectButton
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </ConnectButton>
  );
}

function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [claimAmount, setClaimAmount] = useState(0);
  const [claimLoading, setClaimLoading] = useState(false);
  const [chain, setChain] = useState(MATIC_CHAIN_ID);
  const [hash, setHash] = useState();
  const [isHashed, setIsHashed] = useState(false);
  const [faucetAddress, setFaucetAddress] = useState("");
  const [userAddress, setUserAddress] = useState("Please connect your wallet");
  const [userBal, setUserBal] = useState(0);
  const [userStatus, setUserStatus] = useState(true);

  async function getFaucetContract(web3) {
    const contract = new web3.eth.Contract(abis.faucet, addresses.faucet);
    setFaucetAddress(addresses.faucet);
    return contract;
  }

  async function getErc20Contract(web3) {
    const contract = new web3.eth.Contract(abis.erc20, addresses.erc20);
    return contract;
  }

  async function faucetBalance() {
    const contract = await getErc20Contract(provider);
    var balance = await contract.methods.balanceOf(addresses.faucet).call();
    return provider.utils.fromWei(balance);
  }

  async function checkForUserStatus() {
    const contract = await getFaucetContract(provider);
    const wallet = await provider.eth.getAccounts();
    var status = await contract.methods.checkWithdraw(wallet[0]).call();
    return status;
  }

  async function userBalance() {
    const contract = await getErc20Contract(provider);
    const wallet = await provider.eth.getAccounts();
    var balance = await contract.methods.balanceOf(wallet[0]).call();
    return provider.utils.fromWei(balance);
  }

  async function getUserAddress() {
    const wallet = await provider.eth.getAccounts();
    return wallet[0];
  }

  async function getToken() {
    const contract = await getFaucetContract(provider);
    const wallet = await provider.eth.getAccounts();
    var tx = await contract.methods
      .withdraw(addresses.erc20)
      .send({ from: wallet[0] });
    setHash(tx.transactionHash);
    setIsHashed(true);
    return tx.transactionHash;
  }

  async function loadData() {
    var add = await getUserAddress();
    var bal = await userBalance();
    var status = await checkForUserStatus();
    const chainId = await provider.eth.getChainId();

    setUserStatus(status);
    setChain(chainId);
    setUserAddress(add);
    setUserBal(bal);

    // console.log("Status of the state: " + userStatus);
  }

  useEffect(() => {
    if (provider) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  // const startup = async () => {
  //   const claimableAmount = await airdropAmount();
  //   console.log(claimableAmount);
  //   setClaimAmount(Number.parseFloat(claimableAmount));
  // };

  var hashLink = "https://explorer-mumbai.maticvigil.com/tx/" + hash;

  return (
    <div>
      <MainHeader>
        <TopHeader>
          <FloatingDiv>
            <FloatingInnerDiv>
              <FloatingSpan>
                <FloatingImg
                  class="emoji"
                  draggable="false"
                  src="https://s.w.org/images/core/emoji/13.0.1/svg/2728.svg"
                  alt="✨"
                />{" "}
                NEW
              </FloatingSpan>
              Our app will soon be available on Mainnet
            </FloatingInnerDiv>
            <FloatingInnerLink>Learn More {"->"}</FloatingInnerLink>
          </FloatingDiv>
        </TopHeader>
        <MenuBar>
          <ImageDiv>
            <Logo
              src={logo}
              onClick={(e) =>
                window.open("https://argoapp.live/", "_blank", "noopener")
              }
            />
          </ImageDiv>
          <BadgeButton>Use Matic Testnet</BadgeButton>
          <WalletButton
            provider={provider}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            userAdd={getUserAddress}
          />
        </MenuBar>
      </MainHeader>
      <Body style={{ backgroundColor: "#FEFEFE" }}>
        <BodyMain>
          <Title>ArGo Faucet</Title>
          <SubTitle>
            WE WOULD NEVER BE HERE WITHOUT YOU! THANKS FOR THE SUPPORT!!!
          </SubTitle>
        </BodyMain>
        {userStatus && provider ? (
          <DisclaimerMain>
            <div style={{ textAlign: "center" }}>
              <TransactionHeading>
                <img src={disclaimerlogo} alt="❗" width="15" height="14" /> You have
                already claimed token from this account
              </TransactionHeading>
            </div>
          </DisclaimerMain>
        ) : (
          ""
        )}
        <Main>
          <ThanksHeading>Faucet</ThanksHeading>
          {provider ? (
            <div>
              <div class="user-item">
                <div class="user-item-body">
                  <div class="user-item-body-static">Wallet Address:</div>
                  <div class="user-item-body-var">{userAddress}</div>
                </div>
                <div class="user-item-body">
                    <div class="user-item-body-static">Wallet Balance:</div>
                    <div class="user-item-body-var">{userBal} ARGO</div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          <div class="disclaimer" style={{ textAlign: "center" }}>
            <TransactionHeading>
              <img src={disclaimerlogo} alt="❗" width="15" height="14" /> Disclaimer -
              You can claim token from ArGo faucet only once per account
            </TransactionHeading>
          </div>
          <div style={{ textAlign: "center" }}>
            <ClaimButton onClick={getToken} disabled={chain !== 80001}>
              {!provider ? (
                "Connect Wallet"
              ) : claimLoading ? (
                <BounceLoader
                  color={"#fff"}
                  css={override}
                  loading={claimLoading}
                  size={20}
                />
              ) : (
                `Get Token`
              )}
            </ClaimButton>
          </div>
        </Main>
        {isHashed ? (
          <Main>
            <ThanksHeading>Transactions</ThanksHeading>
            <div style={{ textAlign: "start" }}>
              <div style={{ textAlign: "start" }}>
                <a href={hashLink} target="_blank" rel="noopener noreferrer">
                  <TransactionHeading>{hash}</TransactionHeading>
                </a>
              </div>
            </div>
          </Main>
        ) : (
          ""
        )}
      </Body>
    </div>
  );
}

export default App;
