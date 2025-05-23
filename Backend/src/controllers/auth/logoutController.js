
const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 }); // Clear the jwt cookie
    res.status(200).json({ message: "Logout successful" }); // Consistent 'message' key
  } catch (err) {
    console.error("Error in logout controller:", err.message); // Use console.error
    res.status(500).json({ message: "Internal Server Error during logout." }); // Consistent 500 for server errors
  }
};

export default logout;
