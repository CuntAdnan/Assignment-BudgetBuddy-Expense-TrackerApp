const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const { User } = require("../models/userModel.js");

router.get("/", async (req, res) => {
  res.send("Hello from users!");
});

// Post a new user
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    const oldUser = await User.findOne({ username });
    if (oldUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const defaultExpenseCategories = [
      "Textbooks and Supplies",
      "Rent",
      "Groceries",
      "Transportation",
      "Eating Out",
    ];

    const defaultIncomeCategories = [
      "Part-Time Job",
      "Scholarship",
      "Pocket money",
      "Internship Stipend",
    ];

    const newUser = new User({
      username,
      password: hashedPassword,
      expenseCategories: defaultExpenseCategories,
      incomeCategories: defaultIncomeCategories,
    });

    await newUser.save();

    res.status(201).json({
      message: "New user added",
      userId: newUser._id,
      username: newUser.username,
    });
  } catch (error) {
    console.log("error adding new user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Checking if username exists and validating password
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const validUser = await User.findOne({ username });
    if (!validUser) {
      return res.status(401).json({ message: "Username does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, validUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    return res.status(200).json({
      message: "Username and password are correct",
      userId: validUser._id,
      username: validUser.username,
    });
  } catch (error) {
    console.log("error checking username/password", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a user
router.delete("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update username
router.patch("/:userId/username", async (req, res) => {
  const userId = req.params.userId;
  const { newUsername } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { username: newUsername },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Username updated successfully" });
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update password
router.patch("/:userId/password", async (req, res) => {
  const userId = req.params.userId;
  const { newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
