import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import cloudinary from "../utils/cloudinary.js";

export const signup = async (req, res) => {
    const { email, fullName, password } = req.body;
    try {

        if (!email || !fullName || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        });


        if (newUser) {
            // Genrate token
            generateToken(newUser._id, res);
            await newUser.save();
            // Exclude password and accessToken from the response
            return res.status(201).json({
                message: "User created successfully",
                newUser: {
                    _id: newUser._id,
                    email: newUser.email,
                    fullName: newUser.fullName,
                    profilePic: newUser.profilePic,
                }
            });

        } else {
            return res.status(500).json({ message: "Error creating user" });
        }

    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Generate token
        generateToken(user._id, res);
        // Exclude password and accessToken from the response
        return res.status(200).json({
            message: "Login successful",
            user
        });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", "", { maxAge: 0 });
        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ message: "Internal server error" });

    }
}


export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;
        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture is required" });
        }
        // Find user by ID
        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );
        // Check if user was found and updated
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // Exclude password and accessToken from the response
        return res.status(200).json({
            message: "Profile updated successfully",
            updatedUser
        });
    } catch (error) {
        console.error("Error during profile update:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ✅ FIXED: auth.controller.js
export const checkAuthStatus = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error("Error checking auth status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password -accessToken");
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
