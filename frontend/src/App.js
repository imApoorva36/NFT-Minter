import "./App.css";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { ethers } from "ethers";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
const contractABI = require('./MyNFT.sol/MyNFT.json').abi;

const config = {
  apiKey: 'd905c68e6f823e95baba', // Replace with your Pinata API Key
  apiSecret: '8c244069b32f6b71ba3e75e0de7f56d9b89c626a113f397573aa9c7089403613', // Replace with your Pinata API Secret
  pinataBaseURL: "https://api.pinata.cloud",
  API_URL : "https://eth-sepolia.g.alchemy.com/v2/oAuuaMa3QmytELmS_EKjPWSegTL9vN09",
  PRIVATE_KEY : "87302a1444704e71fe0b06c9deb63840c64d912dc8de1fe953d5518dd273566a",
  PINATA_API_KEY:'26424a41fb17a5f2c416',
  PINATA_API_SECRET:'9cb79431e6f23e62050d7e81aeea038fb352e3e2c3d80f11f9a144174beb8a97'
};

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const contractAddress = "0x2705505b14D907FF05C92148dd8d17bCEF85602E";
  const alchemyUrl = 'https://eth-sepolia.g.alchemy.com/v2/oAuuaMa3QmytELmS_EKjPWSegTL9vN09'; // Replace with your Alchemy API URL

  // const privateKey = "87302a1444704e71fe0b06c9deb63840c64d912dc8de1fe953d5518dd273566a"
  const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);
  const wallet = new ethers.Wallet("87302a1444704e71fe0b06c9deb63840c64d912dc8de1fe953d5518dd273566a", provider);
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
    if (web3 && accounts.length > 0 && newImage) {
      const formData = new FormData();
      formData.append("file", newImage);

      try {
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
            const tx = await nftContract.mintWithURI(imageURI, {
              gasPrice: ethers.utils.parseUnits('50', 'gwei'),
              gasLimit: 2000000,
            });
            await tx.wait();
            alert("NFT minted successfully!");
             console.log(tx);
            // prevcid=response.data.IpfsHash;
            return response.data.IpfsHash;
        } else {
            console.error('Error uploading image to IPFS:');
            console.error('Response status:', response.status);
            console.error('Response data:', response.data);
            process.exit(1);
        }

        
      } catch (error) {
        console.error("E  rror minting NFT:", error);
      }
    } else {
      alert("Please select an image to mint.");
    }
  };

  const handleUpdateImage = async () => {
    if (tokenId && newImage) {
      const formData = new FormData();
      formData.append("file", newImage);
  
      try {
        // Upload the new image to IPFS
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
  
          // Update the NFT's image URI using the provided tokenId
          const tx = await nftContract.updateTokenURI(tokenId, newImageURI, {
            gasPrice: ethers.utils.parseUnits('50', 'gwei'),
            gasLimit: 2000000,
          });
          await tx.wait();
          console.log("NFT image updated successfully. Transaction Hash:", tx.hash);
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
          <Form.Label>Token ID (for <strong>updating NFT Image</strong> of previously created token(NFT) ): </Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter Token ID"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>Select Image: </Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setNewImage(e.target.files[0])}
          />
        </Form.Group>
      </Form>
        <Button variant="primary" onClick={handleMint} className="buttons">
          <strong>Mint</strong> NFT
        </Button>
        <Button variant="success" onClick={handleUpdateImage} className="buttons">
          <strong>Update</strong> NFT Image
        </Button>
    </div>
  );
}

export default App;