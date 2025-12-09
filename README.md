
#  Social Media App

A full-stack **Social Media Application** built with **Node.js, Express, MongoDB, and Socket.io**.  
Includes authentication, posts, comments, likes, notifications, and a responsive frontend.

---

##  Project Structure


```
social_media-app/
 ├── config/                             # Database connection
 │   └── db.js 
 ├── controllers/                        # Business logic
 │   ├── authController.js 
 │   ├── commentController.js 
 │   ├── postController.js 
 │   └──  postController.js 
 ├── routes/                              # API routes
 │   ├── authRoutes.js 
 │   ├── commentRoutes.js 
 │   ├── postRoutes.js 
 │   └── userRoutes.js
 ├── middleware/                          # Auth & upload middleware
 │   ├── authMiddleware.js 
 │   └── upload.js 
 ├── models/                              # MongoDB models
 │   ├── Follow.js 
 │   ├── comment.js 
 │   ├── post.js 
 │   └── user.js 
 ├── uploads/                             # Uploaded files
 │   ├── post/
 ├── ├── ├── dault.png
 │   │   └── dault.png 
 │   ├── profiles/
 ├── ├── ├── dault.png
 │   └── └── dault.png  
 ├── frontend/                            # HTML, CSS, JS
 │   ├── Js/
 │   │   ├── auth.js      
 │   │   ├── feed.js           
 │   │   ├── posts.js
 │   │   ├── profile.js
 │   │   └── script.js
 │   ├── css/     
 │   │   ├── feed.css           
 │   │   ├── profile.css
 │   │   └── style.css
 │   ├── index.html
 │   ├── feed.html
 │   ├── profile.html
 │   ├── login.html
 │   ├── register.html 
 │   ├── default.png        
 │   ├──assets/         
 │   │  ├── icons
 │   └── └── dault.png         
 │   │  ├── images
 │   │   └── dault.png  
 ├──.env
 └──  server.js                       # Entry point
```

---

##  Features

###  Authentication
- Register & login  
- JWT-based authentication  
- Password hashing using **bcrypt**

###  User Profiles
- Upload avatar  
- Bio, followers & following  
- Sidebar profile stats  

###  Posts
- Create posts (text + image/file upload)  
- Edit & delete posts  
- Personal feed: `/api/posts/mine`

###  Likes
- Like/unlike toggle  
- Real-time like counts  

###  Comments
- Add, view & delete comments  
- Dynamic comment counter  

###  Real-Time Notifications
- Powered by **Socket.io**  
- Users join rooms based on their User ID  
- Instant notifications for likes/comments  

###  REST API
- Modular routes: auth, users, posts, comments, notifications  

###  Frontend
- Responsive HTML, CSS, JavaScript  
- Sidebar navigation (Home, Community, Events, Create Post, My Posts, Profile)  
- Create Post card with image/file preview  
- Feed cards with dropdown actions (edit/delete)

---

##  Installation & Setup

### 1. Install Dependencies
```
npm install
````
### 2. Configure Environment Variables

Create a .env file:
```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=5000
````
### 3. Start the Server
````
npm start
````

### 4. Open the Frontend

Open this file in your browser:
```
frontend/index.html
````
##  API Endpoints

### **Auth**
- **POST** `/api/auth/register` – Register new user  
- **POST** `/api/auth/login` – Login user  

---

### **Users**
- **GET** `/api/users/me` – Get current user profile  
- **PUT** `/api/users/:id` – Update user profile  

---

### **Posts**
- **POST** `/api/posts` – Create post (supports image/file upload)  
- **GET** `/api/posts` – Get all posts  
- **GET** `/api/posts/mine` – Get logged-in user's posts  
- **GET** `/api/posts/:id` – Get single post  
- **PUT** `/api/posts/:id` – Update post  
- **DELETE** `/api/posts/:id` – Delete post  
- **POST** `/api/posts/:id/like` – Like/unlike post  
- **POST** `/api/posts/:id/comments` – Add comment  
- **GET** `/api/posts/:id/comments` – Get comments  

---

### **Notifications**
- **GET** `/api/notifications` – Fetch notifications  

---

### **Socket.io Events**
- **join** – Join user's room  
- **sendNotification** – Send notification  
- **newNotification** – Receive notification  

---


##  Contributing
Pull requests are welcome.  
For major changes, please open an issue to discuss improvements first.


