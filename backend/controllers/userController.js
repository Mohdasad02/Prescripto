import validator from 'validator' 
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'

//api to register user
const registerUser = async (req,res) => {
  try {
       const {name,email,password} = req.body
       if(!name || !email || !password) {
        return res.json({success:false,message:"Missing details"})
       }
       if(!validator.isEmail(email)) {
         return res.json({success:false,message:"Enter valid email"})
       }
       if(password.length < 8) {
        return res.json({success:false,message:"Enter strong password"})
       }

   //password hashing
   const salt = await bcrypt.genSalt(10)
   const hashedPassword = await bcrypt.hash(password,salt)

   const userData = {
     name,
     email,
     password : hashedPassword
   }

   const newUser = new userModel(userData)
   const user = await newUser.save() //now user get saved in db with an id & using that id we r creating a token
   
   const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
   res.json({success:true , token})                            

  }
  catch(error) {
    console.log(error);
    res.json({success:false,message:error.message})
  }
}

//api for user login
const loginUser = async (req,res) => {
  try {
     const {email,password} = req.body
     const user = await userModel.findOne({email})

     if(!user) {
       return res.json({success:false,message:"User does not exist"})
     }
     
    const isMatch = await bcrypt.compare(password,user.password)
    if(isMatch) {
      const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
      res.json({success:true,token})
    }
    else {
      res.json({success:false,message:"Invalid credentials"})
    }

  } catch(error) {
    console.log(error);
    res.json({success:false,message:error.message})
  }
} 

//api to get user profile data
const getProfile = async (req,res) => {

   try {

      const {userId} = req.body   //userId we got from token
      const userData = await userModel.findById(userId).select('-password')
      res.json({success:true,userData}) 

   } catch(error) {
    console.log(error);
    res.json({success:false,message:error.message})
   }

} 

//api to update userprofile
const updateProfile = async(req,res) => {
  try {
       
    const {userId,name,phone,address,dob,gender} = req.body //userId come from token
    const imageFile = req.file
    
    if(!name || !phone || !dob || !gender) {
       return res.json({success:false,message:"Data missing"})
    }

    await userModel.findByIdAndUpdate(userId, {name,phone,address,dob,gender})
    
    if(imageFile) {
       //upload image to cloudinary
       const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'}) 
       const imageURL = imageUpload.secure_url

       await userModel.findByIdAndUpdate(userId,{image:imageURL})
    }
         res.json({success:true,message:"Profile updated"})
  } 
  catch(error) {
    console.log(error);
    res.json({success:false,message:error.message})
  }
}

//api to book appointment
const bookAppointment = async (req,res) => {
   try {
        const {userId,docId,slotDate,slotTime} = req.body
        const docData = await doctorModel.findById(docId).select('-password')
        if(!docData.available) {
          return res.json({success : false, message : 'Doctor not available'})
        }

        let slots_booked = docData.slots_booked
        //checking slots availability
        if(slots_booked[slotDate]) {
          if(slots_booked[slotDate].includes(slotTime)) {
            return res.json({success:false,message : 'Slot not available'})
          }
          else {
            slots_booked[slotDate].push(slotTime)
          }
        } //in this if we r talking about specific date & below else is for any date  
         else {
          slots_booked[slotDate] = []
          slots_booked[slotDate].push(slotTime)
        }

        //slot booked is pushed inside docModel

        const userData = await userModel.findById(userId).select('-password')
        delete docData.slots_booked //in appointmodel we r sending docData but we did not want to send slot booked bcz it is like unnecessary data as appointment model itself contain slot date and slot time

        const appointmentData = {    
          userId,
          docId,
          userData,
          docData,
          amount : docData.fees,
          slotTime,
          slotDate,
          date : Date.now()       
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        //save new slots data in doctors data as till this line we have not pushed slot date and time in docData
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success : true, message : 'Appointment booked'})
      
   } 
   catch(error) {
    console.log(error);
    res.json({success:false,message:error.message})      
   }
}

//api to get user appointments for my-appointment page
const listAppointment = async (req,res) => {
   try {

       const {userId} = req.body
       const appointments = await appointmentModel.find({userId})
       res.json({success:true, appointments}) 
   } 
   catch(error) {
    console.log(error);
    res.json({success:false,message:error.message})
   }
}

//api to cancel appointment
const cancelAppointment = async(req,res) => {
   
   try {    
         
      const {userId, appointmentId} = req.body
      const appointmentData = await appointmentModel.findById(appointmentId)

      //verify appointment user
      if(appointmentData.userId !== userId) {
        return res.json({success:false, message : "Unauthorized action"})
      }

      await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled : true})

      //releasing doctor slot - removing doc slot time and date from doc db
      const {docId, slotDate, slotTime} = appointmentData
      const doctorData = await doctorModel.findById(docId)

      let slots_booked = doctorData.slots_booked
      slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

      await doctorModel.findByIdAndUpdate(docId, {slots_booked})
      res.json({success:true, message : "Appointment cancelled"})

   } 
   catch(error) {
    console.log(error);
    res.json({success:false,message:error.message})
   }

}

const razorpayInstance = new razorpay({
   key_id:process.env.RAZORPAY_KEY_ID,
   key_secret:process.env.RAZORPAY-KEY-SECRET
})

//api to make payment using razor
const paymentRazorpay = async(req,res) => {

  try {

    const {appointmentId} = req.body
   const appointmentData = await appointmentModel.findById(appointmentId)
   
   if(!appointmentData || appointmentData.cancelled) {
    return res.json({success:false, message:"Appointment cancelled or not found"})
   }

   const options = {
    amount : appointmentData.amount*100,
    currency : process.env.CURRENCY,
    reciept : appointmentId,
   }

    //creation of an order
    const order = await razorpayInstance.orders.create(options)
    res.json({success:true, order})

     
  }
  catch(error) {
    console.log(error);
    res.json({success:false,message:error.message})
  }
}

//api to verify payment of rzp
const verifyRazorpay = async(req,res) => {

   try {

     const {razorpay_order_id} = req.body
     const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

     if(orderInfo.status === 'paid') {
       await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment : true})
       res.json({success:true,message: "Payment Successful"})
     } 
     else {
      res.json({success:false,message: "Payment failed"})
     }

   } catch(error) {
    console.log(error);
    res.json({success:false,message:error.message})
   }


}


export {registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointment,cancelAppointment,paymentRazorpay, verifyRazorpay}
