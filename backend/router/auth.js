const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

require('../db/conn');
const User = require("../model/userSchema");

router.get('/', (req, res) => {
    res.send(`Hello world from router.js`)
});

//using promises
// router.post('/register', (req, res) => {

//     const {name, email, phone, work, password, cpassword} = req.body;
//     if(!name || !email || !phone || !work || !password || !cpassword)
//     {
//         return res.status(422).json({error: "Please fill all fields"});
//     }

//     User.findOne({email:email})
//     .then((userExist) => {
//         if(userExist) {
//             return res.status(422).json({error: "User already exist"});
//         }
//         const user = new User({name, email, phone, work, password, cpassword});

//         user.save().then(()=>{
//             res.status(201).json({ message: "User registered successfully"})
//         }).catch((err) => res.status(500).json({ error: "Failed to register"}))

//     }).catch(err => { console.log(err); });
// });


//using async-await
router.post('/register', async (req, res) => {

    const { name, email, phone, work, password, cpassword } = req.body;
    if (!name || !email || !phone || !work || !password || !cpassword) {
        return res.status(422).json({ error: "Please fill all fields" });
    }

    try {

        const userExist = await User.findOne({ email: email })

        if (userExist) {
            return res.status(422).json({ error: "User already exist" });
        }
        else if (password != cpassword) {
            return res.status(422).json({ error: "Password not match" });
        }
        else {
            const user = new User({ name, email, phone, work, password, cpassword });

            //calling middleware to hash the password before saving to database

            await user.save();

            res.status(201).json({ message: "User registered successfully" })
        }

    } catch (err) {
        console.log(err);
    }

})

router.post('/signin', async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Please fill all fields" });
        }

        const userLogin = await User.findOne({ email: email })
        // userLogin will contain all data of user

        

        if (userLogin) {

            const isMatch = await bcrypt.compare(password, userLogin.password);
            
            const token = await userLogin.generateAuthToken();

            //storing token in cookie
            res.cookie("jwtoken",token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            });
            
            if(isMatch){
                return res.status(422).json({ error: "User logged in" });
            }
            else{
                return res.status(400).json({ error: "Invalid credentials" });
            }
            
        }
        else {
            return res.status(400).json({ error: "User not exist" });
        }

    }
    catch (err) {
        console.log(err);
    }
})


//about us page

router.get("/about", authenticate, async (req, res) => {
    
        res.send(req.rootUser);
        
    
})

//get user data for contact us and home page
router.get('/getData', authenticate, async (req,res) => {
    res.send(req.rootUser);
});


//contct us page
router.post('/contact', authenticate, async (req, res) => {
   try {
    const {name, email, phone, message} = req.body;

    if(!name || !email || !phone || !message) {
       console.log("Error in contact form");
       return res.json({error: "Please, fill the contact form"});
    }

    const userContact = await User.findOne({_id: req.userID});

    if(userContact) {
        const userMessage = await userContact.addMessage(name, email, phone, message);

        await userContact.save();

        res.status(201).json({message: "User sent contact info successfully"});
        
    }

   } catch (err) {
     console.log(err);
   }
});

//logout page
router.get('/logout', (req, res) => {
    console.log("Hello, Logout it is!");
    res.clearCookie('jwtoken', {path:'/'});
    res.status(200).send("User logout");
})

module.exports = router;