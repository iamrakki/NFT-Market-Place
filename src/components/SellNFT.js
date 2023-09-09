import { useState } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { NFTStorage } from "nft.storage";
const APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEM1YjM4NTU1MEJCNjkyY0Y2QzU2NkQyRDI2MTVlRjNhNjQyMkU3YUYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5MzYzNjk1MDUyNiwibmFtZSI6IlplY3VyZWNoYWluIn0.023TRokXOm6kKwWwctmSuYtmMUikyCxnadwRlYCUnWk';

export default function SellNFT(props) {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '', royaltyPercentage: '' });

    const ethers = require("ethers");

    const [message, updateMessage] = useState('');
    const [tokenURI, setTokenURI] = useState('');
    const [uploadedFile, setUploadedFile] = useState();
    const [check, setCheck] = useState(false)

    // This function uploads the NFT image to IPFS
    async function OnChangeFile(e) {
        console.log("yep on work")
        var file = e.target.files[0];
        setUploadedFile(file);
    }

    const uploadNFTContent = async (inputFile) => {
        const { name, description, price, royaltyPercentage } = formParams;
        console.log("name", name)
        console.log("price", price)
        console.log("description", description)
        console.log("royaltyPercentage", royaltyPercentage)

        if (!name || !description || !price || !inputFile || !royaltyPercentage)
            return;

        console.log("conditions cleared")
        const nftStorage = new NFTStorage({ token: APIKEY, });
        try {
            const metaData = await nftStorage.store({
                name: name,
                description: description,
                price: price,
                royaltyPercentage: royaltyPercentage, 
                image: inputFile
            });
            setTokenURI(getIPFSGatewayURL(metaData.url));
            return metaData;

        } catch (error) {
            console.log(error);
        }
    }

    const getIPFSGatewayURL = (ipfsURL) => {
        let urlArray = ipfsURL.split("/");
        let ipfsGateWayURL = `https://${urlArray[2]}.ipfs.dweb.link/${urlArray[3]}`;
        return ipfsGateWayURL;
    }

    async function listNFT(e, file) {
        e.preventDefault();
        try {
            // Upload the file to IPFS
            setCheck(true);
            updateMessage("Please wait.. uploading (up to 5 mins)")
            const metaData = await uploadNFTContent(file);
            console.log("onChange final url", getIPFSGatewayURL(metaData.url));

            // Pull the deployed contract instance
            let contract = props.contract;
            console.log("contract", contract);
            console.log("price: ", formParams.price);
            
            // Massage the params to be sent to the create NFT request
            const price = ethers.utils.parseUnits(formParams.price, 'ether')
            const royaltyPercentage = parseInt(formParams.royaltyPercentage); 
            let listingPrice = await contract.getListPrice()
            listingPrice = listingPrice.toString()

            // Actually create the NFT
            let transaction = await contract.createToken(getIPFSGatewayURL(metaData.url), price, royaltyPercentage, { value: listingPrice }) 
            await transaction.wait()

            alert("Successfully listed your NFT!");
            updateMessage("");
            updateFormParams({ name: '', description: '', price: '', royaltyPercentage: '' });
            setCheck(false);
        }
        catch (e) {
            console.log("Error during file upload", e);
        }
    }

    return (
        <div>
            <Row className="justify-content-md-center text-white">
                <Col md="auto">
                    <form>
                        <div class="form-group">
                            <label htmlFor="name">NFT Name</label>
                            <input id="name" type="text" class="form-control" placeholder="XXXXX" onChange={e => updateFormParams({ ...formParams, name: e.target.value })} value={formParams.name} />
                        </div>

                        <div class="form-group">
                            <label htmlFor="description">NFT Description</label>
                            <textarea class="form-control" cols="40" rows="3" id="description" type="text" value={formParams.description} onChange={e => updateFormParams({ ...formParams, description: e.target.value })}></textarea>
                        </div>

                        <div class="form-group">
                            <label htmlFor="price">Price (in MATIC)</label>
                            <input class="form-control" type="number" placeholder="Min 0.01 MATIC" step="0.01" value={formParams.price} onChange={e => updateFormParams({ ...formParams, price: e.target.value })}></input>
                        </div>

                        <div class="form-group">
                            <label htmlFor="royaltyPercentage">Royalty Percentage</label>
                            <input class="form-control" type="number" placeholder="0-100" min="0" max="100" value={formParams.royaltyPercentage} onChange={e => updateFormParams({ ...formParams, royaltyPercentage: e.target.value })}></input>
                        </div>

                        <div class="form-group">
                            <label htmlFor="image">Upload Image</label>
                            <input type="file" class="form-control-file" id="exampleFormControlFile1" onChange={OnChangeFile} />
                        </div>
                        <br></br>
                        <div class="text-green text-center">{message}</div>
                        <br></br>
                        <div class="d-grid gap-2">
                            <button disabled={check} onClick={e => listNFT(e, uploadedFile)} class="btn btn-primary">List NFT</button>
                        </div>

                    </form>
                </Col>
            </Row>
        </div>
    )
}
