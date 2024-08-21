// const express = require("express");
// const path = require("path");
// const { open } = require("sqlite");
// const sqlite3 = require("sqlite3");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const dbPath = path.join(__dirname, "goodreads.db");
// const app = express();

// app.use(express.json());

// let db = null;

// const initializeDBAndServer = async () => {
//   try {
//     db = await open({ filename: dbPath, driver: sqlite3.Database });
//     app.listen(3000, () => {
//       console.log("Server Running at http://localhost:3000/");
//     });
//   } catch (e) {
//     console.log(`DB Error: ${e.message}`);
//     process.exit(-1);
//   }
// };
// initializeDBAndServer();

// //middleware function
// const authenicateToken = (request, response, next) => {
//   let jwtToken;
//   const authHeader = request.headers["authorization"];
//   if (authHeader !== undefined) {
//     jwtToken = authHeader.split(" ")[1];
//   }
//   if (jwtToken === undefined) {
//     response.status(401);
//     response.send("Invalid Access Token");
//   } else {
//     jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
//       if (error) {
//         response.send("Invalid Access Token");
//       } else {
//         request.username = payload.username;
//         next();
//       }
//     });
//   }
// };
// //get profile
// app.get("/profile/", authenicateToken, async (request, response) => {
//   const { username } = request;
//   const profileQuery = `
//     SELECT * FROM user WHERE username='${username}';
//   `;
//   const result = await db.get(profileQuery);
//   response.send(result);
// });

// //Get Books API
// app.get("/books/", authenicateToken, async (request, response) => {
//   const getBooksQuery = `
//         SELECT
//             *
//         FROM
//             book
//         ORDER BY
//             book_id;`;
//   const booksArray = await db.all(getBooksQuery);
//   response.send(booksArray);
// });

// //Get Book API
// app.get("/books/:bookId/", authenicateToken, async (request, response) => {
//   const { bookId } = request.params;
//   const getBookQuery = `
//       SELECT
//        *
//       FROM
//        book
//       WHERE
//        book_id = ${bookId};
//     `;
//   const book = await db.get(getBookQuery);
//   response.send(book);
// });

// //User Register API
// app.post("/users/", async (request, response) => {
//   const { username, name, password, gender, location } = request.body;
//   const hashedPassword = await bcrypt.hash(request.body.password, 10);
//   const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
//   const dbUser = await db.get(selectUserQuery);
//   if (dbUser === undefined) {
//     const createUserQuery = `
//       INSERT INTO
//         user (username, name, password, gender, location)
//       VALUES
//         (
//           '${username}',
//           '${name}',
//           '${hashedPassword}',
//           '${gender}',
//           '${location}'
//         )`;
//     await db.run(createUserQuery);
//     response.send(`User created successfully`);
//   } else {
//     response.status(400);
//     response.send("User already exists");
//   }
// });

// //User Login API
// app.post("/login/", async (request, response) => {
//   const { username, password } = request.body;
//   const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
//   const dbUser = await db.get(selectUserQuery);
//   if (dbUser === undefined) {
//     response.status(400);
//     response.send("Invalid User");
//   } else {
//     const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
//     if (isPasswordMatched === true) {
//       const payload = {
//         username: username,
//       };
//       const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
//       response.send({ jwtToken });
//       console.log(jwtToken);
//     } else {
//       response.status(400);
//       response.send("Invalid Password");
//     }
//   }
// });

const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "./goodreads.db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let db = null;

const initializeDbAndServer = async function () {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at 3000 port");
    });
  } catch (e) {
    console.log(`errorMessage:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// const authenticate = function (request, response, next) {
//   let jwtToken;
//   const authHeader = request.headers["authorization"];
//   if (authHeader !== undefined) {
//     jwtToken = authHeader.split(" ")[1];
//   }
//   if (jwtToken === undefined) {
//     response.send("invalid access token");
//   } else {
//     jwt.verify(jwtToken, "saikiran", async (error, payload) => {
//       if (error) {
//         response.send("invalid access");
//       } else {
//         request.username = payload.username;
//         next();
//       }
//     });
//   }
// };

const authenticate = (request, response, next) => {
  let jwtToken;
  let authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.send("invalid Access");
  } else {
    jwt.verify(jwtToken, "saikiran", (error, payload) => {
      if (error) {
        response.send("invalid access token");
      } else {
        request.username = payload.username;
        next();
      }
    });
  }
};

app.get("/books/", authenticate, async (request, response) => {
  const booksQuery = `select * from book`;
  const result = await db.all(booksQuery);
  response.send(result);
});

app.get("/profile/", authenticate, async (request, response) => {
  const username = request.username;
  const userQuery = `select * from user where username='${username}'`;
  const result = await db.get(userQuery);
  response.send(result);
});

app.get("/books/:bookId/", authenticate, async (request, response) => {
  const { bookId } = request.params;
  const booksQuery = `select * from book where book_id=${bookId}`;
  const result = await db.get(booksQuery);
  response.send(result);
});

// app.post("/users/", async (request, response) => {
//   const { name, username, password, gender, location } = request.body;
//   const userQuery = `select * from user where username='${username}'`;
//   const result = await db.get(userQuery);

//   if (result == undefined) {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const dataQuery = `insert into user (name,username,password,gender,location) values ('${name}','${username}','${hashedPassword}','${gender}','${location}')`;
//     await db.run(dataQuery);
//     response.send("user register successfully");
//   } else {
//     response.status(401);
//     response.send("user already registered");
//   }
// });

app.post("/users/", async (request, response) => {
  const { name, username, password, gender, location } = request.body;
  console.log(name);
  const getUserQuery = `select * from user where username='${username}'`;
  const result = await db.get(getUserQuery);
  if (result === undefined) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updateQuery = `insert into user(name,username,password,gender,location) values ('${name}','${username}','${hashedPassword}','${gender}','${location}')`;
    await db.run(updateQuery);
    response.send("user registered successfully");
  } else {
    response.send("user exists already");
  }
});

// app.post("/login/", async (request, response) => {
//   const { username, password } = request.body;
//   const userQuery = `select * from user where username='${username}'`;
//   const result = await db.get(userQuery);
//   if (result == undefined) {
//     response.send("user is not registered");
//   } else {
//     const isPassword = await bcrypt.compare(password, result.password);
//     if (isPassword) {
//       const payload = { username: username };
//       const jwtToken = await jwt.sign(payload, "saikiran");
//       response.send({ jwtToken });
//       console.log(jwtToken);
//     } else {
//       response.send("password is invalid");
//     }
//   }
// });

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const getUser = `select * from user where username='${username}'`;
  const checkUser = await db.get(getUser);

  if (checkUser === undefined) {
    response.status(400);
    response.send("user is not registered");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (isPasswordMatched === true) {
      const payload = { username };
      const jwtToken = jwt.sign(payload, "saikiran");
      response.send(jwtToken);
    } else {
      response.send("password is invalid");
    }
  }
});

// const express = require("express");
// const app = express();
// app.use(express.json());

// const sqlite3 = require("sqlite3");
// const { open } = require("sqlite");

// const path = require("path");
// const dbPath = path.join(__dirname, "./goodreads.db");

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// let db;

// const initializeDbAndServer = async () => {
//   try {
//     db = await open({
//       filename: dbPath,
//       driver: sqlite3.Database,
//     });
//     app.listen(3000, () => {
//       console.log("server is running at 3000 port");
//     });
//   } catch (e) {
//     console.log(e.error);
//     process.exit(1);
//   }
// };

// initializeDbAndServer();

// const authenticate = (request, response, next) => {
//   let jwtToken;
//   let token = request.headers["authorization"];
//   if (token !== undefined) {
//     token = token.split(" ")[1];
//   }
//   jwt.verify(token, "saikiran", (error, payload) => {
//     if (error) {
//       response.send("invalid access");
//     } else {
//       request.query = payload.username;
//       next();
//     }
//   });
// };

// app.get("/books/:id", authenticate, async (request, response) => {
//   const { id } = request.params;
//   const query = `select * from book where book_id=${id}`;
//   let result = await db.get(query);
//   response.send(result);
// });

// app.get("/books/", authenticate, async (request, response) => {
//   const query = `select * from book`;
//   const result = await db.all(query);
//   response.send(result);
// });

// app.post("/users/", async (request, response) => {
//   const { username, password, gender, location } = request.body;
//   const query = `select * from user where username='${username}'`;
//   const result = await db.get(query);

//   if (result === undefined) {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const userQuery = `insert into user (username,password,gender,location) values ('${username}','${hashedPassword}','${gender}','${location}')`;
//     await db.run(userQuery);
//     response.send("user register successfully");
//   } else {
//     console.log("user already registered");
//   }
// });

// app.post("/login/", async (request, response) => {
//   const { username, password } = request.body;
//   const query = `select * from user where username='${username}'`;
//   const result = await db.get(query);

//   if (result !== undefined) {
//     const isValid = await bcrypt.compare(password, result.password);
//     if (isValid) {
//       const payload = { username };
//       const jwtToken = jwt.sign(payload, "saikiran");
//       response.send(jwtToken);
//     }
//   } else {
//     response.send("user is not registered");
//   }
// });
