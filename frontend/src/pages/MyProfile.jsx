import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyProfile = () => {

 const {userData,setUserData,backendUrl,loadUserProfileData,token} = useContext(AppContext)

 const [isEdit,setIsEdit] = useState(false);
 const [image,setImage]  = useState(false)

 const updateUserProfileData = async() => {
    
    try {
      const formData = new FormData() //converting data from state variable to form

      formData.append('name',userData.name)
      formData.append('phone',userData.phone)
      formData.append('address',userData.address)
      formData.append('gender',userData.gender)
      formData.append('dob',userData.dob)

      image && formData.append('image',image) 

      const {data} = await axios.post(backendUrl + '/api/user/update-profile',formData,{headers:{token}})
      
      if(data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      }
      else {
        toast.error(data.message)
      }

    } catch(error) {
           console.log(error);
           toast.error(error.message)
    }
  

 }

  return userData &&  (
    <div className='max-w-lg flex flex-col gap-2 text-sm pt-5'>

   {
    isEdit
    ? <label htmlFor="image">
        <div className='inline-block relative cursor-pointer'>
          <img className='w-36 rounded opacity-75' src={image ? URL.createObjectURL(image) : userData.image} alt="" />   
          <img className='w-10 absolute bottom-12 right-12' src={image ? '' : assets.upload_icon} alt="" />
          </div>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden/>
    </label>
    : <img className='w-36 rounded' src={userData.image} alt="" />
   }

     

      {
        isEdit 
        ? <input type="text" value={userData.name} onChange={e => setUserData(prev => ({...prev,name:e.target.value}))} /> 
        : <p className='font-medium text-3xl text-[#262626] mt-4'>{userData.name}</p>
      }

      <hr className='bg-[#ADADAD] h-[1px] border-none'/>

      <div>
        <p className='text-gray-600 underline mt-3'>CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]'>
          <p className='font-medium'>Email id :</p>
          <p className='text-blue-500'>{userData.email}</p>
          <p className='font-medium'>Phone : </p>
           
          {
            isEdit 
            ? <input className='bg-gray-50 max-w-52' type="text" value={userData.phone} onChange={e => setUserData(prev => ({...prev,phone:e.target.value}))} /> 
            : <p className='text-blue-500'>{userData.phone}</p>
          }

          <p className='font-medium'>Address : </p>

          {
            isEdit 
            ? <input className='bg-gray-50 max-w-52' type="text" value={userData.address} onChange={e => setUserData(prev => ({...prev,address:e.target.value}))} /> 
            : <p className='text-gray-500'>{userData.address}</p>
          }

        </div>
      </div>

      <div>
        <p className='text-[#797979] underline mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600'>
          <p className='font-medium'>GENDER :</p> 
          {
            isEdit 
            ?  <select className='max-w-20 bg-gray-50' onChange={(e) => setUserData(prev => ({...prev,gender:e.target.value}))} value={userData.gender}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            : <p className='text-gray-500'>{userData.gender}</p>
          }
           <p className='font-medium'>Birth Date :</p>
           {
            isEdit
            ? <input className='max-w-28 bg-gray-50' type="date" onChange={(e) => setUserData(prev => ({...prev,dob:e.target.value}))} value={userData.dob} />
            : <p className='text-gray-500'>{userData.dob}</p>
           }
  </div>
      </div>

      <div className='mt-10'>
        {
          isEdit
          ? <button className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all' onClick={updateUserProfileData}>Save Information</button>
          : <button className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all' onClick={(e) => setIsEdit('true')}>Edit</button>
        }
      </div>


    </div>
  )
}

export default MyProfile