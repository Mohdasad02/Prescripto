import React from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext.jsx'
import { useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext.jsx'

const Dashboard = () => {

  const {aToken, getDashData, appointmentCancel, dashboardData} = useContext(AdminContext)
  const {slotDateFormat} = useContext(AppContext) 
  
  useEffect(() => {
      if(aToken) {
        getDashData()     
      }                                  
  },[aToken])


  return dashboardData &&  (
    <div className='m-5 mx-11'>

      <div className='flex flex-wrap gap-10'>

      <div className='flex items-center gap-4 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition-all'>
            <img className='w-14' src={assets.doctor_icon} alt="" />
        <div>
          <p className='text-xl font-semibold text-gray-600'>{dashboardData.doctors}</p>
          <p className='text-gray-400'>Doctors</p>
        </div>
 </div>

 <div className='flex items-center gap-4 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition-all'>
            <img className='w-12' src={assets.appointment_icon} alt="" />
        <div>
          <p className='text-xl font-semibold text-gray-600'>{dashboardData.appointments}</p>
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
          dashboardData.latestAppointments.map((item,index) => (
              <div className='flex items-center px-4 py-3 gap-3 hover:bg-gray-100' key={index}>
            
                    <img src={item.docData.image} alt="" className='rounded-full w-10'/>
                    <div className='flex-1 text-sm'>
                      <p className='text-gray-800 font-medium'>{item.docData.name}</p>
                      <p className='text-gray-600'>{slotDateFormat(item.slotDate)}</p>
                    </div>
                    {item.cancelled
                              ? 
                              <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                              : item.isCompleted 
                              ? <p className='text-green-500 text-xs font-medium'>Completed</p> 
                              : <p className='text-xs font-medium'>Not yet completed</p>
                            }
              </div>
          ))
        }

         </div>


    </div>
  )
}

export default Dashboard