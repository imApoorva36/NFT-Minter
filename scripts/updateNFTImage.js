const { ethers } = require("hardhat");
const axios = require("axios"); // Import Axios for making HTTP requests
const fs = require("fs");
const FormData = require("form-data"); // Import FormData to create a form for file upload
const path = require('path');

const config = {
    apiKey: 'd905c68e6f823e95baba', // Replace with your Pinata API Key
    apiSecret: '8c244069b32f6b71ba3e75e0de7f56d9b89c626a113f397573aa9c7089403613', // Replace with your Pinata API Secret
    pinataBaseURL: "https://api.pinata.cloud",
};

// Function to update the image URI for a specific token
async function updateTokenImage(tokenId, newImageURI) {
    const [deployer] = await ethers.getSigners();
    const contractAddress = "0x8877019DB783E175b98f32660aFe323F03333242"; // Replace with your deployed contract address

    // Load the contract ABI from the JSON file
    const abiFile = "C:/Users/apoor/OneDrive/Desktop/my-nft2/artifacts/contracts/MyNFT.sol/myNFT.json";
    const abiData = fs.readFileSync(abiFile);
    const abi = JSON.parse(abiData.toString()).abi; // Parse the ABI array

    const nftContract = new ethers.Contract(contractAddress, abi, deployer);

    console.log("Updating NFT image...");

    // Call the custom 'updateTokenURI' function
    const tx = await nftContract.updateTokenURI(tokenId, newImageURI);
    
    // Print the transaction hash
    console.log("NFT image updated successfully. Transaction Hash:", tx.hash);

    // Replace 'previousImageCID' with the actual CID of the previous image you want to remove
    // const previousImageCID = prevcid;

    // // Remove the previous image from IPFS
    // await removeImageFromIPFS(previousImageCID);


    console.log("Now uploading swapped image to IPFS...");
    
    const imageFilePathlocal = newImageURI;
    await uploadImageToIPFS(imageFilePathlocal);
    // const imageURI = `https://gateway.pinata.cloud/ipfs/${await uploadImageToIPFS(imageFilePath)}`;
}

async function uploadImageToIPFS(imageFilePath) {
    try {
        if (!fs.existsSync(imageFilePath)) {
            console.error('Image file does not exist at the specified path:', imageFilePath);
            process.exit(1);
        }
        const imageBuffer = fs.readFileSync(imageFilePath);
        const headers = {
            'pinata_api_key': config.apiKey,
            'pinata_secret_api_key': config.apiSecret,
            'Content-Type': 'multipart/form-data',
        };
        const formData = new FormData();
        formData.append("file", imageBuffer, { filename: 'picswapped.jpg' });
        try {
                delete headers['Content-Type'];
            
                const response = await axios.post(`${config.pinataBaseURL}/pinning/pinFileToIPFS`, formData, {
                    headers: {
                        ...formData.getHeaders(),  // Use FormData's getHeaders method
                        ...headers,               // Your custom headers (apiKey and apiSecret)
                    },
                    maxContentLength: Infinity,
                });
        
            console.log('Response data:', response.data);
            if (response.status === 200 && response.data.IpfsHash) {
                console.log(`Image uploaded to IPFS with CID: ${response.data.IpfsHash}`);
                return response.data.IpfsHash;
            } else {
                console.error('Error uploading image to IPFS:');
                console.error('Response status:', response.status);
                console.error('Response data:', response.data);
                process.exit(1);
            }
        } catch (error) {
                console.error('Error uploading image to IPFSerrorrrrrrrr:', error.message);
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                process.exit(1);
        }
    } catch (error) {
        console.error('Error uploading image to IPFS:', error);
        process.exit(1);
    }
}

// Example usage to update the image URI for token with ID 1
const tokenIdToUpdate = 1;
const newImageURI = "C:/Users/apoor/OneDrive/Desktop/my-nft2/scripts/pic2.jpg";

updateTokenImage(tokenIdToUpdate, newImageURI)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
