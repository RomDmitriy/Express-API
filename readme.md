# API Documentation (v5.1)

## Auth queries

### Register new user
`http://localhost:5000/api/user/register`<br>
(minimum: login - 4 letters, password - 6 letters)<br>
(maximum: login - 32 letters, password - 32 letters)<br>
(login _must_ be unique)<br>
```
POST:
{
    "login": "test",
    "password": "testtest"
}
```
> If (201 status) then returns access_token (expires in 30 minutes) and refresh_token (expires after any refresh tokens).<br>
> If (400 status) then login or password is null, or wrong length.<br>
> If (409 status) then user already exists.<br>
> If (429 status) then user tries register too many accounts.<br>
> If (500 status) then database is not available.<br>

> Updates login, nickname, password, last_time_utc and register_time_utc in database.<br>

### Login user
`http://localhost:5000/api/user/login`<br>
```
POST:
{
    "login": "test",
    "password": "testtest"
}
```
> If (200 status) then returns access_token (expires in 30 minutes) and refresh_token (expires after any refresh tokens).<br>
> If (400 status) then bad request.<br>
> If (401 status) then wrong password.<br>
> If (404 status) then user not found.<br>
> If (500 status) then database is not available.<br>

> Updates last_time_utc and refresh_token in database.<br>

### Login user via access token
`http://localhost:5000/api/user/loginToken`<br>
```
POST:
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InRlc3R0dCIsInBhc3N3b3JkIjoiJDJhJDEwJDV4bzRibDM4czczSmJIQmFlUmw1UC5lc0k0MXNUMC42LnBaUlhmZi5YekFBUXJDZ1RSNG5tIiwiaWF0IjoxNjM3NzQ0MjQ3LCJleHAiOjE2Mzc3NDYwNDd9.oLDKwnjSwZy1sR3EHVypsGgYXrT6k_Cq4VCr9n-VaII"
}
```
> If (200 status) then user found.<br>
> If (400 status) then bad request.<br>
> If (401 status) then access_token has expired or bad access_token.<br>
> If (404 status) then user with this token not found.<br>
> If (500 status) then database is not available.<br>

> Updates last_time_utc in database.<br>

### Get new tokens
`http://localhost:5000/api/user/check`<br>
```
POST:
{
    "refresh_token": "3VpMzWC4KZU29yPZzwgQmbvDQMiJJY9s5"
}
```
> If (200 status) then returns access_token (expires in 30 minutes) and refresh_token (expires after any refresh tokens).<br>
> If (400 status) then refresh_token is null.<br>
> If (404 status) then user with this refresh_token not found.<br>
> If (500 status) then database is not available.<br>

> Updates last_login_utc and refresh_token in database.<br>

### Get all public information about user
(without id, login, password and refresh_token)<br>
`http://localhost:5000/api/user/fetch/`<br>
```
POST
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InRlc3RfdG9rZW4iLCJwYXNzd29yZCI6IiQyYSQxMCRsdG84SDVaUnBRWXZTQUZQbDMyTFB1QnFsdHJEL2tpZ3h1azYwMXpBbmpJUmNjUHp4eUI0VyIsImlhdCI6MTYzNzUwNzIxNCwiZXhwIjoxNjM3NTA5MDE0fQ.gaF2jkTmBt-EzE1vUmUVbWNHrywPejGSWEI1mF-I5Q4"
}
```
> If (200 status) then returns username, about, avatar_url, last_login_utc and register_time_utc.<br>
> If (401 status) then access_token has expired or bad access_token.<br>
> If (404 status) then user with this access_token not found.<br>
> If (500 status) then database is not available.<br>

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
> If (200 status) then returns new tokens (only if you changed user password) or nothing.<br>
> If (401 status) then access_token has expired or bad access_token.<br>
> If (404 status) then user with this access_token not found.<br>
> If (500 status) then database is not available.<br>

### Reset password
`http://localhost:5000/api/user/resetPassword/`<br>
```
POST
{
    "login": "test",
    "new_password": "New Password"
}
```
> If (200 status) then password successfully changed.<br>
> If (404 status) then user with this login not found.<br>
> If (500 status) then database is not available.<br>

> Past access token will not be working, you must request new access token

### Delete user
`http://localhost:5000/api/user/delete/`<br>
```
DELETE
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InRlc3RfdG9rZW4iLCJwYXNzd29yZCI6IiQyYSQxMCRsdG84SDVaUnBRWXZTQUZQbDMyTFB1QnFsdHJEL2tpZ3h1azYwMXpBbmpJUmNjUHp4eUI0VyIsImlhdCI6MTYzNzUwNzIxNCwiZXhwIjoxNjM3NTA5MDE0fQ.gaF2jkTmBt-EzE1vUmUVbWNHrywPejGSWEI1mF-I5Q4"
}
```
> If (200 status) then user successfully deleted.<br>
> If (401 status) then access_token has expired or bad access_token.<br>
> If (404 status) then user with this access_token not found.<br>
> If (500 status) then database is not available.<br>