import { generateToken } from "../../lib/utils.js";
import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6 || password.length > 14) {
      return res.status(400).json({
        message: "Password length must be between 6 to 14 characters",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(409)
        .json({ message: "Email already exists. Please try a different one." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultProfilePic = `https://avatar.iran.liara.run/public?username=${
      fullName.split(" ")[0]
    }`;

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      profilePic: req.body.profilePic || defaultProfilePic,
    });

    await newUser.save();

    const token = generateToken(newUser._id); // Generate token string

    // Optionally set token as HTTP-only cookie
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    res.status(201).json({
      token, // Return the token string here
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      },
    });
  } catch (err) {
    console.error("Error in signup controller:", err.message);
    res.status(500).json({ message: "Internal Server Error during signup." });
  }
};

export default signup;