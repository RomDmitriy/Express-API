import express from "express";
import apartmentRouter from "./routes/apartment.routes.js";
import authRouter from "./routes/auth.routes.js";
import itemsRouter from "./routes/item.routes.js";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());
// app.use(passport.initialize());
// //
// import { Strategy as JwtStrategy } from 'passport-jwt';
// import { ExtractJwt } from 'passport-jwt';
// var opts = {}
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = 'secret';
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';
// passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
//     User.findOne({id: jwt_payload.sub}, function(err, user) {
//         if (err) {
//             return done(err, false);
//         }
//         if (user) {
//             return done(null, user);
//         } else {
//             return done(null, false);
//             // or you could create a new account
//         }
//     });
// }));
// //
app.use("/api/user", authRouter);
app.use("/api/apart", apartmentRouter);
app.use("/api/item", itemsRouter);

export default app;
