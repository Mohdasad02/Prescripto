import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'


const DoctorList = () => {

   const {doctors,aToken,getAllDoctors,changeAvailability} = useContext(AdminContext)      

   useEffect(() => {
    if(aToken) {
      getAllDoctors()
    }  
},[aToken])

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
        
        <h1 className='text-lg font-medium'>All Doctors</h1>
        <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
           { 
              doctors.map((item,index)=>(
              <div key={index} className='border border-[#C9D8FF] rounded-xl max-w-56 overflow-hidden cursor-pointer group' >
                 <img className='bg-[#EAEFFF] group-hover:bg-[#5f5fff] transition-all duration-500' src={item.image} alt="" />
                 <div className='p-4'>
                   <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
                   <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
                   
                 </div>
              </div>
              ))
           }
        </div>

    </div>       
  )
}

export default DoctorList