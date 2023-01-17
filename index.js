// in nodexjs
// require()

// in front-end javascript you can't use require
// import
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("connected!")
        connectButton.innerHTML = "Connected!"
    } else {
        console.log("No metamask!")
        connectButton.innerHTML = "Please install metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the b/c
        // signer / wallet / someone with some gas
        // contract that we are interacting with
        // ^ ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // listen for the txn to be mined
            // hey, wait for this txn to finish
            await listenForTransactionMined(transactionResponse, provider)
            console.log(`Done!`)
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMined(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // create a listner for the blockchain
    // listen for this txn to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (TransactionReceipt) => {
            console.log(
                `Completed with ${TransactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

// withdraw
async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing ...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMined(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}
