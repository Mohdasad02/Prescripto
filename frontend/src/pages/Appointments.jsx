import React, { useContext, useEffect, useState } from 'react'

import { AppContext } from '../context/AppContext.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import RelatedDoctors from '../Components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointments = () => {

  const {docId} = useParams();
  const navigate = useNavigate()
  // console.log(docId) 
  const daysOfWeek = ['SUN','MON','TUE','WED','THU','FRI','SAT']
  const {doctors,currencySymbol,backendUrl,token,getDoctorData} = useContext(AppContext);
 
  const [docInfo,setDocInfo] = useState(""); 
  const [docSlots,setdocSlots] = useState([]);
  const [slotIndex,setSlotIndex] = useState(0);
  const [slotTime,setSlotTime] = useState('');

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
    // console.log(docInfo);
  }

  const getAvailableSlots = async () => {
    setdocSlots([])
    //current time
    let today = new Date()
    for(let i = 0;i<7;i++) {
      //get date with index
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate()+i)
      //end time of date with index
      let endTime = new Date()
      endTime.setDate(today.getDate()+i)
      endTime.setHours(21,0,0,0)
      //setting hours
      if (today.getDate() === currentDate.getDate()) {
           currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours()+1 : 10)
           currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0) 
      }  
      else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while(currentDate < endTime) {
        let  formattedTime = currentDate.toLocaleTimeString([],{hour : '2-digit',minute : '2-digit'})

        //add slot to array
        timeSlots.push({
          dateTime : new Date(currentDate),
          time : formattedTime
        })
        currentDate.setMinutes(currentDate.getMinutes()+30)
      }

      setdocSlots(prev => ([...prev,timeSlots]))
      
    }
  } 

  const bookAppointment = async() => {
    if(!token) {
       toast.warn('Login to book appointment')
       return navigate('/login')
    }

    try {
          const date = docSlots[slotIndex][0].dateTime //at 0 index we have date time & at 1 we have only time
          let day = date.getDate()
          let month = date.getMonth()+1 //start from 0 add 1 now 1->jan
          let year = date.getFullYear()

          const slotDate = day + "_" + month + "_" + year

          const {data} = await axios.post(backendUrl + '/api/user/book-appointment', {docId,slotDate,slotTime}, {headers : {token}})

          if(data.success) {
            toast.success(data.message)  
            getDoctorData()
            navigate('/my-appointments')
          }
          else {
            toast.error(data.message)
          }
    } 
    catch(error) {
       console.log(error);
       toast.error(error.message)
       
    }


  }

  useEffect(() => {
      getAvailableSlots()
  },[docInfo])

  useEffect(() => {
     fetchDocInfo()
  },[doctors,docId])

  useEffect(() => {
    console.log(docSlots)
  },[docSlots])

  return docInfo && (
    <div >

      <div className='flex flex-col sm:flex-row gap-4'>

        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7'>
           {/* .....  Doc Info  .... */}
           <p>{docInfo.name}</p> 
           <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
           </div>

  <div>
    <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon} alt="" /></p>
    <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
  </div>

  <p className='text-gray-500 font-medium mt-4'>Appointment fee : <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span></p>

        </div> 
         
     </div>

      {/* ... Booking Slots ... */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item,index) => (
              <div onClick={() => setSlotIndex(index)} key={index} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`}>
                <p>{item[0] && daysOfWeek[item[0].dateTime.getDay()]}</p>
                <p>{item[0] && item[0].dateTime.getDate()}</p>
              </div>
            ))
          }

        </div>

   <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
    {docSlots.length && docSlots[slotIndex].map((item,index) => (
      <p onClick={() => setSlotTime(item.time)} key={index} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`}>
        {item.time.toLowerCase()}
      </p>
    ))}
   </div>

   <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'>Book an Appointment</button>

   </div>

   <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

    </div>
  )
}

export default Appointments