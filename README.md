# 🍽️ Real-time Restaurant Reservation System

## 📘 Overview
The **Real-time Restaurant Reservation System** is a web-based platform that allows customers to book tables in restaurants in real-time, while enabling vendors (restaurant owners) to manage their restaurants, reservations, and offers efficiently.  
Admins can manage vendors, restaurants, and overall system data.

---

## 🧩 System Modules

### 👨‍💼 Admin Module
**Admin can:**
- Add, view, and delete vendors.
- View all restaurants and reservations across the platform.

---

### 🏢 Vendor Module
**Vendors can:**
- Add, update, and delete restaurant details:
  - Name, description, image, food category, tables, seats per table, time slots, and sales points.
- Create and manage offers, notify customers.
- Cancel reservations and inform customers.
- View customer reviews and FAQs, and optionally respond.
- Track reservations **in real time**.

---

### 👥 Customer Module
**Customers can:**
- View restaurants by:
  - Name, menu, food category, city, ratings.
- Manage reservations:
  - Make, update, or cancel a reservation.
  - Order food when booking.
  - Add special requests.
  - Leave restaurant reviews.
- See **real-time table availability** before booking.

---

## ⚙️ Non-Functional Requirements
| Requirement | Description |
|--------------|-------------|
| **Performance** | Must handle real-time updates for table reservations efficiently. |
| **Security** | Secure storage for customer and reservation data; encrypted communication. |
| **Usability** | Simple, intuitive interface for both vendors and customers. |
| **Reliability** | System should perform consistently and correctly under normal conditions. |

---

## 🛠️ Tech Stack

- **Backend:** Node.js  
- **Database:** MongoDB  
- **Real-Time Updates:** WebSockets  

---

## 🚀 Features Summary
- Real-time tracking for restaurant tables and reservations.  
- Multi-role access (Admin, Vendor, Customer).  
- Dynamic management of restaurants, offers, and bookings.  
- User feedback and review system.  

---

