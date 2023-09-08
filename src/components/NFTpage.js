import { useParams } from 'react-router-dom';
import axios from "axios";
import { useState } from "react";
import Button from 'react-bootstrap/Button';
export default function NFTPage(props) {

    const [data, updateData] = useState([]);
    const [dataFetched, updateDataFetched] = useState(false);

    const [message, updateMessage] = useState("");
    const [own, setOwn] = useState(false);
    const [currAddress, updateCurrAddress] = useState("0x");

    async function getNFTData(tokenId) {
        let contract = props.contract;

        const tokenURI = await contract.tokenURI(tokenId);
        const listedToken = await contract.getListedTokenForId(tokenId);
        const royaltyPercentage = listedToken.royaltyPercentage; // Add this line to fetch royalty percentage

        let meta = await axios(tokenURI, {
            method: 'GET',  // Sending a POST request
            mode: 'cors'
        });

        meta = meta.data;
        let image = getIPFSGatewayURL(meta.image);
        console.log("image url: " + image);

        let item = {
            price: meta.price,
            tokenId: tokenId,
            seller: listedToken.seller,
            owner: listedToken.owner,
            image: image,
            name: meta.name,
            description: meta.description,
            royaltyPercentage: royaltyPercentage, // Include the royalty percentage in the item data
        };
        updateData(item);
        if (props.account.toLowerCase() === data.seller.toLowerCase() || props.account.toLowerCase() === data.seller.toLowerCase()) {
            setOwn(true);
        }

        console.log("accc", props.account.toLowerCase());
        console.log("seller", data.seller.toLowerCase());
        updateDataFetched(true);
    }


    async function buyNFT(tokenId) {
        try {
            const ethers = require("ethers");
            // Pull the deployed contract instance
            let contract = props.contract;
            const salePrice = ethers.utils.parseUnits(data.price, 'ether');
            const royaltyPercentage = data.royaltyPercentage; // Get the royalty percentage from the item data

            updateMessage("Buying the NFT... Please Wait ");

            // Calculate the royalty amount
            const royaltyAmount = (salePrice * royaltyPercentage) / 100;

            // Calculate the amount to send (total price minus royalty)
            const amountToSend = salePrice - royaltyAmount;

            // Run the executeSale function with the calculated amount
            let transaction = await contract.executeSale(tokenId, { value: amountToSend });
            await transaction.wait();

            // Pay the royalty to the original creator
            const originalCreator = data.owner;
            const originalCreatorAddress = originalCreator.toLowerCase();
            const signer = new ethers.Wallet(props.privateKey, props.provider);

            const royaltyTransaction = await signer.sendTransaction({
                to: originalCreatorAddress,
                value: royaltyAmount,
            });

            await royaltyTransaction.wait();

            alert('You successfully bought the NFT!');
            updateMessage("");
            if (props.account.toLowerCase() === data.seller.toLowerCase() || props.account.toLowerCase() === data.seller.toLowerCase()) {
                setOwn(true);
            } else {
                setOwn(false);
            }
        } catch (e) {
            alert("Upload Error" + e);
        }
    }


    const params = useParams();
    const tokenId = params.tokenId;
    if (!dataFetched)
        getNFTData(tokenId);

    const getIPFSGatewayURL = (ipfsURL) => {
        let urlArray = ipfsURL.split("/");
        let ipfsGateWayURL = `https://${urlArray[2]}.ipfs.dweb.link/${urlArray[3]}`;
        return ipfsGateWayURL;
    }
    return (
        <>
            <center>
                <div class="row row-cols-1 row-cols-md-1 g-4 mx-5 ">
                    <div class="col">
                        <div class="card h-100 w-50 ">
                            <img src={data.image} class="card-img-top" />
                            <div class="card-body text-left">
                                <div>
                                    <span className='text-info font-weight-bold'>Name:</span>{' '}{data.name}
                                </div>
                                <div>
                                    <span className='text-info font-weight-bold'>Description:</span>{' '}{data.description}
                                </div>
                                <div>
                                    <span className='text-info font-weight-bold'>Price:</span>{' '}{data.price + " MATIC"}
                                </div>
                                <div>
                                    <span className='text-info font-weight-bold'>Royalty Percentage:</span>{' '}{data.royaltyPercentage + "%"}
                                </div>

                                <div>
                                    <span className='text-info font-weight-bold'>Owner:</span>{' '}{data.owner}
                                </div>
                                <div>
                                    <span className='text-info font-weight-bold'>Seller:</span>{' '}{data.seller}
                                </div>
                                <br />
                                <div className="d-grid gap-2">
                                    {own ?
                                        <div className="font-weight-bold text-success">You are the owner of this NFT</div>
                                        : <Button variant="primary" size="lg" onClick={() => buyNFT(tokenId)}>Buy this NFT</Button>
                                    }
                                    <div className="font-weight-bold">{message}</div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </center>
        </>
    )
}
