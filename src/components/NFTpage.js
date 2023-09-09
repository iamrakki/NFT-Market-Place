import { useParams } from 'react-router-dom';
import axios from "axios";
import { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';

export default function NFTPage(props) {
    const { tokenId } = useParams();

    const [data, updateData] = useState([]);
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [own, setOwn] = useState(false);
    const [royaltyPercentage, setRoyaltyPercentage] = useState(0);

    async function getNFTData(tokenId) {
        let contract = props.contract;

        const tokenURI = await contract.tokenURI(tokenId);
        const listedToken = await contract.getListedTokenForId(tokenId);

        let meta = await axios(tokenURI, {
            method: 'GET',
            mode: 'cors'
        });

        meta = meta.data;
        let image = getIPFSGatewayURL(meta.image);

        let item = {
            price: meta.price,
            tokenId: tokenId,
            seller: listedToken.seller,
            owner: listedToken.owner,
            image: image,
            name: meta.name,
            description: meta.description,
        };


        if (meta.royaltyPercentage !== undefined) {
            setRoyaltyPercentage(meta.royaltyPercentage);
        }

        updateData(item);

        if (props.account.toLowerCase() === data.seller.toLowerCase() || props.account.toLowerCase() === data.seller.toLowerCase()) {
            setOwn(true);
        }

        updateDataFetched(true);
    }

    useEffect(() => {
        if (!dataFetched) {
            getNFTData(tokenId);
        }
    }, [dataFetched, tokenId]);

    const getIPFSGatewayURL = (ipfsURL) => {
        let urlArray = ipfsURL.split("/");
        let ipfsGateWayURL = `https://${urlArray[2]}.ipfs.dweb.link/${urlArray[3]}`;
        return ipfsGateWayURL;
    };

    async function buyNFT(tokenId) {
        try {
            const ethers = require("ethers");

            let contract = props.contract;
            const salePrice = ethers.utils.parseUnits(data.price, 'ether');
            updateMessage("Buying the NFT... Please Wait (Up to 5 mins)");

            let transaction = await contract.executeSale(tokenId, { value: salePrice });
            await transaction.wait();
            alert('You successfully bought the NFT!');
            updateMessage("");
            if (props.account.toLowerCase() === data.seller.toLowerCase() || props.account.toLowerCase() === data.seller.toLowerCase()) {
                setOwn(true);
            }
            else {
                setOwn(false);
            }
        }
        catch (e) {
            alert("Upload Error" + e);
        }
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
                                    <span className='text-info font-weight-bold'>Owner:</span>{' '}{data.owner}
                                </div>
                                <div>
                                    <span className='text-info font-weight-bold'>Seller:</span>{' '}{data.seller}
                                </div>
                                <div>
                                    <span className='text-info font-weight-bold'>Royalty Percentage:</span>{' '}{royaltyPercentage}%
                                </div>
                                <br />
                                <div className="d-grid gap-2">
                                    {own ?
                                        <div className="font-weight-bold text-success">You are the owner of this NFT</div>
                                        : <Button variant="primary" size="lg" onClick={() => buyNFT(data.tokenId)}>Buy this NFT</Button>
                                    }
                                    <div className="font-weight-bold">{message}</div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </center>
        </>
    );
}
