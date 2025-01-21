const { User } = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { generateJWT } = require('../utils/authenticateJWT'); // Assuming you have a function to generate JWT
const {  generateResetToken, calculateResetTokenExpiration } = require('../utils/encryption');
const { validatePassword, validateEmail } = require('../utils/validation');

// Transporter configuration for Gmail
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, // Replace with your Gmail
        pass: process.env.EMAIL_PASS, // Replace with your Gmail password or app password
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
});

transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email Server is functional");
    }
  });

// 1. **Signup Controller**
exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password ) {
            return res.status(400).json({ error: 'Please provide all required fields.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        if(!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address.' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
        });

        // Save user
        await newUser.save();

        // Generate JWT token
        const token = generateJWT(newUser._id);

        res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 2. **Sign-in Controller**
exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found.' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address.' });
        }

        // Validate password
        if(!validatePassword){
            return res.status(400).json({ error: 'Invalid characters or length password.' });
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if(!validPassword){
            return res.status(400).json({ error: 'Invalid password.' });
        }

        // Generate JWT token
        const token = generateJWT(user._id);

        res.status(200).json({ message: 'Signin successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 3. **Password Reset Email Controller**
exports.sendResetEmail = async (req, res) => {

    const { email } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        
        // Create a unique reset token
        const resetToken = generateResetToken();
        const resetTokenExpiration = calculateResetTokenExpiration(); // 1 hour expiration

        // Save token and expiration to user (make sure the schema allows these fields)
        user.resetToken = resetToken;
        user.resetTokenExpiration = resetTokenExpiration;
        await user.save();

        // Generate reset link
        const resetLink = `https://localhost:3000/api/auth/reset-password/${resetToken}`;

        // Email options
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset',
            text: `Click the link to reset your password: ${resetLink}`,
        };

        // Send email with reset link
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to send email.' });
            }
            res.status(200).json({ message: 'Password reset link sent to email.' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 4. **verify reset link**
exports.verifyResetToken = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }

        res.status(200).json({ message: 'Token is valid.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
};

//reset password controller
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }

};