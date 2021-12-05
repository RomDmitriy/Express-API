# API Documentation

## How to install API

1) Install [Node.js](https://nodejs.org/en/)

____
2) Open where you want to place the API folder

____
3) In this folder open a console and write
 ```
 git clone https://github.com/RomDmitriy/Express-API.git
 ```
   Or if you don't have git, you can download API from GitHub by clicking on 'Download ZIP'
   ![image](https://user-images.githubusercontent.com/55810251/144215518-7a07d3bc-cf04-4de9-987d-ee7e9eadc0f7.png)

____
4) Go to API folder. Open console and write
 ```
 npm i
 ```

   (this will install the required packages to your folder, the process may take a few minutes)

____
5) Write in console
 ```
 npm run gen_cfg
 ```

   The security_config.js file will appear in the API folder, you need to fill it with your data, otherwise the API will not work!

____
6) Finally, you can run API by using
 ```
 npm run server
 ```


____
If you have git, you can also update your API version. Just type into the console
```
npm run full_update
```

## Auth queries

### Register new user
`http://localhost:5000/api/user/register`<br>
(minimum: login - 4 letters, password - 6 letters)<br>
(maximum: login - 32 letters, password - 32 letters)<br>
(login **must** be unique)<br>
```
POST:
{
    "login": "test",
    "password": "testtest"
}
```
> 201 status: Returns access_token (expires in 30 minutes) and refresh_token (expires after any refresh tokens).<br>
> Updates login, nickname, password, last_time_utc and register_time_utc in database.<br>

> 400 status: Bad request (check field names or length of values).<br>
> 409 status: This user already exists.<br>
> 429 status: User tries register too many accounts.<br>
> 500 status: Database is not available.<br>

### Login user
`http://localhost:5000/api/user/login`<br>
```
POST:
{
    "login": "test",
    "password": "testtest"
}
```
> 200 status: Returns access_token (expires in 30 minutes) and refresh_token (expires after any refresh tokens).<br>
> Updates last_time_utc and refresh_token in database.<br>

> 400 status: Bad request.<br>
> 401 status: Wrong password.<br>
> 404 status: User not found.<br>
> 500 status: Database is not available.<br>

### Login user via access token
`http://localhost:5000/api/user/loginToken`<br>
```
POST:
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InRlc3R0dCIsInBhc3N3b3JkIjoiJDJhJDEwJDV4bzRibDM4czczSmJIQmFlUmw1UC5lc0k0MXNUMC42LnBaUlhmZi5YekFBUXJDZ1RSNG5tIiwiaWF0IjoxNjM3NzQ0MjQ3LCJleHAiOjE2Mzc3NDYwNDd9.oLDKwnjSwZy1sR3EHVypsGgYXrT6k_Cq4VCr9n-VaII"
}
```
> 200 status: User found.<br>
> Updates last_time_utc in database.<br>

> 400 status: Bad request.<br>
> 401 status: This access_token has expired or bad access_token.<br>
> 404 status: No one user with this token not found.<br>
> 500 status: Database is not available.<br>

### Get new tokens
`http://localhost:5000/api/user/check`<br>
```
POST:
{
    "refresh_token": "3VpMzWC4KZU29yPZzwgQmbvDQMiJJY9s5"
}
```
> 200 status: Returns access_token (expires in 30 minutes) and refresh_token (expires after any refresh tokens).<br>
> Updates last_login_utc and refresh_token in database.<br>

> 400 status: This refresh_token is null.<br>
> 404 status: User with this refresh_token not found.<br>
> 500 status: Database is not available.<br>

### Get all public information about user
(without id, login, password and refresh_token)<br>
`http://localhost:5000/api/user/fetch/`<br>
```
POST
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InRlc3RfdG9rZW4iLCJwYXNzd29yZCI6IiQyYSQxMCRsdG84SDVaUnBRWXZTQUZQbDMyTFB1QnFsdHJEL2tpZ3h1azYwMXpBbmpJUmNjUHp4eUI0VyIsImlhdCI6MTYzNzUwNzIxNCwiZXhwIjoxNjM3NTA5MDE0fQ.gaF2jkTmBt-EzE1vUmUVbWNHrywPejGSWEI1mF-I5Q4"
}
```
> 200 status: Returns username, about, avatar_url, last_login_utc and register_time_utc.<br>

> 401 status: This access_token has expired or bad access_token.<br>
> 404 status: No one user with this token not found.<br>
> 500 status: Database is not available.<br>

### Change user information
(nickname, password, about, avatar_url, question_id, question_answer can be changed)<br>
`http://localhost:5000/api/user/changeData/`<br>
```
POST
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InRlc3QiLCJwYXNzd29yZCI6IiQyYSQxMCRubDNtQ1d5M0h4b3MveFphNTE5dmlPNi9NeWhjdXN2N2lwajR0ck9UVzhwY3F4T1dkeTc4cSIsImlhdCI6MTYzNzk0MDE3NiwiZXhwIjoxNjM3OTQxOTc2fQ.1ux9Heuasa2Xz5LaGnRDeylIMu8vbCmrKHN3EyjhSbY",
    "nickname": "new_nickname",
    "password": "new_pass",
    "about": "new about",
    "avatar_url": "new_avatar_url",
    "question_id": 0,
    "question_answer": "Illya"
}
```
> 200 status: Returns new tokens (only if you changed user password) or nothing.<br>

> 401 status: This access_token has expired or bad access_token.<br>
> 404 status: No one user with this token not found.<br>
> 429 status: User tries changes data too often (restriction on changing data once a minute).<br>
> 500 status: Database is not available.<br>

### Reset password
`http://localhost:5000/api/user/resetPassword/`<br>
```
POST
{
    "login": "test",
    "new_password": "New Password"
}
```
> 200 status: User password successfully changed.<br>
> Past access token will not be working, you must request new access token.<br>

> 404 status: No one user with this token not found.<br>
> 500 status: Database is not available.<br>

### Delete user
`http://localhost:5000/api/user/delete/`<br>
```
DELETE
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InRlc3RfdG9rZW4iLCJwYXNzd29yZCI6IiQyYSQxMCRsdG84SDVaUnBRWXZTQUZQbDMyTFB1QnFsdHJEL2tpZ3h1azYwMXpBbmpJUmNjUHp4eUI0VyIsImlhdCI6MTYzNzUwNzIxNCwiZXhwIjoxNjM3NTA5MDE0fQ.gaF2jkTmBt-EzE1vUmUVbWNHrywPejGSWEI1mF-I5Q4"
}
```
> 200 status: User successfully deleted.<br>

> 401 status: This access_token has expired or bad access_token.<br>
> 404 status: No one user with this token not found.<br>
> 500 status: Database is not available.<br>