import React from 'react'
import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'


const DoctorDashboard = () => {

  const {dToken, dashData, setDashData, getDashData, completeAppointment, cancelAppointment} = useContext(DoctorContext)
  const {currency, slotDateFormat} = useContext(AppContext)


  useEffect(() => {
          if(dToken) {
            getDashData()
          } 
  },[dToken])


  return dashData && (
    <div className='m-5 mx-11'>

      <div className='flex flex-wrap gap-10'>

            <div className='flex items-center gap-4 bg-white p-5 min-w-52 rounded border-2 border-gray-100  hover:scale-105 transition-all'>
                  <img className='w-14' src={assets.earning_icon} alt="" />
              <div>
                <p className='text-xl font-semibold text-gray-600'>{currency}{dashData.earnings}</p>
                <p className='text-gray-400'>Earnings</p>
              </div>
       </div>
      
       <div className='flex items-center gap-4 bg-white p-5 min-w-52 rounded border-2 border-gray-100  hover:scale-105 transition-all'>
                  <img className='w-12' src={assets.appointment_icon} alt="" />
              <div>
                <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
                <p className='text-gray-400'>Appointments</p>
              </div>
       </div>
     
      
               </div>

        <div className='bg-white'>

                 <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t '>
                   <img src={assets.list_icon} alt="" />
                   <p className='font-semibold'>Latest Bookings</p> 
                 </div>
       
                 <div className='pt-4 border-b border-gray-300 border-t-0'></div>
               {
                 dashData.latestAppointments.map((item,index) => (
                     <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
                   
                           <img src={item.userData.image} alt="" className='rounded-full w-10'/>
                           <div className='flex-1 text-sm'>
                             <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                             <p className='text-gray-600'>{slotDateFormat(item.slotDate)}</p>
                           </div>
                            {    
                                              item.cancelled 
                                              ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                                              : item.isCompleted
                                              ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                                              :  <div className='flex'>
                                              <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer ' src={assets.cancel_icon} alt="" />
                                              <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                                             </div>  
                                             }
                     </div>
                 ))
               }
       
                </div>           
           
    </div>
  )
}

export default DoctorDashboard