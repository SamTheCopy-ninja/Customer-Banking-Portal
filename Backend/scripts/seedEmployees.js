require('dotenv').config();
const mongoose = require('mongoose');
const Staff = require('../models/staff');

// Script used to create valid employees who can log in to validate payments
const employees = [
  {
    employeeId: 'EMP000001',
    fullName: 'Admin User',
    email: 'admin@bankapp.test',
    password: 'Admin@123456',
    role: 'admin'
  },
  {
    employeeId: 'EMP000002',
    fullName: 'Payment Verifier 1',
    email: 'verifier1@bankapp.test',
    password: 'Verifier@123',
    role: 'verifier'
  }
];

const seedEmployees = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Delete existing employees, if needed
    await Staff.deleteMany({});
    console.log('Cleared existing employee records');

    // Insert new employees
    for (const employee of employees) {
      const newEmployee = new Staff(employee);
      await newEmployee.save();
      console.log(`Created employee: ${employee.employeeId} - ${employee.fullName}`);
    }

    console.log('Employee seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding employees:', error);
    process.exit(1);
  }
};

seedEmployees();