# 🍽️ Real-Time Restaurant Reservation System (Backend)

> A backend service built with **Node.js** and **Express.js** that enables real-time management of restaurant reservations.  
> Customers can seamlessly book tables, vendors can manage their restaurants, and admins can oversee operations — all in real time.

---

## 🚀 Tech Stack

| Category | Technologies |
|-----------|--------------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Documentation** | Swagger |
| **Testing Tool** | Postman |
| **Language** | JavaScript (ES6) |

---

## 🧩 System Architecture

### 👑 Admin Module
- Manage vendors (add, view, delete).  
- Access all restaurants and reservations.  

### 🏢 Vendor Module
- Add, update, and remove restaurant details (name, category, time slots, tables, offers).  
- Monitor real-time reservations.  
- Cancel bookings and send notifications to customers.  
- Manage promotional offers and FAQs.  

### 👥 Customer Module
- Browse restaurants by **name**, **food category**, **city**, **rating**, or **proximity**.  
- Create, update, or cancel reservations.  
- View real-time table availability.  
- Submit reviews and feedback.  

---

## ⚙️ Core Features

✅ Real-time reservation updates using WebSockets.  
✅ Role-based access control (Admin, Vendor, Customer).  
✅ Scalable API architecture.  
✅ Error handling and validation middleware.  
✅ API documentation with Swagger UI.  

---

## 🔒 Non-Functional Requirements

| Aspect | Description |
|--------|-------------|
| **Performance** | Optimized to handle real-time reservations efficiently. |
| **Security** | Secure data storage and encrypted communication. |
| **Usability** | Clean and intuitive REST API design. |
| **Reliability** | Consistent performance under high load and concurrent users. |

---

## 📄 API Documentation
Interactive API docs available via **Swagger UI** once the server is running.  
http://localhost:3000/api-docs

---

## 🧠 Future Enhancements
- Add payment integration.  
- Implement AI-based restaurant recommendations.  
- Support for multi-branch vendors.  

---

## 👨‍💻 Author
**Mohamed Tarek**  
Software Engineer | Backend Developer (.NET & Node.js)
