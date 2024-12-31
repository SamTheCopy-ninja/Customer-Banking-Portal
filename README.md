# Globe Transact Banking Portal

Globe Transact is a prototype banking portal built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. This application allows users to register, log in, manage their cards, and make international SWIFT payments.  

## This is an example prototype that does not integrate SWIFT, or directly process bank account data or card details.  
## The app simulates some functionality for demonstration purposes, to recreate how these could function in an actual production build of a similar app.  

This new build of the portal now includes the Employee Portal where staff memebers can log in to view, confirm, reject or submit payments to SWIFT, for futher processing.  
### You can view a demo video of the platform here: [Walkthrough Video](https://youtu.be/FYWj0ScBAmM)  
## Project Built By:  
The 13th Coffin Software Development Group:  
  Members: `Samkelo Tshabalala`   

## Banking Platform Features 

**Customer features** 
- User Registration and Authentication 
- Secure Login System
- Dashboard for viewing account information
- Card Management (Add, View, Delete)
- SWIFT Payment Processing
- Transaction History
- Responsive Design

**Employee features** 
- Log in without registering
- View stats for payments processed
- Confirm payments
- Reject payments
- Submit payments to SWIFT for further processing.


## List of Security Measures Implemented in the Portal

- **bcryptjs**: For `hashing` and `salting passwords` to ensure that user credentials are securely stored.
- **express-validator**: For validating and sanitizing incoming data to prevent XSS and SQL injection.
- **Helmet**: For securing HTTP headers to protect against common vulnerabilities such as clickjacking and XSS.
- **express-rate-limit**: For limiting the number of requests to certain endpoints to mitigate brute-force attacks.
- **jsonwebtoken (JWT)**: For issuing and verifying JSON Web Tokens to handle user authentication securely.
- **morgan**: For logging HTTP requests to monitor traffic and detect suspicious activity.
- **Joi**: For validating and enforcing data schemas, ensuring that only properly formatted data is processed.
- **mongoose**: For managing and validating MongoDB ObjectIds and ensuring correct database operations.
- **fs (File System module)**: For managing log files, including creating and writing to directories for server activity and error logs.
- **path**: For handling and resolving file paths securely within the server environment.
- **express**: For handling API routing and middleware in a structured and secure manner.
- **Node.js built-in Error Handling**: For capturing, logging, and responding to errors in a way that prevents information leakage and assists in debugging.
- **React useEffect and useState**: To handle component lifecycle and state securely, including proper cleanup to prevent memory leaks.
- **react-router-dom**: For navigating between components securely, especially for protecting routes and redirecting unauthenticated users.
- **jwt-decode**: For decoding and verifying the token expiry to ensure valid session management.
- **react-toastify**: For providing secure and user-friendly notifications while avoiding any risk of XSS.
- **AbortController**: For aborting network requests when components unmount, reducing the risk of unwanted or dangling API calls.
- **Yup**: For schema-based validation of form inputs, providing robust validation rules for user inputs.
- **DOMPurify**: For sanitizing user input to ensure it is free from XSS vulnerabilities and other malicious content.

## Prerequisites

Before you begin, ensure you have met the following requirements:

## This prototype uses MongoDB for data storage, as such you may not be able to access the database due to MongoDB blacklisting connections from unknown IP addresses.  
To address this issue please do the following:  

### How to Create a MongoDB Atlas Cluster

To set up a MongoDB Atlas cluster for this project, follow the steps below:

### 1. **Sign Up/Log In to MongoDB Atlas**
- Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account or log in if you already have one.

### 2. **Create a New Project**
- Once logged in, click on **Projects** from the left-hand menu.
- Click **Create New Project**, give it a name (e.g., `MyAppDatabase`), and then click **Next**.

### 3. **Create a Cluster**
- Inside your project, click on the **Build a Cluster** button.
- Select the **Free Tier** option to create a free cluster.
  
  - **Cloud Provider & Region**: Select your preferred cloud provider (e.g., AWS) and a region.
  - Leave other options as default and click **Create Cluster**.

### 4. **Create a Database User**
- While your cluster is being created, go to the **Database Access** tab on the left.
- Click **Add New Database User**.
  - Choose a username and password for the database user. Make sure to save them, as you will need them for your application's connection string.
  - Set the user’s role to **Atlas Admin**.
  - Click **Add User**.

### 5. **Configure Network Access**
- Go to the **Network Access** tab on the left.
- Click **Add IP Address**.
  - Click **Add Current IP Address** to whitelist your IP address.
  - Click **Confirm**.

### 6. **Get the Connection String**
- Once your cluster is created, click on **Connect**.
- Select **Connect your application**.
- You will see a MongoDB connection string like this:
```
  mongodb+srv://<username>:<password>@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```
# NB !!!  
   Copy the connection string, then open the `Global Transact` project in Visual Studio Code   
   open the `.env` file in the `Backend` folder and paste your connection string where you see the following:  
   
```
  ATLAS_URI ="mongodb+srv://<username>:<password>@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
```
---
### Create Your Own Self-Signed Certificate Using OpenSSL

Follow these steps to generate security certificates using OpenSSL:

---

### 1. **Download OpenSSL**
- Visit [https://slproweb.com/products/Win32OpenSSL.html](https://slproweb.com/products/Win32OpenSSL.html).
- Choose the **Win64 Light** version.


### 2. **Install OpenSSL**
- During installation, Windows may block the program. If this happens:
  - Click the **More info** link.
  - Select **Run anyway** to proceed.
- Accept the default options except for the install location—choose a directory you can easily access.
- When asked about the DLL location, select:  
  **The OpenSSL binaries (/bin) directory**.


### 3. **Set Up Visual Studio Code**
- Open **Visual Studio Code** and launch a terminal:  
  **Terminal -> New Terminal**.  
  This acts as the Windows command prompt. If unfamiliar with command-line tools, consider researching Windows' two shells: **Command Prompt** and **PowerShell**.


### 4. **Navigate to OpenSSL**
- In the terminal, navigate to the directory where OpenSSL was installed/downloaded to and switch to the **bin** folder.

### 5. **Generate the Private Key**
- Run the following command:  
  ```bash
  openssl genrsa -out privatekey.pem 1024
  ```

---

### 6. **Create an `openssl.cfg` File**
Before proceeding to the next step, you might need to create an `openssl.cfg` file in the **bin** folder.  
Here’s how:
- Use your preferred text editor, such as Notepad or Visual Studio Code.
- The contents of the file can be found on the OpenSSL documentation site:  
  [https://www.openssl.org/docs/man1.1.1/man1/req.html](https://www.openssl.org/docs/man1.1.1/man1/req.html).  
- Scroll down until you find the text similar to the section below:  
  ```ini
  [ req ]
  default_bits           = 2048
  default_keyfile        = privkey.pem
  distinguished_name     = req_distinguished_name
  attributes             = req_attributes
  req_extensions         = v3_ca
  dirstring_type = nobmp
  [ req_distinguished_name ]
  countryName                    = Country Name (2 letter code)
  countryName_default            = AU
  countryName_min                = 2
  countryName_max                = 2
  localityName                   = Locality Name (eg, city)
  organizationalUnitName         = Organizational Unit Name (eg, section)
  commonName                     = Common Name (eg, YOUR name)
  commonName_max                 = 64
  emailAddress                   = Email Address
  emailAddress_max               = 40
  [ req_attributes ]
  challengePassword              = A challenge password
  challengePassword_min          = 4
  challengePassword_max          = 20
  [ v3_ca ]
  subjectKeyIdentifier=hash
  authorityKeyIdentifier=keyid:always,issuer:always
  basicConstraints = critical, CA:true
  ```
- Copy and paste this into your `openssl.cfg` file and save it in the **bin** folder.

---

### 7. **Create a Certificate Signing Request (CSR)**
Run the following command:  
```bash
openssl req -new -key privatekey.pem -out certrequest.csr
```

---

### 8. **Sign the Certificate**
Use the private key to sign the certificate:  
```bash
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
```

---

### 9. **Secure Your Files**
- Keep the files `certificate.pem` and `privatekey.pem` in a safe location.

---

### 10. **Integrate with Your Project**
- In **Visual Studio Code**, navigate to the `Backend` directory of your project.
- Locate the ``Keys`` folder.
- Replace the placeholder files with your newly created `.pem` files (`certificate.pem` and `privatekey.pem`).

---

Your self-signed certificate setup should now be complete.  

## Installation

To install Globe Transact, follow these steps:

1. Clone the repository:
   ```
    git clone https://github.com/SamTheCopy-ninja/Customer-Banking-Portal.git
   ```

2. Setup the backend server connection by ensuring you replaced the existing MongoDB connection string in the `.env` file

3. Install frontend dependencies:
   ```
   cd frontend
   npm install react-scripts
   ```

# Adding Employees to Your Database

After you have successfully configured your MongoDB cluster, you will need to preregister employees in the database so you can use their details to log in to the employee portal. Follow these steps:

1. **Start the Backend Server:**
   ```bash
   cd Backend
   npm run dev
2. **Run the Following Script in your Backend terminal to Add Employees to the Database:**  
   ``` bash
   npm run seed:employees
This will add employees to the database.  
For further instructions about how to access the Employee Portal, view the `Running the Application` and `Usage` sections below.  

## Running the Application

To run Globe Transact, follow these steps:

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```
   The server should start running on `https://localhost:5000`.

2. In a new terminal, start the frontend development server (ensure you have installed the `react-scripts` beforehand):
   ```
   cd frontend
   npm start
   ```
   The React development server should start and open the application in your default browser.

## Usage

**Customer Features**

Customers can do the following:
1. Open your browser and navigate to `https://localhost:3000` (or the port specified by your React app).
2. Register a new account or log in with existing credentials.
3. In the `dashboard`, you can:
   - View your profile information
   - View existing cards
   - Delete cards
   - View payment history
4. In the `Add Card` page, you can enter your card details to add a new card for payments.
5. In the `Create Payments` page, you can create new SWIFT payments.

**Employee Features**

Employees can access the portal by doing the following:
1. Once the web app is running, you should see this URL in your search bar: `http://localhost:3000/login`.  
   This URL is only for the customer login page.
   
   To access the employee portal login, update the URL to: `http://localhost:3000/staff/login` and press enter on your keyboard.
   This will take you to the dedicated employee login page.
   
2. In the Backend directory in VS Code, navigate to the `scripts` folder and open the `seedEmployees.js` file.  
   Here you will find the Employee ID and password you need to log into the portal.
   
   Choose either set of credentials from the two preregistered employees and enter the Employee ID and password into the employee login page in your browser.
   
4. Once you are logged in, you will have access to the employee dashboard where you can do the following:
   - View all pending payments
   - View payment stats for the number of verified payments, number of pending payments, and number of payments submitted to SWIFT
   - Verify or reject a payment
   - Choose a payment and manually submit it to SWIFT



## Code Attribution and Sources  

### Using JSON Web Tokens
**Code adapted from:**
- **Article:** [Understanding JSON Web Tokens (JWT): A Secure Approach to Web Authentication](https://medium.com/@extio/understanding-json-web-tokens-jwt-a-secure-approach-to-web-authentication-f551e8d66deb#:~:text=1.%20Extio%20explains%20JSON%20Web%20Tokens%20(JWT)%20Introduction.%20In%20the)
- **Author:** Extio Technology

### Creating database schema using Mongoose
**Code adapted from:**
- **Article:** [Getting Started With MongoDB & Mongoose](https://www.mongodb.com/developer/languages/javascript/getting-started-with-mongodb-and-mongoose/)
- **Author:** Jesse Hall

### Routing for API endpoints
**Code adapted from:**
- **Article:** [Routing](https://expressjs.com/en/guide/routing.html#:~:text=express.Router.%20Use%20the%20express.Router%20class%20to%20create%20modular,%20mountable%20route)
- **Author:** Express.js

### Using Morgan middleware for logging
**Code adapted from:**
- **Article:** [Introduction to Morgan.js](https://www.geeksforgeeks.org/introduction-to-morgan-js/?ref=oin_asr1)
- **Author:** GeeksForGeeks

### Working with Files using the fs Module
**Code adapted from:**
- **Article:** [How To Work with Files using the fs Module in Node.js](https://www.digitalocean.com/community/tutorials/how-to-work-with-files-using-the-fs-module-in-node-js)
- **Author:** Stack Abuse and Timothy Nolan

### Creating and accessing paths for log files
**Code adapted from:**
- **Article:** [Node.js Path Module](https://www.javascripttutorial.net/nodejs-tutorial/nodejs-path-module/#:~:text=Node.js%20offers%20a%20path%20module%20that%20allows%20you%20to%20interact)
- **Author:** JavaScript Tutorial

### Using the JOI module for input validation
**Code adapted from:**
- **Article:** [How To Use Joi for Node API Schema Validation](https://www.digitalocean.com/community/tutorials/how-to-use-joi-for-node-api-schema-validation)
- **Author:** Glad Chinda

### Password hashing and salting
**Code adapted from:**
- **Article:** [Password hashing in Node.js with bcrypt](https://www.honeybadger.io/blog/node-password-hashing/#:~:text=bcrypt%20is%20a%20crucial%20tool%20for%20enhancing%20password%20security%20in)
- **Author:** Samson Omojola

### Validating form inputs using Express
**Code adapted from:**
- **Article:** [How to Handle Form Inputs Efficiently with Express-Validator in ExpressJs](https://www.digitalocean.com/community/tutorials/how-to-handle-form-inputs-efficiently-with-express-validator-in-express-js)
- **Author:** Chiranjeev Singh and Abhimanyu Selvan

### Rate limiting using Express and Node
**Code adapted from:**
- **Article:** [Node.js & Express: How to Implement Rate Limiting](https://www.slingacademy.com/article/nodejs-express-implement-rate-limiting/#:~:text=Solution%201:%20Using%20Express-rate-limit.%20TL;DR:%20express-rate-limit%20is%20a%20middleware%20for)
- **Author:** Sling Academy

### Frontend navigation using React Router
**Code adapted from:**
- **Article:** [A Complete Beginner's Guide to React Router (Including Router Hooks)](https://www.freecodecamp.org/news/a-complete-beginners-guide-to-react-router-include-router-hooks/#:~:text=What%20is%20routing?%20Routing%20is%20the%20capacity%20to%20show%20different)
- **Author:** Ibrahima Ndaw

### Adding frontend toast messages
**Code adapted from:**
- **Article:** [Using React-Toastify to style your toast messages](https://blog.logrocket.com/using-react-toastify-style-toast-messages/)
- **Author:** Chimezie Innocent

### Input data validation using Yup
**Code adapted from:**
- **Article:** [Powerful Data Validation with Yup in Node.js](https://12tech.io/12tech-blog/powerful-data-validation-with-yup-in-node-js#:~:text=Yup%20is%20an%20incredibly%20powerful%20package%20that%20allows%20you%20to)
- **Author:** Jazim Abbas

### Preventing Cross-Site Scripting with DOMPurify
**Code adapted from:**
- **Article:** [Securing React Apps: A Guide to Preventing Cross-Site Scripting with DOMPurify](https://blog.openreplay.com/securing-react-with-dompurify/)
- **Author:** King AJ


## Further Acknowledgements

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JSON Web Tokens](https://jwt.io/)
