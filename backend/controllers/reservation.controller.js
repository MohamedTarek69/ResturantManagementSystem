require('dotenv').config({ path: '../.env' });
const jwt = require('jsonwebtoken');
const db = require("../models/db");
const userRoles = require('../utils/userRoles');
const Reservation = db.reservation;
const User = db.user;
const Timeslot = db.timeslot;
const tableTimeslot = db.TableTimeslot;
const Table = db.table;
const Restaurant = db.restaurant;
const asyncWrapper = require('../middlewares/asyncWrapper');
const appError = require('../utils/appError');
const successResponse = require('../utils/successResponse');
const mongoose = require('mongoose');
const userRole = require('../utils/userRoles');
const nodemailer = require('nodemailer');



exports.makeReservation = asyncWrapper(async (req, res, next) => {
    const table_timeslotId = req.params.table_timeslotid;
    const restaurantid = req.params.restaurant_id;

    // Check if the restaurant exists
    const existingRestaurant = await Restaurant.findById(restaurantid);
    if (!existingRestaurant) {
        return next(appError.create("Restaurant not found", 404));
    }
    const restaurantName = existingRestaurant.name;

    // Check if the timeslot exists
    const existingtable_timeslot = await tableTimeslot.findById(table_timeslotId);
    if (!existingtable_timeslot) {
        return next(appError.create("Timeslot not found", 404));
    }
    else if (existingtable_timeslot.isAvailable === false) {
        return next(appError.create("The table is not available", 404));
    }

    // Check for the authorization token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(appError.create('Please Login First', 401));    
    }

    // Decode the token to get customer information
    const decodedToken = jwt.verify(token, process.env.JWT_SCREET);
    const customerid = decodedToken.id;
    const customerEmail = decodedToken.email;

    // Check if the customer exists
    const existingcustomer = await User.findById(customerid);
    if (!existingcustomer) {
        return next(appError.create("Customer not found", 404));
    }

    const customerPhone = existingcustomer.phoneNumber;
    const customerName = existingcustomer.Name;

    // Get the current date and time for the reservation
    const currentDate = new Date();  // Current Date and Time
    const reservationDate = new Date(req.body.reservationTime);  // Expected reservation time (this should be passed in the request body)

    // Log for debugging
    console.log("Current Time (currentDate): ", currentDate);
    console.log("Reservation Time (reservationDate): ", reservationDate);

    // Check if the reservation time is in the future (after current time)
    if (reservationDate <= currentDate) {
        console.log("Reservation Time is in the Past or Same as Current Time");
        return next(appError.create("Cannot reserve before the specified time", 400));
    }

    // Continue with the existing validation for timeslots and table availability
    const tables = await Table.findById(existingtable_timeslot.table);
    if (!tables) {
        return next(appError.create("Table not found for the provided ID", 404));
    }
    const tableNumber = tables.tableNumber;
    console.log("Timeslot ID:", existingtable_timeslot.timeslot);

    const timeslotId = existingtable_timeslot.timeslot;
    const timeslotIdObject = new mongoose.Types.ObjectId(timeslotId);
    
    // Find the parent Timeslot document
    const parentTimeslot = await Timeslot.findOne({ "timeslots._id": timeslotIdObject });
    if (!parentTimeslot) {
        console.log("Parent Timeslot not found for ID:", timeslotId);
        return next(appError.create("Not Found: Timeslot not found for the provided ID", 404));
    }
    
    // Find the specific timeslot within the timeslots array
    const timeslotEntry = parentTimeslot.timeslots.find(slot => slot._id.equals(timeslotIdObject));
    if (!timeslotEntry) {
        console.log("Specific Timeslot not found for ID:", timeslotId);
        return next(appError.create("Not Found: Timeslot not found for the provided ID", 404));
    }
    
    const timeslot = timeslotEntry.time;
    console.log("time slot:", timeslot);
    
    console.log("tableNumber:", tableNumber);
    
    const isAvailable = await tableTimeslot.updateOne(
        { _id: table_timeslotId },
        { $set: { isAvailable: false } } // Use `false` as a boolean, not a string
    );
    console.log("Availability updated:", isAvailable);
    
    // Create a new reservation
    const newReservation = new Reservation({
        tableNumber: tableNumber,
        timeslot: timeslot,
        reservationDate: currentDate,
        reservationTime: currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }), // Format to "3:30 PM"
        customerName: customerName, // Ensure this is correctly assigned
        customerEmail: customerEmail,
        customerPhone: customerPhone, // Ensure this is correctly assigned
        status: "pending", // Use lowercase to match the enum
        customerId: customerid, //
        tableTimeslotId : table_timeslotId,
        restaurantName : restaurantName, 
        restaurantId : restaurantid,
    });

    // Save the reservation
    await newReservation.save();
    return res.status(201).json({
        message: "Reservation added successfully",
        data: newReservation
    });
});






exports.getallreservations = asyncWrapper(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(appError.create('Please Login First', 401));
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SCREET);
    } catch (error) {
        return next(appError.create('Invalid token', 401));
    }

    const role = decodedToken.role;
    const id = decodedToken._id;

    if (role === "admin") {
        const allReservations = await Reservation.find({});
        if (allReservations.length === 0) {
            return next(appError.create("No reservations found", 404));
        }
        return res.status(200).json({ message: "All reservations retrieved successfully", reservations: allReservations });
    } else if (role === "vendor") {
        console.log("Decoded Token:", decodedToken);

        const id = decodedToken._id || decodedToken.id;
        if (!id) {
            return next(appError.create("Invalid token: Vendor ID not found", 401));
        }

        console.log("Vendor ID:", id);

        const vendorAllRestaurants = await Restaurant.find({ vendor_id: id });
        console.log("Restaurants found for vendor:", vendorAllRestaurants);

        if (!vendorAllRestaurants || vendorAllRestaurants.length === 0) {
            return next(appError.create("Not Found: No restaurants found. Please register a restaurant.", 404));
        }

        const restaurantIds = vendorAllRestaurants.map(restaurant => restaurant._id);
        console.log("Restaurants found for restaurant:", restaurantIds);

        const allReservations = await Reservation.find({ restaurantId: { $in: restaurantIds } });
        console.log("Reservations Found:", allReservations);

        if (!allReservations || allReservations.length === 0) {
            return next(appError.create("No reservations found for your restaurants", 404));
        }

        return res.status(200).json({ message: "Reservations retrieved successfully", reservations: allReservations });
    } else if (role === "customer") {
        const customerReservations = await Reservation.find({ customerid: id });
        if (customerReservations.length === 0) {
            return next(appError.create("No reservations found for you", 404));
        }
        return res.status(200).json({ message: "Reservations retrieved successfully", reservations: customerReservations });
    } else {
        return next(appError.create("Unauthorized role", 403));
    }
});


exports.confirmReservation = asyncWrapper(async (req, res, next) => {
    const reservationId = req.params.id;
    const reservations = await Reservation.findById(reservationId);

    if (!reservations) {
        return next(appError.create("Reservation not found", 404));
    }

    // Check if the email has already been sent
    if (reservations.confirmationEmailSent) {
        return res.status(200).json({ message: "Reservation already confirmed and email sent", reservations });
    }

    // Update the reservation status
    reservations.status = "confirmed";

    // Create the transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ahmedsamy1ami@gmail.com',
            pass: 'ednp nqss ocyo iivq', // Use an app-specific password here
        },
        tls: {
            rejectUnauthorized: false, // Only use this for development; not recommended for production
        },
    });

    // Verify the transporter
    transporter.verify((error, success) => {
        if (error) {
            console.error("Error verifying transporter:", error);
            return next(appError.create("Failed to send confirmation email", 500));
        } else {
            console.log("Transporter is ready to send emails.");
        }
    });

    const mailOptions = {
        from: 'ahmedsamy1ami@gmail.com',
        to: 'ahmedsamy1ami@gmail.com',
        subject: `Reservation Confirmation - ${reservations.restaurantName}`,
        text: `Dear ${reservations.customerName},\n\nYour reservation at ${reservations.restaurantName} has been confirmed. Here are the details:\n\n
               - Date: ${new Date(reservations.reservationDate).toLocaleDateString()}\n
               - Time: ${reservations.timeslot}\n
               - Table Number: ${reservations.tableNumber}\n\n
               We look forward to seeing you!\n\nBest regards,\n${reservations.restaurantName}`,
    };

    try {
        // Send the confirmation email
        await transporter.sendMail(mailOptions);

        // Update confirmationEmailSent to true and save the reservation
        reservations.confirmationEmailSent = true;
        await reservations.save();

        return res.status(200).json({ message: "Reservation confirmed and email sent", reservations });
    } catch (error) {
        console.error("Error sending email:", error.message);
        return next(appError.create("Failed to send confirmation email", 500));
    }
});


exports.cancelreservation = asyncWrapper(async (req, res, next) => {
    const reservationid = req.params.id;
    const reservations = await Reservation.findById(reservationid);
    if (!reservations) {
        return next(appError.create("Reservation not found", 404));
    }
    if(reservations.status === "confirmed"){
        return next(appError.create("Cannot cancel confirmed reservation", 400));
    }
    const table_timeslot = await tableTimeslot.findById(reservations.tableTimeslotId);
    if (!table_timeslot) {
        return next(appError.create("Table timeslot not found", 404));
    }
    reservations.status = "cancelled";
    await reservations.save();
    table_timeslot.isAvailable = true;
    await table_timeslot.save();
    return res.status(200).json({message: "Reservation cancelled successfully", reservations});
});

exports.sendbill = asyncWrapper(async (req, res, next) => {
    const reservationId = req.params.id;
    const bill = 500;

    const Reservations = await Reservation.findById(reservationId);
    if (!Reservations) {
        return next(appError.create("Reservation not found", 404));
    }

    if (!Reservations.confirmationEmailSent) {
        return next(appError.create("Reservation is not confirmed", 400));
    }

    if (Reservations.billSent) {
        return next(appError.create("Bill has already been sent for this reservation", 400));
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'ahmedsamy1ami@gmail.com',
            pass: 'ednp nqss ocyo iivq',
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    transporter.verify((error) => {
        if (error) {
            console.error("Error verifying transporter:", error);
            return next(appError.create("Failed to send confirmation email", 500));
        }
    });

    const mailOptions = {
        from: 'ahmedsamy1ami@gmail.com',
        to: 'ahmedsamy1ami@gmail.com',
        subject: 'Your Bill',
        text: `Dear ${Reservations.customerName},\n\n
Here are the details of your reservation:\n
- Restaurant: ${Reservations.restaurantsName}\n
- Date: ${new Date(Reservations.reservationDate).toLocaleDateString()}\n
- Time: ${Reservations.reservationTime}\n
- Table Number: ${Reservations.tableNumber}\n\n
Your bill amount is (Minimum charge): $${bill}\n\n
Thank you for dining with us!\n\nBest regards,\nYour Restaurant: ${Reservations.restaurantsName} Team`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            return next(appError.create("Failed to send confirmation email", 500));
        } else {
            console.log("Email sent:", info);
            Reservations.billSent = true;
            await Reservations.save();

            const existingTableTimeslot = await tableTimeslot.findById(Reservations.tableTimeslotId);
            if (!existingTableTimeslot) {
                return next(appError.create("Table timeslot not found for the provided ID", 404));
            }
            existingTableTimeslot.isAvailable = true;
            await existingTableTimeslot.save();

            res.status(200).json({
                message: "Bill sent successfully",
                data: Reservations,
            });
        }
    });
});

