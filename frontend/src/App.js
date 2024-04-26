import "./App.css";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { ethers } from "ethers";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
const contractABI = require('./MyNFT.sol/MyNFT.json').abi;

const config = {
  apiKey: 'd9...', // Replace with your Pinata API Key
  apiSecret: '8c...', // Replace with your Pinata API Secret
  pinataBaseURL: "https://api.pinata.cloud",
  API_URL : "https://eth-sepolia.g.alchemy.com/...",
  PRIVATE_KEY : "87...",
  PINATA_API_KEY:'26...',
  PINATA_API_SECRET:'9c...'
};

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const contractAddress = "0x0...";
  const alchemyUrl = 'https://eth-sepolia.g.alchemy.com/...'; // Replace with your Alchemy API URL

  // const privateKey = "87302a1444704e71fe0b06c9deb63840c64d912dc8de1fe953d5518dd273566a"
  const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);
  const wallet = new ethers.Wallet("87...", provider);
  const nftContract = new ethers.Contract(contractAddress, contractABI, wallet);

  const [tokenId, setTokenId] = useState("");
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    async function initWeb3() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setWeb3(provider);

        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3 = new Web3(window.ethereum);

          const accounts = await web3.eth.getAccounts();
          setAccounts(accounts);
        } catch (error) {
          console.error("User denied account access or other error:", error);
        }
      } else {
        console.error("MetaMask is not installed");
      }
    }
    initWeb3();
  }, []);

  const handleMint = async () => {
    if (web3 && accounts.length > 0) {
      if (!newImage) {
        alert("Please select an image to mint.");
        return; // Exit the function if no image is selected
      }
      try {
        const formData = new FormData();
        formData.append("file", newImage);
        const headers = {
          'pinata_api_key': config.apiKey,
          'pinata_secret_api_key': config.apiSecret,
          'Content-Type': 'multipart/form-data',
      };
        delete headers['Content-Type'];
        const response = await axios.post(`${config.pinataBaseURL}/pinning/pinFileToIPFS`, formData, {
            headers: {
              'pinata_api_key': config.PINATA_API_KEY,
              'pinata_secret_api_key': config.PINATA_API_SECRET,
            },
            maxContentLength: Infinity,
        });

        console.log('Response data:', response.data);
        if (response.status === 200 && response.data.IpfsHash) {
            console.log(`Image uploaded to IPFS with CID: ${response.data.IpfsHash}`);
            alert('Image is uploaded to IPFS, wait for NFT to be minted...')
            const imageURI = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
            const tx = await nftContract.populateTransaction.mintWithURI(imageURI);
            tx.to=contractAddress;
            const transactionParameters = {
              from: accounts[0],
              to: tx.to,
              data: tx.data,
            };
            const txHash = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [transactionParameters],
            });
            console.log("Transaction Hash: " ,txHash);
            alert("NFT minted successfully!");
            return response.data.IpfsHash;
        } else {
            console.error('Error uploading image to IPFS:');
            console.error('Response status:', response.status);
            console.error('Response data:', response.data);
            process.exit(1);
        }
      } catch (error) {
        console.error("Error minting NFT:", error);
      }
    } else {
      alert("Please select an image to mint.");
    }
  };

  const handleUpdateImage = async () => {
    if (tokenId) {
      if (!newImage) {
        alert("Please select an image to update.");
        return; // Exit the function if no image is selected
      }
      
      if (!tokenId) {
        alert("Please provide a valid token ID to update.");
        return; // Exit the function if no token ID is provided
      }
      const formData = new FormData();
      formData.append("file", newImage);
      try {
        const headers = {
          'pinata_api_key': config.PINATA_API_KEY,
          'pinata_secret_api_key': config.PINATA_API_SECRET,
        };
        const response = await axios.post(`${config.pinataBaseURL}/pinning/pinFileToIPFS`, formData, {
          headers,
          maxContentLength: Infinity,
        });
        if (response.status === 200 && response.data.IpfsHash) {
          console.log(`Image uploaded to IPFS with CID: ${response.data.IpfsHash}`);
          const newImageURI = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
          alert("New Image Uploaded to IPFS, approve Transaction to update Image in NFT")
          const tx = await nftContract.updateTokenURI(tokenId, newImageURI);
          const transactionParameters = {
            from: accounts[0],
            to: nftContract.address,
            data: tx.data,
            gasPrice: ethers.utils.parseUnits('10', 'gwei').toString(),
          };
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
          });
          console.log("Transaction Hash: ", txHash);
          alert("NFT image updated successfully!");

        } else {
          console.error('Error uploading image to IPFS:');
          console.error('Response status:', response.status);
          console.error('Response data:', response.data);
        }
      } catch (error) {
        console.error("Error updating NFT image:", error);
      }
    } else {
      alert("Please provide a valid token ID and select an image to update.");
    }


  }
  

  useEffect(() => {
    if (web3) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccounts(accounts);
      });
    }
  }, [web3]);

  return (
    <div className="App">
      <h1>NFT MINTER</h1>
      <Form>
        <Form.Group className="form-group">
        <div class="mb-3">
          <Form.Label class="form-label" >Token ID :</Form.Label>
          <div class="col-sm-10">
          <Form.Control class="form-control"
            type="number"
            placeholder="Enter Token ID For updating NFT Image of previously created token(NFT)"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
          </div>
        </div>
        </Form.Group>
        <Form.Group class="form-group">
        <div class="mb-3">
          <Form.Label for="formFile" class="form-label">Select <strong>Image</strong> for Upload</Form.Label>
          <Form.Control class="form-control"  id="formFile" aria-describedby="inputGroupFileAddon04" aria-label="Upload"
            type="file"
            onChange={(e) => setNewImage(e.target.files[0])}
          />
          
        </div>
        
        </Form.Group>
      </Form>
      <div className="buttons">
        <Button variant="primary" onClick={handleMint} className="btn btn-primary">
          <strong>Mint</strong> NFT
        </Button>
        <Button variant="success" onClick={handleUpdateImage} className="btn btn-primary">
          <strong>Update</strong> NFT Image
        </Button>
      </div>
        
    </div>
  );
}

export default App;
