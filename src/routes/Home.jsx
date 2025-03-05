import { useState, useRef, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Metadata from '../assets/metadata.json'
import { useUpProvider } from '../contexts/UpProvider'
import { PinataSDK } from 'pinata'
import ABI from '../abi/Dracos.json'
import LYXbadge from './../assets/⏣.svg'
import DracosEyes from './../assets/dracos-eyes.png'
import Web3 from 'web3'
import styles from './Home.module.scss'

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
  const [swipeCount, setSwipeCount] = useState(0)
  const [tokenDetail, setTokenDetail] = useState()

  const [freeMintCount, setFreeMintCount] = useState(0)

  const auth =useUpProvider()

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
  const BASE_URL = `https://aratta.dev/dracos-nfts/` //`${GATEWAY}${CID}/` // `http://localhost/luxgenerator/src/assets/pepito-pfp/` //`http://localhost/luxgenerator/src/assets/pepito-pfp/` //`${GATEWAY}${CID}/` // Or

  const weightedRandom = (items) => {
    //console.log(items)
    const totalWeight = items.reduce((acc, item) => acc + item.weight, 0)
    const randomNum = Math.random() * totalWeight

    let weightSum = 0
    for (const item of items) {
      weightSum += item.weight
      if (randomNum <= weightSum) {
        console.log(item.name)
        return item.name
      }
    }
  }

  const download = (url) => {
    // const htmlStr = SVG.current.outerHTML
    // const blob = new Blob([htmlStr], { type: 'image/svg+xml' })
    // const url = URL.createObjectURL(blob)
const a = document.createElement('a')
    // a.setAttribute('download', `dracos-pfp-${name}.svg`)

    a.setAttribute('href', url)
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
   // URL.revokeObjectURL(url)
  }

  const generate = async (trait) => {
    const svgns = 'http://www.w3.org/2000/svg'

    // Clear the board
    // SVG.current.innerHTML = ''
    const randomTrait = weightedRandom(Metadata[`${trait}`])
    await fetch(`${BASE_URL}${trait}/${randomTrait}.png`, {mode: 'no-cors'})
      .then((response) => response.blob())
      .then((blob) => {
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
          image.addEventListener('load', () => console.log(`${trait} has been loaded`))

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
      })

    return randomTrait
  }

  const generateMetadata = async (base, background, eyes, mouth, head, clothing, back) => {
    const uploadResult = await upload()
    console.log(`uploadResult => `, uploadResult)
    const verifiableUrl = await rAsset(uploadResult[1])
    console.log(`verifiableUrl:`, verifiableUrl)
    console.log(_.keccak256(verifiableUrl))
    return [uploadResult[0], verifiableUrl]
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

  const rAsset = async (cid) => {
    const assetBuffer = await fetch(`${cid}`,  {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin':'*'
      }
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
      console.log(upload)
      toast.dismiss(t)
      return [upload.IpfsHash, url]
    } catch (error) {
      console.log(error)
    }
  }

  const getTotalSupply = async () => await contractReadonly.methods.totalSupply().call()
  const getMaxSupply = async () => await contractReadonly.methods.MAXSUPPLY().call()
  const getMintPrice = async () => await contractReadonly.methods.mintPrice().call()
  const getSwipePrice = async () => await contractReadonly.methods.swipePrice().call()
  const getSwipePool = async (tokenId, addr) => await contractReadonly.methods.swipePool(tokenId, addr).call()

  const mint = async (e) => {
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

    console.log(`Base: ${base} | Background: ${background}  | Eyes: ${eyes} |  Mouth: ${mouth}  | Head: ${head}  | Clothing: ${clothing}  | Back: ${back}`)
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
          attributes: [
            { key: 'Base', value: base.toUpperCase() },
            { key: 'Background', value: background.toUpperCase() },
            { key: 'Eyes', value: eyes.toUpperCase() },
            { key: 'Mouth', value: mouth.toUpperCase() },
            { key: 'Head', value: head.toUpperCase() },
            { key: 'Clothing', value: clothing.toUpperCase() },
            { key: 'Back', value: back.toUpperCase() },
          ],
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

            window.location.reload()

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
          attributes: [
            { key: 'Base', value: base.toUpperCase() },
            { key: 'Background', value: background.toUpperCase() },
            { key: 'Eyes', value: eyes.toUpperCase() },
            { key: 'Mouth', value: mouth.toUpperCase() },
            { key: 'Head', value: head.toUpperCase() },
            { key: 'Clothing', value: clothing.toUpperCase() },
            { key: 'Back', value: back.toUpperCase() },
          ],
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
        data = data.slice(data.search(`data:application/json;`), data.length)

        fetchData(data).then((dataContent) => {
          console.log(dataContent)
          dataContent.tokenId = item
          setToken((token) => token.concat(dataContent))
        })
      })
    })
  }

  const handleTokenDetail = async (tokenId) => {
    setSwipeModal(false)
    setTokenDetailModal(true)

    // Read connect wallet profile
    if (auth.walletConnected) {
      handleSearchProfile(auth.accounts[0]).then((profile) => {
        console.log(profile)
        setProfile(profile)
      })

      // Read how many swipes left
      getSwipePool(tokenId, auth.accounts[0]).then((res) => {
        console.log(res)
        setSwipeCount(_.toNumber(res))
      })
    }

    getDataForTokenId(tokenId).then((data) => {
      data = _.hexToUtf8(data)
      data = data.slice(data.search(`data:application/json;`), data.length)

      fetchData(data).then((dataContent) => {
        console.log(dataContent)
        dataContent.tokenId = tokenId
        console.log(dataContent)
        setTokenDetail(dataContent)
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
        <button className={`${styles.reload} ms-depth-4`} onClick={() => window.location.reload()}>
          🔄️
        </button>

        {tokenDetailModal && tokenDetail && (
          <div className={`${styles.tokenDetail}`}>
            <Back />
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
                      <small>Your Dracos is waiting!</small>
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
              <div className={`${styles.token} d-f-c flex-column border border--danger ms-depth-8`}>
                <embed type="image/svg+xml" src={`${import.meta.env.VITE_IPFS_GATEWAY}${tokenDetail.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`} />
                <div className={`${styles.token__body} w-100`}>
                  <ul style={{ background: `var(--black)`, color: `#fff` }}>
                    <li>
                      <h3># {tokenDetail.tokenId.slice(-4)}</h3>
                    </li>
                    <li>Trait count: {tokenDetail.LSP4Metadata.attributes.filter((item) => item.value !== `NONE`).length}</li>
                    <li>Base: {tokenDetail.LSP4Metadata.attributes[0].value}</li>
                  </ul>
                </div>
              </div>
            </main>
            <footer>
              <button title="Swipe" onClick={(e) => swipe(e, tokenDetail.tokenId)}>
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M11.4106 28.0814L18.9998 20.4922L26.589 28.0814L28.081 26.5894L20.4918 19.0002L28.081 11.411L26.589 9.91899L18.9998 17.5082L11.4106 9.91899L9.91863 11.411L17.5078 19.0002L9.91863 26.5894L11.4106 28.0814ZM19.0067 37.9732C16.3831 37.9732 13.9165 37.4753 11.6067 36.4796C9.29726 35.4838 7.28823 34.1325 5.57961 32.4257C3.87099 30.7188 2.51846 28.7115 1.52203 26.4039C0.525247 24.0965 0.0268555 21.6309 0.0268555 19.007C0.0268555 16.3835 0.52472 13.9168 1.52045 11.6071C2.51618 9.29763 3.86748 7.2886 5.57434 5.57998C7.28121 3.87136 9.28848 2.51883 11.5962 1.5224C13.9035 0.525613 16.3691 0.0272217 18.993 0.0272217C21.6165 0.0272217 24.0832 0.525088 26.393 1.52082C28.7024 2.51655 30.7114 3.86784 32.42 5.57471C34.1287 7.28157 35.4812 9.28884 36.4776 11.5965C37.4744 13.9038 37.9728 16.3695 37.9728 18.9933C37.9728 21.6169 37.4749 24.0835 36.4792 26.3933C35.4835 28.7028 34.1322 30.7118 32.4253 32.4204C30.7184 34.129 28.7112 35.4816 26.4035 36.478C24.0962 37.4748 21.6306 37.9732 19.0067 37.9732Z"
                    fill="#FFCB57"
                  />
                </svg>
              </button>

              <a href={`../`}>
                <svg width="39" height="35" viewBox="0 0 39 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19.4573 34.135L17.8599 32.692C14.4195 29.5488 11.5736 26.8583 9.32209 24.6206C7.07098 22.3825 5.29402 20.4087 3.99121 18.6994C2.6884 16.9901 1.77823 15.4434 1.26069 14.0595C0.743145 12.6758 0.484375 11.284 0.484375 9.88383C0.484375 7.20266 1.39525 4.95138 3.21701 3.12997C5.03842 1.30822 7.2897 0.397339 9.97086 0.397339C11.8249 0.397339 13.5641 0.871663 15.1884 1.82031C16.8127 2.76896 18.2357 4.14872 19.4573 5.95958C20.679 4.14872 22.102 2.76896 23.7263 1.82031C25.3506 0.871663 27.0898 0.397339 28.9438 0.397339C31.625 0.397339 33.8763 1.30822 35.6977 3.12997C37.5194 4.95138 38.4303 7.20266 38.4303 9.88383C38.4303 11.284 38.1716 12.6758 37.654 14.0595C37.1365 15.4434 36.2263 16.9901 34.9235 18.6994C33.6207 20.4087 31.8504 22.3825 29.6126 24.6206C27.3749 26.8583 24.5223 29.5488 21.0548 32.692L19.4573 34.135Z"
                    fill="#FE69B4"
                  />
                </svg>
              </a>

              {/* <a title="Download" href={`${import.meta.env.VITE_IPFS_GATEWAY}${tokenDetail.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`}>
                <svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10.1865 28.5H29.1865V25.5H10.1865V28.5ZM19.6865 22.3075L26.994 15L24.8865 12.8925L21.1865 16.531V7.5H18.1865V16.531L14.4865 12.8925L12.379 15L19.6865 22.3075ZM19.69 38C17.062 38 14.5919 37.5013 12.2795 36.504C9.96719 35.5067 7.95586 34.1532 6.24552 32.4435C4.53519 30.7338 3.18102 28.7233 2.18302 26.412C1.18536 24.1007 0.686523 21.6312 0.686523 19.0035C0.686523 16.3755 1.18519 13.9053 2.18252 11.593C3.17986 9.28067 4.53336 7.26933 6.24302 5.559C7.95269 3.84867 9.96319 2.4945 12.2745 1.4965C14.5859 0.498833 17.0554 0 19.683 0C22.311 0 24.7812 0.498666 27.0935 1.496C29.4059 2.49333 31.4172 3.84683 33.1275 5.5565C34.8379 7.26617 36.192 9.27667 37.19 11.588C38.1877 13.8993 38.6865 16.3688 38.6865 18.9965C38.6865 21.6245 38.1879 24.0947 37.1905 26.407C36.1932 28.7193 34.8397 30.7307 33.13 32.441C31.4204 34.1513 29.4099 35.5055 27.0985 36.5035C24.7872 37.5012 22.3177 38 19.69 38Z"
                    fill="#3A8BF0"
                  />
                </svg>
              </a> */}
            </footer>
          </div>
        )}

        {swipeModal && token && (
          <>
            <Back />
            <main className={`${styles.main} d-f-c`}>
              <div className={`w-100 h-100 grid grid--fill`} style={{ '--data-width': `180px` }}>
                {token.map((item, i) => {
                  return (
                    <div key={i} className={`${styles.token} d-f-c flex-column border border--danger ms-depth-8`} onClick={(e) => handleTokenDetail(item.tokenId)}>
                      <embed type="image/svg+xml" src={`${import.meta.env.VITE_IPFS_GATEWAY}${item.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`} />
                      <div className={`${styles.token__body} w-100`}>
                        <ul style={{ background: `var(--black)`, color: `#fff` }}>
                          <li>
                            <h3># {item.tokenId.slice(-4)}</h3>
                          </li>
                          <li>Trait count: {item.LSP4Metadata.attributes.filter((item) => item.value !== `NONE`).length}</li>
                          <li>Base: {item.LSP4Metadata.attributes[0].value}</li>
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
              <figure>
                <img alt={import.meta.env.VITE_NAME} src={`/logo.svg`} className={`rounded`} />
                <figcaption className={`d-f-c`}>
                  <svg width="75" height="46" viewBox="0 0 75 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1.48855 11.3252C1.56276 10.0637 1.30302 9.87815 2.6388 9.69262C4.56825 9.43289 6.01534 10.5089 7.49954 12.0302C18.3713 23.1246 5.01351 39.2652 1.97091 36.1855C0.672238 34.8869 1.19171 17.0765 1.48855 11.3252ZM6.34929 13.9226C5.90403 13.2918 4.23431 11.1397 3.82616 12.9207C2.93564 17.0394 3.49221 28.4306 3.64063 33.18C9.57742 32.475 11.7295 21.492 6.34929 13.9226ZM17.187 12.4755C14.8494 11.7705 15.1833 11.9931 15.1462 14.0339C15.1091 17.0023 15.1091 19.9707 15.1462 22.902C15.2204 23.6441 15.4431 25.3138 16.3707 25.5364C19.0794 26.1672 25.1275 14.776 17.187 12.4755ZM13.1055 10.3605C14.367 5.79661 31.7321 16.0376 18.3002 26.9093C21.4541 28.8759 22.6043 31.0279 23.0125 34.3674C23.198 36 22.493 36.9647 21.3428 35.7403C20.378 34.7013 21.8622 31.5845 18.0404 29.0985C17.5209 28.7645 15.9254 27.7998 15.2947 28.2822C14.0331 29.3211 16.4449 35.8516 14.367 36.0742C12.8086 36.2226 13.2539 33.885 13.1797 32.6606C12.9199 25.9817 12.8457 11.3623 13.1055 10.3605ZM31.2891 26.4269C32.3651 26.093 30.0646 13.5886 28.9886 13.5886C27.8754 13.5886 26.1315 23.6812 26.651 26.0188C27.5044 27.169 30.1017 26.5754 31.2891 26.4269ZM27.0962 12.3642C32.0312 0.119555 36.0756 37.7068 32.6249 36.0742C32.0312 35.7774 32.2538 31.2877 31.252 28.9501C26.9107 28.2822 26.2428 28.3193 25.9089 32.1782C25.3894 38.115 24.202 37.0018 24.2391 31.1022C24.2391 25.4993 24.9812 17.5589 27.0962 12.3642ZM35.0261 19.3028C35.6198 16.557 40.295 8.0229 43.82 9.95236C46.1205 11.2139 34.2098 13.5144 36.8814 26.0188C38.4027 33.0687 41 32.0669 43.7829 34.4045C46.1205 36.371 39.9982 37.5584 36.4732 30.3972C34.7293 26.8351 34.1727 23.1617 35.0261 19.3028ZM53.4469 21.0467C52.2966 13.1434 48.549 7.05817 45.7291 17.7073C41.5733 33.4027 54.7455 42.9757 53.4469 21.0467ZM43.1317 20.8612C45.3951 5.83371 52.4821 7.50343 54.8198 18.301C58.7529 36.8163 41.7217 45.3875 43.1317 20.8612ZM57.4596 12.6981C58.7583 10.7687 60.5764 9.32157 63.0253 9.61841C66.3648 10.0266 69.1848 13.5515 69.5558 15.5552C69.8155 16.9281 68.1458 18.0041 67.5521 15.9262C65.7711 9.84104 60.2054 11.1768 58.5356 14.6276C56.5691 18.7462 59.7972 20.4159 62.7656 21.7517C67.0327 23.6812 72.6726 26.5754 68.2571 33.1429C66.9585 35.0724 65.1403 36.5195 62.6914 36.2226C59.3891 35.8145 56.6433 32.4008 56.1609 30.3972C55.8641 29.0243 57.4596 27.503 58.2017 30.1374C61.2814 40.7123 74.2681 27.7256 63.5448 24.0522C57.9049 23.0504 53.7862 18.1525 57.4596 12.6981Z"
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
                    <img alt={`⏣`} src={LYXbadge} />
                    {mintPrice && mintPrice > 0 && <span>{_.fromWei(mintPrice, `ether`)}</span>}
                  </b>
                </li>
                <li className={`d-flex flex-column`}>
                  <h4>Swipe price</h4>
                  <b className={`d-f-c grid--gap-025`}>
                    <img alt={`⏣`} src={LYXbadge} />
                    {swipePrice && swipePrice > 0 && <span>{_.fromWei(swipePrice, `ether`)}</span>}
                  </b>
                </li>
                <li className={`d-flex flex-column`}>
                  <h4>Status</h4>
                  <b style={{ color: `var(--teal)` }}>Open!</b>
                </li>
              </ul>

              {auth.walletConnected && <Whitelist setFreeMintCount={setFreeMintCount} />}
            </main>

            <footer className={`${styles.footer} grid grid--fit ms-motion-slideDownIn`} style={{ '--data-width': '200px' }}>
              <button onClick={(e) => mint(e)} disabled={!auth.walletConnected}>
                Mint
              </button>
              <button onClick={(e) => showSwipe(e)} disabled={!auth.walletConnected}>
                Swipe
              </button>
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
      console.log(`Whitelist => `, res)
      setCount(web3.utils.toNumber(res))
      setFreeMintCount(web3.utils.toNumber(res))
      setStatus(``)
    })

  if (status !== `loading`) {
    return <small className={`badge badge-success mt-10 ms-fontWeight-bold`}>You have {count} free mints remaining!</small>
  } else return <>Loading data...</>
}

const Back = () => {
  return (
    <a href={`../`} className={`${styles.back} ms-depth-4`}>
      ⬅️
    </a>
  )
}

export default Home
