import { useEffect, useState, Suspense, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import ABI from './../abi/Dracos.json'
import Web3 from 'web3'
import styles from './Admin.module.scss'

const web3 = new Web3(window.lukso)
const contract = new web3.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)
const _ = web3.utils

function Admin() {
  const [isLoading, setIsLoading] = useState(false)
  const [emoji, setEmoji] = useState([])


  const updatePrice = async (e) => {
    e.preventDefault()

    setIsLoading(true)

    const t = toast.loading(`Waiting for transaction's confirmation`)

    const formData = new FormData(e.target)
    const price = formData.get('price')
    
    try {
      window.lukso.request({ method: 'eth_requestAccounts' }).then((accounts) => {
        contract.methods
          .updateMintPrice(_.toWei(price, `ether`))
          .send({
            from: accounts[0],
          })
          .then((res) => {
            console.log(res) //res.events.tokenId

            setIsLoading(true)

            toast.success(`Done`)

            toast.dismiss(t)
          })
          .catch((error) => {
            toast.dismiss(t)
          })
      })
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }

 const updateWhitelist = async (e) => {
    e.preventDefault()

    setIsLoading(true)

    const t = toast.loading(`Waiting for transaction's confirmation`)

    const formData = new FormData(e.target)
    const addr = formData.get('address')
    const count = formData.get('count')
    
    try {
      window.lukso.request({ method: 'eth_requestAccounts' }).then((accounts) => {
        contract.methods
          .updateWhitelist(addr, count)
          .send({
            from: accounts[0],
          })
          .then((res) => {
            console.log(res) //res.events.tokenId

            setIsLoading(true)

            toast.success(`Done`)

            toast.dismiss(t)
          })
          .catch((error) => {
            toast.dismiss(t)
          })
      })
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }
  const handleTransfer = async (e) => {
    const t = toast.loading(`Waiting for transaction's confirmation`)
    e.target.innerText = `Waiting...`
    if (typeof window.lukso === 'undefined') window.open('https://chromewebstore.google.com/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn?hl=en-US&utm_source=candyzap.com', '_blank')

    try {
      window.lukso
        .request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          const account = accounts[0]
          console.log(account)
          // walletID.innerHTML = `Wallet connected: ${account}`;

          web3.eth.defaultAccount = account
          contract.methods
            .transferOwnership(document.querySelector(`#newOwner`).value)
            .send({
              from: account,
            })
            .then((res) => {
              console.log(res) //res.events.tokenId

              // Run partyjs
              party.confetti(document.querySelector(`.__container`), {
                count: party.variation.range(20, 40),
                shapes: ['egg', 'coin'],
              })

              toast.success(`Done`)

              e.target.innerText = `Transfer`
              toast.dismiss(t)
            })
            .catch((error) => {
              e.target.innerText = `Transfer`
              toast.dismiss(t)
            })
          // Stop loader when connected
          //connectButton.classList.remove("loadingButton");
        })
        .catch((error) => {
          e.target.innerText = `Transfer`
          // Handle error
          console.log(error, error.code)
          toast.dismiss(t)
          // Stop loader if error occured

          // 4001 - The request was rejected by the user
          // -32602 - The parameters were invalid
          // -32603- Internal error
        })
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
      e.target.innerText = `Transfer`
    }
  }

  const handleForm = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target)
    const phone = formData.get('phone')
    const password = formData.get('password')
    const errors = {}

    // validate the fields
    if (phone.length < 11) {
      errors.phone = 'err'
      toast(errors.phone, 'error')
    }

    if (typeof password !== 'string' || password.length < 4) {
      errors.password = 'err'
      toast(errors.password, 'error')
    }
    // // return data if we have errors
    // if (Object.keys(errors).length) {
    //   return errors
    // }

    const post = {
      phone: phone,
      password: password,
    }

    try {
      const res = await signUp(post)
      console.log(res)
      if (res.result) {
        localStorage.setItem('token', JSON.stringify(res.token))
        toast(`signed in successfuly`, `success`)
        router.push('/user/dashboard')
      } else {
        toast(`${res.message}`, `error`)
        setIsLoading(false)
      }
    } catch (error) {
      console.log(error)
      setIsLoading(false)
    }
    return null
  }
  const getWhitelist = async (addr) => await contract.methods.getWhitelist(addr).call()
  useEffect(() => {
 
  }, [])

  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>
      <Toaster />
      <div className={`__container`} data-width={`xlarge`}>
      <div className={`grid grid--fit grid--gap-1 w-100`} style={{ '--data-width': `400px` }}>
      
            <div className="card">
              <div className="card__header d-flex align-items-center justify-content-between">
                Update Mint Price
              </div>
              <div className="card__body">
                {/* {errors?.email && <span>{errors.email}</span>} */}
                <form onSubmit={(e) => updatePrice(e)} className={`form d-flex flex-column`} style={{ rowGap: '1rem' }}>
                  <div>
                    <input type="text" name="price" placeholder="Price" defaultValue={0.015} required />
                  </div>
                  <button className="mt-20 btn" type="submit">
                    {isLoading ? 'Please wait...' : 'Update'}
                  </button>
                </form>
              </div>
            </div>

            <div className={`card mt-10`}>
            <div className={`card__header`}>Transfer ownership</div>
            <div className={`card__body form`}>
              <div>
                <input className="input" type="text" id="newOwner" />
              </div>

              <button className="mt-10 btn" onClick={(e) => handleTransfer(e)}>
                Transfer
              </button>
            </div>
          </div>

            <div className="card">
              <div className="card__header d-flex align-items-center justify-content-between">
                Update Whitelist
              </div>
              <div className="card__body">
                {/* {errors?.email && <span>{errors.email}</span>} */}
                <form onSubmit={(e) => updateWhitelist(e)} className={`form d-flex flex-column`} style={{ rowGap: '1rem' }}>
                  
                <div>
                    <input type="text" name="address" placeholder="0x0" required />
                  </div>


                  <div>
                    <input type="number" name="count" placeholder="0" required />
                  </div>

                  <button className="mt-20 btn" type="submit">
                    {isLoading ? 'Please wait...' : 'Update'}
                  </button>
                </form>
              </div>
            </div>
        
        </div>
      </div>
    </div>
  )
}

export default Admin
