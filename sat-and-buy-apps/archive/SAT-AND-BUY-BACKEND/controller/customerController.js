const Customer = require("../models/Customer");
const { signInToken } = require("../config/auth");
const { CLIENT_ROLE } = require("../constants/roles");

const addAllCustomers = async (req, res) => {
  try {
    await Customer.deleteMany();
    await Customer.insertMany(req.body);
    res.send({
      message: "Added all users successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const users = await Customer.find({}).sort({ _id: -1 });
    res.send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    res.send(customer);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const addShippingAddress = async (req, res) => {
  try {
    const customerId = req.params.id;
    const newShippingAddress = req.body;

    const result = await Customer.updateOne(
      { _id: customerId },
      {
        $set: {
          shippingAddress: newShippingAddress,
        },
      },
      { upsert: true }
    );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      return res.send({
        message: "Shipping address added or updated successfully.",
      });
    } else {
      return res.status(404).send({ message: "Customer not found." });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getShippingAddress = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    res.send({ shippingAddress: customer?.shippingAddress });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateShippingAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const customer = await Customer.findById(userId);

    if (!customer) {
      return res.status(404).send({ message: "Customer not found." });
    }

    customer.shippingAddress = req.body;
    await customer.save();

    res.send({ message: "Shipping address updated successfully." });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const deleteShippingAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Customer.updateOne(
      { _id: userId },
      { $unset: { shippingAddress: "" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({ message: "Customer not found." });
    }

    res.send({ message: "Shipping address deleted successfully." });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { name, email, address, phone, image } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send({
        message: "Customer not found!",
      });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (
      existingCustomer &&
      existingCustomer._id.toString() !== customer._id.toString()
    ) {
      return res.status(400).send({
        message: "Email already exists.",
      });
    }

    customer.name = name;
    customer.email = email;
    customer.address = address;
    customer.phone = phone;
    customer.image = image;
    customer.role = CLIENT_ROLE;

    const updatedUser = await customer.save();
    const token = signInToken(updatedUser);

    res.send({
      token,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address,
      phone: updatedUser.phone,
      image: updatedUser.image,
      role: updatedUser.role || CLIENT_ROLE,
      message: "Customer updated successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const deleteCustomer = (req, res) => {
  Customer.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: "User Deleted Successfully!",
      });
    }
  });
};

module.exports = {
  addAllCustomers,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addShippingAddress,
  getShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
};
