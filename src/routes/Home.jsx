import { useState, useRef, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Metadata from '../assets/metadata.json'
import { useUpProvider } from '../contexts/UpProvider'
import { PinataSDK } from 'pinata'
import ABI from '../abi/Dracos.json'
import LYXbadge from './../assets/⏣.svg'
import PpageLogo from './../assets/upage.svg'
import DracosEyes from './../assets/dracos-eyes.png'

import IconSwipe from './../assets/icon-swipe.svg'
import IconLike from './../assets/icon-like.svg'
import IconDownload from './../assets/icon-download.svg'
import IconView from './../assets/icon-view.svg'

import Web3 from 'web3'
import styles from './Home.module.scss'
import { useNavigate } from 'react-router'

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_API_KEY,
  pinataGateway: 'example-gateway.mypinata.cloud',
})

function Home() {
  const [totalSupply, setTotalSupply] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [mintPrice, setMintPrice] = useState(0)
  const [swipePrice, setSwipePrice] = useState(0)
  const [swipeModal, setSwipeModal] = useState(false)
  const [tokenDetailModal, setTokenDetailModal] = useState(false)
  const [token, setToken] = useState([])
  const [profile, setProfile] = useState()
  const [showWhitelist, setShowWhitelist] = useState(false)
  const [whitelist, setWhitelist] = useState([])
  const [swipeCount, setSwipeCount] = useState(0)
  const [tokenDetail, setTokenDetail] = useState()

  const [freeMintCount, setFreeMintCount] = useState(0)

  const canvasRef = useRef()
  const navigate = useNavigate()

  const auth = useUpProvider()

  const web3Readonly = new Web3(import.meta.env.VITE_LUKSO_PROVIDER)
  const _ = web3Readonly.utils
  const contractReadonly = new web3Readonly.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)

  const SVG = useRef()
  const baseGroupRef = useRef()
  const backgroundGroupRef = useRef()
  const eyesGroupRef = useRef()
  const mouthGroupRef = useRef()
  const headGroupRef = useRef()
  const clothingGroupRef = useRef()
  const backGroupRef = useRef()
  const GATEWAY = `https://ipfs.io/ipfs/`
  const CID = `bafybeihqjtxnlkqwykthnj7idx6ytivmyttjcm4ckuljlkkauh6nm3lzve`
  const BASE_URL = `./dracos-nfts/` //`https://aratta.dev/dracos-nfts/` //`${GATEWAY}${CID}/` // `http://localhost/luxgenerator/src/assets/pepito-pfp/` //`http://localhost/luxgenerator/src/assets/pepito-pfp/` //`${GATEWAY}${CID}/` // Or

  const weightedRandom = (items) => {
    //console.log(items)
    const totalWeight = items.reduce((acc, item) => acc + item.weight, 0)
    const randomNum = Math.random() * totalWeight

    let weightSum = 0
    for (const item of items) {
      weightSum += item.weight
      if (randomNum <= weightSum) {
        //        console.log(item.name)
        return item.name
      }
    }
  }

  const download = (url) => {
    //const htmlStr = SVG.current.outerHTML
    // const blob = new Blob([htmlStr], { type: 'image/svg+xml' })
    // const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    //  return
    //   const a = document.createElement('a')
    // a.setAttribute('download')

    //   a.setAttribute('href', url)
    //   a.style.display = 'none'
    //   document.body.appendChild(a)
    //   a.click()
    //   a.remove()
    // URL.revokeObjectURL(url)
  }

  const generate = async (trait) => {
    const svgns = 'http://www.w3.org/2000/svg'

    // Clear the board
    // SVG.current.innerHTML = ''
    const randomTrait = weightedRandom(Metadata[`${trait}`])
    //    console.log(`${BASE_URL}${trait}/${randomTrait}.png`)
    let response = await fetch(`${BASE_URL}${trait}/${randomTrait}.png`, { mode: 'no-cors' })
    let blob = await response.blob()

    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
      const base64data = reader.result
      const image = document.createElementNS(svgns, 'image')
      image.setAttribute('href', base64data)
      image.setAttribute('width', 400)
      image.setAttribute('height', 400)
      image.setAttribute('x', 0)
      image.setAttribute('y', 0)
      //      image.addEventListener('load', () => console.log(`${trait} has been loaded`))

      // Add to the group
      switch (trait) {
        case `base`:
          baseGroupRef.current.innerHTML = ''
          baseGroupRef.current.appendChild(image)
          break
        case `background`:
          backgroundGroupRef.current.innerHTML = ''
          backgroundGroupRef.current.appendChild(image)
          break
        case `eyes`:
          eyesGroupRef.current.innerHTML = ''
          eyesGroupRef.current.appendChild(image)
          break
        case `mouth`:
          mouthGroupRef.current.innerHTML = ''
          mouthGroupRef.current.appendChild(image)
          break
        case `head`:
          headGroupRef.current.innerHTML = ''
          headGroupRef.current.appendChild(image)
          break
        case `clothing`:
          clothingGroupRef.current.innerHTML = ''
          clothingGroupRef.current.appendChild(image)
          break
        case `back`:
          backGroupRef.current.innerHTML = ''
          backGroupRef.current.appendChild(image)
          break
        default:
          break
      }
    }
    await sleep(1000)
    return randomTrait
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  const generateMetadata = async (base, background, eyes, mouth, head, clothing, back) => {
    const uploadResult = await upload()
    // console.log(`uploadResult => `, uploadResult)
    const verifiableUrl = await rAsset(uploadResult[1])
    // console.log(`verifiableUrl:`, verifiableUrl)
    //  console.log(_.keccak256(verifiableUrl))
    return [uploadResult[0], verifiableUrl]
  }

  const rAsset = async (cid) => {
    const assetBuffer = await fetch(`${cid}`, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }).then(async (response) => {
      return response.arrayBuffer().then((buffer) => new Uint8Array(buffer))
    })

    return assetBuffer
  }

  const upload = async () => {
    const htmlStr = document.querySelector(`.${styles['board']} svg`).outerHTML
    const blob = new Blob([htmlStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    try {
      const t = toast.loading(`Uploading`)
      const file = new File([blob], 'test.svg', { type: blob.type })
      const upload = await pinata.upload.file(file)
      // console.log(upload)
      toast.dismiss(t)
      return [upload.IpfsHash, url]
    } catch (error) {
      console.log(error)
    }
  }

  const generateOne = async () => {
    const background = await generate(`background`)
    const back = await generate(`back`)
    const base = await generate(`base`)
    const clothing = await generate(`clothing`)
    const eyes = await generate(`eyes`)
    const mouth = await generate(`mouth`)
    const head = await generate(`head`)

    // document.querySelector(`#result`).innerHTML = `Base: ${base} | Background: ${background}  | Eyes: ${eyes} |  Mouth: ${mouth}  | Head: ${head}  | Clothing: ${clothing}  | Back: ${back}`

    generateMetadata(base, background, eyes, mouth, head, clothing, back)
  }

  const getTotalSupply = async () => await contractReadonly.methods.totalSupply().call()
  const getMaxSupply = async () => await contractReadonly.methods.MAXSUPPLY().call()
  const getMintPrice = async () => await contractReadonly.methods.mintPrice().call()
  const getSwipePrice = async () => await contractReadonly.methods.swipePrice().call()
  const getWhitelist = async (addr) => await contractReadonly.methods.getWhitelist(addr).call()
  const getSwipePool = async (tokenId) => await contractReadonly.methods.swipePool(tokenId).call()

  const mint = async (e) => {
    e.target.disabled = true
    const web3 = new Web3(auth.provider)
    const contract = new web3.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)

    const createToast = toast.loading(`Just a moment while we create your awesome new PFP!`)

    const background = await generate(`background`)
    const back = await generate(`back`)
    const base = await generate(`base`)
    const clothing = await generate(`clothing`)
    const eyes = await generate(`eyes`)
    const mouth = await generate(`mouth`)
    const head = await generate(`head`)

    let attributes = []
    if (base.toUpperCase() !== `NONE`) attributes.push({ key: 'Base', value: base.toUpperCase() })
    if (background.toUpperCase() !== `NONE`) attributes.push({ key: 'Background', value: background.toUpperCase() })
    if (eyes.toUpperCase() !== `NONE`) attributes.push({ key: 'Eyes', value: eyes.toUpperCase() })
    if (mouth.toUpperCase() !== `NONE`) attributes.push({ key: 'Mouth', value: mouth.toUpperCase() })
    if (head.toUpperCase() !== `NONE`) attributes.push({ key: 'Head', value: head.toUpperCase() })
    if (clothing.toUpperCase() !== `NONE`) attributes.push({ key: 'Clothing', value: clothing.toUpperCase() })
    if (back.toUpperCase() !== `NONE`) attributes.push({ key: 'Back', value: back.toUpperCase() })

    // console.log(`Base: ${base} | Background: ${background}  | Eyes: ${eyes} |  Mouth: ${mouth}  | Head: ${head}  | Clothing: ${clothing}  | Back: ${back}`)
    generateMetadata(base, background, eyes, mouth, head, clothing, back).then((result) => {
      toast.dismiss(createToast)
      const t = toast.loading(`Waiting for transaction's confirmation`)

      const metadata = JSON.stringify({
        LSP4Metadata: {
          name: 'Dracos',
          description: `Forged in the molten heart of the Ember Rift, the Dracos are a legendary brood born from the mystical Feralyx Eggs. Each Dragon is infused with the raw power of fire, chaos and untamed greed. Hatched in the infernal chasms of the Rift, these dragons rise as supreme guardians of gold treasure and ancient magic.

Every dragon is an embodiment of power, adorned with unique traits and hoarded relics from civilizations long forgotten. As the eternal keepers of this realm, they are bound to the Ember Rift, where their glory, fury and insatiable hunger for treasure shape the fate of all who dare enter.

🔥 7,777 Dracos: Born from the Rift, Bound by Gold 🪙`,
          links: [
            { title: 'Mint', url: 'https://universaleverything.io/0x8A985fe01eA908F5697975332260553c454f8F77' },
            { title: '𝕏', url: 'https://x.com/DracosKodo' },
          ],
          attributes: attributes,
          icon: [
            {
              width: 512,
              height: 512,
              url: 'ipfs://bafybeiaziuramvgnceele5wetw5tt65bgp2z63faax7ihvrjd4wlvfsooq',
              verification: {
                method: 'keccak256(bytes)',
                data: '0xe99121bbedf99dcf763f1a216ca8cd5847bce15e6930df1e92913c56367f92d1',
              },
            },
          ],
          backgroundImage: [],
          assets: [],
          images: [
            [
              {
                width: 1000,
                height: 1000,
                url: `ipfs://${result[0]}`,
                verification: {
                  method: 'keccak256(bytes)',
                  data: _.keccak256(result[1]),
                },
              },
            ],
          ],
        },
      })

      try {
        contract.methods
          .handleMint(metadata)
          .send({
            from: auth.accounts[0],
            value: freeMintCount > 0 ? 0 : mintPrice,
          })
          .then((res) => {
            console.log(res)

            toast.success(`Done`)
            toast.dismiss(t)
            e.target.disabled = false

            showSwipe()

            getTotalSupply().then((res) => {
              console.log(res)
              setTotalSupply(_.toNumber(res))
            })

            getMaxSupply().then((res) => {
              console.log(res)
              setMaxSupply(_.toNumber(res))
            })
          })
          .catch((error) => {
            console.log(error)
            toast.dismiss(t)
          })
      } catch (error) {
        console.log(error)
        toast.dismiss(t)
      }
    })
  }

  const swipe = async (e, tokenId) => {
    const web3 = new Web3(auth.provider)
    const contract = new web3.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)

    const t = toast.loading(`Waiting for transaction's confirmation`)

    const background = await generate(`background`)
    const back = await generate(`back`)
    const base = await generate(`base`)
    const clothing = await generate(`clothing`)
    const eyes = await generate(`eyes`)
    const mouth = await generate(`mouth`)
    const head = await generate(`head`)

    let attributes = []
    if (base.toUpperCase() !== `NONE`) attributes.push({ key: 'Base', value: base.toUpperCase() })
    if (background.toUpperCase() !== `NONE`) attributes.push({ key: 'Background', value: background.toUpperCase() })
    if (eyes.toUpperCase() !== `NONE`) attributes.push({ key: 'Eyes', value: eyes.toUpperCase() })
    if (mouth.toUpperCase() !== `NONE`) attributes.push({ key: 'Mouth', value: mouth.toUpperCase() })
    if (head.toUpperCase() !== `NONE`) attributes.push({ key: 'Head', value: head.toUpperCase() })
    if (clothing.toUpperCase() !== `NONE`) attributes.push({ key: 'Clothing', value: clothing.toUpperCase() })
    if (back.toUpperCase() !== `NONE`) attributes.push({ key: 'Back', value: back.toUpperCase() })

    console.log(`Base: ${base} | Background: ${background}  | Eyes: ${eyes} |  Mouth: ${mouth}  | Head: ${head}  | Clothing: ${clothing}  | Back: ${back}`)
    generateMetadata(base, background, eyes, mouth, head, clothing, back).then((result) => {
      const metadata = JSON.stringify({
        LSP4Metadata: {
          name: 'Dracos',
          description: `Forged in the molten heart of the Ember Rift, the Dracos are a legendary brood born from the mystical Feralyx Eggs. Each Dragon is infused with the raw power of fire, chaos and untamed greed. Hatched in the infernal chasms of the Rift, these dragons rise as supreme guardians of gold treasure and ancient magic.

Every dragon is an embodiment of power, adorned with unique traits and hoarded relics from civilizations long forgotten. As the eternal keepers of this realm, they are bound to the Ember Rift, where their glory, fury and insatiable hunger for treasure shape the fate of all who dare enter.

🔥 7,777 Dracos: Born from the Rift, Bound by Gold 🪙`,
          links: [
            { title: 'Mint', url: 'https://universaleverything.io/0x8A985fe01eA908F5697975332260553c454f8F77' },
            { title: '𝕏', url: 'https://x.com/DracosKodo' },
          ],
          attributes: attributes,
          icon: [
            {
              width: 512,
              height: 512,
              url: 'ipfs://bafybeiaziuramvgnceele5wetw5tt65bgp2z63faax7ihvrjd4wlvfsooq',
              verification: {
                method: 'keccak256(bytes)',
                data: '0xe99121bbedf99dcf763f1a216ca8cd5847bce15e6930df1e92913c56367f92d1',
              },
            },
          ],
          backgroundImage: [],
          assets: [],
          images: [
            [
              {
                width: 1000,
                height: 1000,
                url: `ipfs://${result[0]}`,
                verification: {
                  method: 'keccak256(bytes)',
                  data: _.keccak256(result[1]),
                },
              },
            ],
          ],
        },
      })

      try {
        contract.methods
          .handleSwipe(tokenId, metadata)
          .send({
            from: auth.accounts[0],
            value: swipePrice,
          })
          .then((res) => {
            console.log(res)

            toast.success(`Done`)
            toast.dismiss(t)

            handleTokenDetail(tokenId)
            //  showSwipe()
          })
          .catch((error) => {
            console.log(error)
            toast.dismiss(t)
          })
      } catch (error) {
        console.log(error)
        toast.dismiss(t)
      }
    })
  }

  const fetchData = async (dataURL) => {
    let requestOptions = {
      method: 'GET',
      redirect: 'follow',
    }
    const response = await fetch(`${dataURL}`, requestOptions)
    if (!response.ok) throw new Response('Failed to get data', { status: 500 })
    return response.json()
  }

  const getDataForTokenId = async (tokenId) => await contractReadonly.methods.getDataForTokenId(`${tokenId}`, '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e').call()

  const showSwipe = async (e) => {
    setSwipeModal(true)
    const tokenIds = await contractReadonly.methods.tokenIdsOf(auth.accounts[0]).call()

    tokenIds.map((item) => {
      console.log(item)
      getDataForTokenId(item).then((data) => {
        data = _.hexToUtf8(data)
        //  console.log(data)
        data = data.search(`data:application/json;`) > -1 ? data.slice(data.search(`data:application/json;`), data.length) : `${import.meta.env.VITE_IPFS_GATEWAY}` + data.slice(data.search(`ipfs://`), data.length).replace(`ipfs://`, '')
        console.log(data)
        fetchData(data).then((dataContent) => {
          //          console.log(dataContent)
          dataContent.tokenId = item
          setToken((token) => token.concat(dataContent))
        })
      })
    })
  }

  const showWhitelistModal = async (e) => {
    let addr = prompt('Enter the profile address(0x0)', '')
    if (addr === null) return

    const t = toast.loading(`Reading`)
    getWhitelist(addr).then((count) => {
      toast.success(`${count} free mint!`, { icon: `🐲`, duration: 10000 })
      toast.dismiss(t)
    })
    // setWhitelist()
  }

  const showSwipeCheckerModal = async (e) => {
    let input = prompt('Enter the token number:', '')
    if (input === null) return
    let hex = _.numberToHex(input)
    // console.log(hex)
    let paddedHex = _.padLeft(hex, 64)
    //console.log(paddedHex)

    const t = toast.loading(`Reading`)
    getSwipePool(paddedHex).then((count) => {
      toast.success(`${3 - _.toNumber(count)} swipes left!`, { icon: `${3 - _.toNumber(count) < 1 ? '😨' : '🔃'}`, duration: 10000 })
      toast.dismiss(t)
    })
    // setWhitelist()
  }

  const handleTokenDetail = async (tokenId) => {
    setSwipeModal(false)
    setTokenDetailModal(true)

    // Read connect wallet profile
    if (auth.walletConnected) {
      handleSearchProfile(auth.accounts[0]).then((profile) => {
        // console.log(profile)
        setProfile(profile)
      })

      // Read how many swipes left
      getSwipePool(tokenId, auth.accounts[0]).then((res) => {
        // console.log(res)
        setSwipeCount(_.toNumber(res))
      })
    }

    getDataForTokenId(tokenId).then((data) => {
      data = _.hexToUtf8(data)
      data = data.search(`data:application/json;`) > -1 ? data.slice(data.search(`data:application/json;`), data.length) : `${import.meta.env.VITE_IPFS_GATEWAY}` + data.slice(data.search(`ipfs://`), data.length).replace(`ipfs://`, '')

      fetchData(data).then((dataContent) => {
        // console.log(dataContent)
        dataContent.tokenId = tokenId
        console.log(dataContent)
        setTokenDetail(dataContent)

        // add the image to canvas
        var can = document.getElementById('canvas')
        var ctx = can.getContext('2d')

        var img = new Image()
        img.onload = function () {
          ctx.drawImage(img, 0, 0, can.width, can.height)
        }
        img.crossOrigin = `anonymous`
        img.src = `${import.meta.env.VITE_IPFS_GATEWAY}${dataContent.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`
      })
    })
  }

  const handleSearchProfile = async (addr) => {
    var myHeaders = new Headers()
    myHeaders.append('Content-Type', `application/json`)
    myHeaders.append('Accept', `application/json`)

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        query: `query MyQuery {
  search_profiles(
    args: {search: "${addr}"}
    limit: 1
  ) {
    fullName
    id
    profileImages {
      src
    }
  }
}`,
      }),
    }
    const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_ENDPOINT}`, requestOptions)
    if (!response.ok) {
      throw new Response('Failed to ', { status: 500 })
    }
    const data = await response.json()
    setProfile(data)
    return data
  }

  const downloadCanvas = function (tokenId) {
    const link = document.createElement('a')
    link.download = `${tokenId}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
    link.remove()
  }

  useEffect(() => {
    console.clear()

    getTotalSupply().then((res) => {
      console.log(res)
      setTotalSupply(_.toNumber(res))
    })

    getMaxSupply().then((res) => {
      console.log(res)
      setMaxSupply(_.toNumber(res))
    })

    getMintPrice().then((amount) => {
      console.log(amount)
      setMintPrice(amount)
    })

    getSwipePrice().then((amount) => {
      console.log(amount)
      setSwipePrice(amount)
    })
  }, [])

  return (
    <>
      <div className={`${styles.page} __container`} data-width={`medium`}>
        <Toaster />

        {tokenDetailModal && (
          <div className={`${styles.tokenDetail}`}>
            <button
              className={`${styles.back} ms-depth-4`}
              onClick={() => {
                setSwipeModal(true)
                setTokenDetailModal(false)
              }}
            >
              ⬅️
            </button>
            <header>
              {profile && profile.data.search_profiles.length > 0 && (
                <ul className={`d-flex flex-row align-items-center justify-content-between w-100`}>
                  <li className={`d-flex flex-row grid--gap-050`}>
                    <div className={`d-flex flex-column`}>
                      <figure>
                        <img
                          src={`${profile.data.search_profiles[0].profileImages.length > 0 ? profile.data.search_profiles[0].profileImages[0].src : 'https://ipfs.io/ipfs/bafkreihdpxu5e77tfkekpq24wtu4pplhdw3ssdvuwatexs42hyxeh3enei'}`}
                          className={`rounded`}
                          style={{ width: `48px` }}
                          alt=""
                        />
                      </figure>
                    </div>
                    <div className={`d-flex flex-column`}>
                      <b>{3 - swipeCount} swipes left</b>
                      <b style={{fontSize:`10px`, opacity:.7}}>Your Dracos is waiting!</b>
                    </div>
                  </li>
                  <li>
                    <figure>
                      <img src={DracosEyes} alt="" />
                    </figure>
                  </li>
                </ul>
              )}
            </header>
            <main className={`${styles.main} d-f-c`}>
              <div className={`${styles.token} d-f-c flex-column ms-depth-8`}>
                {/* <embed type="image/svg+xml" src={`${import.meta.env.VITE_IPFS_GATEWAY}${tokenDetail.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`} />
                 */}
                {/* <img style={{ height: `260px` }} className={`${styles.PFP}`} src={`${import.meta.env.VITE_IPFS_GATEWAY}${tokenDetail.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`} /> */}
                <canvas ref={canvasRef} id={`canvas`} width="800" height="800"></canvas>
                {tokenDetail && (
                  <div className={`${styles.token__body} w-100`}>
                    <ul style={{ background: `var(--black)`, color: `#fff` }}>
                      <li>
                        <h3>#{_.toNumber(tokenDetail.tokenId)}</h3>
                      </li>
                      <li className={`d-flex align-items-center justify-content-between`}>
                        <span>Trait count</span> <b>{tokenDetail.LSP4Metadata.attributes.filter((item) => item.value !== `NONE`).length}</b>
                      </li>
                      {tokenDetail.LSP4Metadata.attributes.map((item, i) => (
                        <li key={i} className={`d-flex align-items-center justify-content-between`}>
                          <span>{item.key}</span> <b>{item.value}</b>
                        </li>
                      ))}
                    </ul>
                    <a href={`https://universal.page/collections/lukso/${import.meta.env.VITE_CONTRACT}/${_.toNumber(tokenDetail.tokenId)}`} target={`_blank`} className={`${styles['uppage']} d-f-c`}>
                      <img src={PpageLogo} />
                      <small>View on Universal Page</small>
                    </a>
                  </div>
                )}
              </div>
            </main>
            {tokenDetail && (
              <footer>
                <button className={`${styles['swipe']} d-f-c ms-depth-4`} title={`Swipe`} onClick={(e) => swipe(e, tokenDetail.tokenId)}>
                  <img alt={`S`} src={IconSwipe} />
                </button>

                <button
                  className={`${styles['like']} d-f-c ms-depth-4`}
                  onClick={() => {
                    setSwipeModal(true)
                    setTokenDetailModal(false)
                  }}
                >
                  <img alt={`L`} src={IconLike} />
                </button>

                <button className={`${styles['download']} d-f-c ms-depth-4`} title={`Download`} onClick={(e) => downloadCanvas(tokenDetail.tokenId)}>
                  <img alt={`D`} src={IconDownload} />
                </button>

                <button className={`${styles['view']} d-f-c ms-depth-4`} title={`View`} onClick={(e) => download(`${import.meta.env.VITE_IPFS_GATEWAY}${tokenDetail.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`)}>
                  <img alt={`V`} src={IconView} />
                </button>
              </footer>
            )}
          </div>
        )}

        {swipeModal && token && (
          <>
            <a href={`../`} className={`${styles.back} ms-depth-4`}>
              ⬅️
            </a>
            <main className={`${styles.main} d-f-c`}>
              <header className={`${styles.header} d-f-c`}>
                <figure className={`d-f-c flex-column`}>
                  <img alt={import.meta.env.VITE_NAME} src={`/logo.svg`} className={`rounded`} />
                  <figcaption className={`mt-10`}>
                    <svg width="69" height="28" viewBox="0 0 69 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0.488563 2.3253C0.562773 1.06373 0.303038 0.878205 1.63881 0.69268C3.56827 0.432947 5.01536 1.50899 6.49956 3.03029C17.3713 14.1247 4.01353 30.2653 0.970927 27.1856C-0.327745 25.8869 0.191724 8.07656 0.488563 2.3253ZM5.34931 4.92264C4.90405 4.29186 3.23433 2.13977 2.82617 3.92081C1.93565 8.03945 2.49223 19.4307 2.64065 24.1801C8.57743 23.4751 10.7295 12.492 5.34931 4.92264Z"
                        fill="black"
                      />
                      <path
                        d="M16.187 3.47555C13.8494 2.77055 14.1834 2.99319 14.1463 5.03396C14.1091 8.00235 14.1091 10.9707 14.1463 13.902C14.2205 14.6441 14.4431 16.3138 15.3707 16.5365C18.0794 17.1673 24.1275 5.77605 16.187 3.47555ZM12.1055 1.36057C13.367 -3.20333 30.7321 7.03762 17.3002 17.9094C20.4541 19.8759 21.6043 22.028 22.0125 25.3674C22.198 27.0001 21.493 27.9648 20.3428 26.7403C19.378 25.7014 20.8622 22.5846 17.0404 20.0985C16.521 19.7646 14.9255 18.7999 14.2947 19.2822C13.0331 20.3212 15.4449 26.8516 13.367 27.0743C11.8086 27.2227 12.2539 24.8851 12.1797 23.6606C11.92 16.9817 11.8457 2.3624 12.1055 1.36057Z"
                        fill="black"
                      />
                      <path
                        d="M30.2891 17.427C31.3651 17.0931 29.0646 4.5887 27.9886 4.5887C26.8754 4.5887 25.1315 14.6812 25.651 17.0188C26.5044 18.1691 29.1017 17.5754 30.2891 17.427ZM26.0962 3.36423C31.0312 -8.88039 35.0756 28.7069 31.6249 27.0743C31.0312 26.7774 31.2538 22.2877 30.252 19.9501C25.9107 19.2822 25.2428 19.3193 24.9089 23.1783C24.3894 29.115 23.2021 28.0019 23.2392 22.1022C23.2392 16.4994 23.9813 8.55892 26.0962 3.36423Z"
                        fill="black"
                      />
                      <path
                        d="M34.0262 10.3029C34.6198 7.55709 39.295 -0.977039 42.82 0.952416C45.1205 2.21398 33.2098 4.51449 35.8814 17.0188C37.4027 24.0688 40 23.0669 42.7829 25.4045C45.1205 27.3711 38.9982 28.5585 35.4732 21.3972C33.7293 17.8351 33.1727 14.1618 34.0262 10.3029Z"
                        fill="black"
                      />
                      <path
                        d="M52.4469 12.0468C51.2966 4.14344 47.549 -1.94177 44.7291 8.70734C40.5733 24.4027 53.7456 33.9758 52.4469 12.0468ZM42.1317 11.8613C44.3951 -3.16623 51.4822 -1.49651 53.8198 9.30102C57.7529 27.8164 40.7217 36.3876 42.1317 11.8613Z"
                        fill="black"
                      />
                      <path
                        d="M56.4596 3.69818C57.7583 1.76872 59.5764 0.321632 62.0254 0.618472C65.3648 1.02662 68.1848 4.55159 68.5558 6.55526C68.8156 7.92814 67.1458 9.00418 66.5522 6.92631C64.7711 0.8411 59.2054 2.17688 57.5357 5.62763C55.5691 9.74628 58.7972 11.416 61.7656 12.7518C66.0327 14.6812 71.6726 17.5754 67.2571 24.143C65.9585 26.0724 64.1403 27.5195 61.6914 27.2227C58.3891 26.8145 55.6433 23.4009 55.1609 21.3972C54.8641 20.0243 56.4596 18.503 57.2017 21.1375C60.2814 31.7124 73.2681 18.7257 62.5448 15.0523C56.9049 14.0504 52.7862 9.1526 56.4596 3.69818Z"
                        fill="black"
                      />
                    </svg>
                  </figcaption>
                </figure>
              </header>
              <div className={`grid grid--fill grid--gap-1 mt-20 w-100`} style={{ '--data-width': `190px` }}>
                {token
                  .sort((a, b) => _.toNumber(a.tokenId) - _.toNumber(b.tokenId))
                  .map((item, i) => {
                    return (
                      <div key={i} className={`${styles.token} d-f-c flex-column ms-depth-16`} onClick={(e) => handleTokenDetail(item.tokenId)}>
                        {/* <embed type="image/svg+xml" style={{ pointerEvents: ` none` }} src={`${import.meta.env.VITE_IPFS_GATEWAY}${item.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`} />
                         */}
                        <img className={`${styles.PFP}`} src={`${import.meta.env.VITE_IPFS_GATEWAY}${item.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`} />
                        {/* <object data={`https://ipfs.io/ipfs/bafybeifkvtmwqzjfpqjkd5jetjh7u7b6ixs36fwjvydne3s6sceduwn3g4`} type="image/svg+xml">
                          <img src={`${import.meta.env.VITE_IPFS_GATEWAY}${item.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`} />
                        </object> */}
                        <div className={`${styles.token__body} w-100`}>
                          <ul style={{ background: `var(--black)`, color: `#fff` }}>
                            <li>
                              <h3>#{_.toNumber(item.tokenId)}</h3>
                            </li>
                            <li>
                              Trait count: <b>{item.LSP4Metadata.attributes.filter((item) => item.value !== `NONE`).length}</b>
                            </li>
                            <li>
                              Base: <b>{item.LSP4Metadata.attributes[0].value}</b>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </main>
          </>
        )}

        {!swipeModal && !tokenDetailModal && (
          <>
            <header className={`${styles.header} d-f-c`}>
              <figure className={`d-f-c flex-column`}>
                <img alt={import.meta.env.VITE_NAME} src={`/logo.svg`} className={`rounded ms-depth-8`} />
                <figcaption className={`mt-10`}>
                  <svg width="69" height="28" viewBox="0 0 69 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0.488563 2.3253C0.562773 1.06373 0.303038 0.878205 1.63881 0.69268C3.56827 0.432947 5.01536 1.50899 6.49956 3.03029C17.3713 14.1247 4.01353 30.2653 0.970927 27.1856C-0.327745 25.8869 0.191724 8.07656 0.488563 2.3253ZM5.34931 4.92264C4.90405 4.29186 3.23433 2.13977 2.82617 3.92081C1.93565 8.03945 2.49223 19.4307 2.64065 24.1801C8.57743 23.4751 10.7295 12.492 5.34931 4.92264Z"
                      fill="black"
                    />
                    <path
                      d="M16.187 3.47555C13.8494 2.77055 14.1834 2.99319 14.1463 5.03396C14.1091 8.00235 14.1091 10.9707 14.1463 13.902C14.2205 14.6441 14.4431 16.3138 15.3707 16.5365C18.0794 17.1673 24.1275 5.77605 16.187 3.47555ZM12.1055 1.36057C13.367 -3.20333 30.7321 7.03762 17.3002 17.9094C20.4541 19.8759 21.6043 22.028 22.0125 25.3674C22.198 27.0001 21.493 27.9648 20.3428 26.7403C19.378 25.7014 20.8622 22.5846 17.0404 20.0985C16.521 19.7646 14.9255 18.7999 14.2947 19.2822C13.0331 20.3212 15.4449 26.8516 13.367 27.0743C11.8086 27.2227 12.2539 24.8851 12.1797 23.6606C11.92 16.9817 11.8457 2.3624 12.1055 1.36057Z"
                      fill="black"
                    />
                    <path
                      d="M30.2891 17.427C31.3651 17.0931 29.0646 4.5887 27.9886 4.5887C26.8754 4.5887 25.1315 14.6812 25.651 17.0188C26.5044 18.1691 29.1017 17.5754 30.2891 17.427ZM26.0962 3.36423C31.0312 -8.88039 35.0756 28.7069 31.6249 27.0743C31.0312 26.7774 31.2538 22.2877 30.252 19.9501C25.9107 19.2822 25.2428 19.3193 24.9089 23.1783C24.3894 29.115 23.2021 28.0019 23.2392 22.1022C23.2392 16.4994 23.9813 8.55892 26.0962 3.36423Z"
                      fill="black"
                    />
                    <path
                      d="M34.0262 10.3029C34.6198 7.55709 39.295 -0.977039 42.82 0.952416C45.1205 2.21398 33.2098 4.51449 35.8814 17.0188C37.4027 24.0688 40 23.0669 42.7829 25.4045C45.1205 27.3711 38.9982 28.5585 35.4732 21.3972C33.7293 17.8351 33.1727 14.1618 34.0262 10.3029Z"
                      fill="black"
                    />
                    <path
                      d="M52.4469 12.0468C51.2966 4.14344 47.549 -1.94177 44.7291 8.70734C40.5733 24.4027 53.7456 33.9758 52.4469 12.0468ZM42.1317 11.8613C44.3951 -3.16623 51.4822 -1.49651 53.8198 9.30102C57.7529 27.8164 40.7217 36.3876 42.1317 11.8613Z"
                      fill="black"
                    />
                    <path
                      d="M56.4596 3.69818C57.7583 1.76872 59.5764 0.321632 62.0254 0.618472C65.3648 1.02662 68.1848 4.55159 68.5558 6.55526C68.8156 7.92814 67.1458 9.00418 66.5522 6.92631C64.7711 0.8411 59.2054 2.17688 57.5357 5.62763C55.5691 9.74628 58.7972 11.416 61.7656 12.7518C66.0327 14.6812 71.6726 17.5754 67.2571 24.143C65.9585 26.0724 64.1403 27.5195 61.6914 27.2227C58.3891 26.8145 55.6433 23.4009 55.1609 21.3972C54.8641 20.0243 56.4596 18.503 57.2017 21.1375C60.2814 31.7124 73.2681 18.7257 62.5448 15.0523C56.9049 14.0504 52.7862 9.1526 56.4596 3.69818Z"
                      fill="black"
                    />
                  </svg>
                </figcaption>
              </figure>
            </header>

            <main className={`${styles.main} d-f-c`}>
              <ul className={`d-flex flex-row justify-content-between grid--gap-1`}>
                <li className={`d-flex flex-column`}>
                  <h4>Total supply</h4>
                  <b>
                    {maxSupply - totalSupply}/{maxSupply}
                  </b>
                </li>
                <li className={`d-flex flex-column`}>
                  <h4>Mint price</h4>
                  <b className={`d-f-c grid--gap-025`}>
                    <img alt={`⏣`} src={LYXbadge} style={{ width: `16px` }} />
                    {mintPrice && mintPrice > 0 && <span>{_.fromWei(mintPrice, `ether`)}</span>}
                  </b>
                </li>
                <li className={`d-flex flex-column`}>
                  <h4>Swipe price</h4>
                  <b className={`d-f-c grid--gap-025`}>
                    <img alt={`⏣`} src={LYXbadge} style={{ width: `16px` }} />
                    {swipePrice && swipePrice > 0 && <span>{_.fromWei(swipePrice, `ether`)}</span>}
                  </b>
                </li>
                <li className={`d-flex flex-column`}>
                  <h4>Status</h4>
                  <b style={{ color: `var(--teal)` }}>Open!</b>
                </li>
              </ul>
            </main>

            <footer className={`${styles.footer} grid grid--fit ms-motion-slideDownIn`} style={{ '--data-width': '200px' }}>
              <button onClick={(e) => mint(e)} disabled={!auth.walletConnected} className={`d-f-c animate__animated animate__bounceInUp animate__fast`}>
                Mint
                {auth.walletConnected && <Whitelist setFreeMintCount={setFreeMintCount} />}
              </button>
              <button onClick={(e) => showSwipe(e)} disabled={!auth.walletConnected} className={`d-f-c animate__animated animate__bounceInUp animate__fast`}>
                Swipe
              </button>
              <button onClick={(e) => showWhitelistModal(e)} className={`d-f-c animate__animated animate__bounceInUp animate__fast`}>Whitelist Checker</button>
              <button onClick={(e) => showSwipeCheckerModal(e)} className={`d-f-c animate__animated animate__bounceInUp animate__fast`}>Swipe Checker</button>
            </footer>
          </>
        )}

        <div className={`${styles['board']} d-f-c card`}>
          <svg ref={SVG} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <g ref={backgroundGroupRef} name={`backgroundGroup`} />
            <g ref={backGroupRef} name={`backGroup`} />
            <g ref={baseGroupRef} name={`baseGroup`} />
            <g ref={clothingGroupRef} name={`clothingGroup`} />
            <g ref={eyesGroupRef} name={`eyesGroup`} />
            <g ref={mouthGroupRef} name={`mouthGroup`} />
            <g ref={headGroupRef} name={`headGroup`} />
          </svg>
        </div>
      </div>
    </>
  )
}

const Whitelist = ({ setFreeMintCount }) => {
  const [status, setStatus] = useState(`loading`)
  const [count, setCount] = useState(0)
  const auth = useUpProvider()
  const web3 = new Web3(import.meta.env.VITE_LUKSO_PROVIDER)
  const contract = new web3.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)
  contract.methods
    .whitelist(auth.accounts[0])
    .call()
    .then((res) => {
      //console.log(`Whitelist => `, res)
      setCount(web3.utils.toNumber(res))
      setFreeMintCount(web3.utils.toNumber(res))
      setStatus(``)
    })

  if (status !== `loading`) {
    return (
      <div className={`${styles['freeMint']} ms-fontWeight-bold`}>
       {count}
      </div>
    )
  } else return <small>Loading ...</small>
}

const Reload = () => {
  return (
    <button className={`${styles.reload} ms-depth-4`} onClick={() => window.location.reload()}>
      🔄️
    </button>
  )
}

export default Home
