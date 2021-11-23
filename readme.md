# API Documentation (v4.8)

## Auth queries

### Register new user
`http://localhost:5000/api/user/register` <br>
(minimum: login - 4 letters, password - 6 letters) <br>
(maximum: login - 32 letters, password - 32 letters) <br>
(login _must_ be unique) <br>
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
> If (500 status) then database is not available.<br>
>
> Updates login, nickname, password and last_time_utc in database.<br>

### Login user
`http://localhost:5000/api/user/login` <br>
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

### Get new tokens
`http://localhost:5000/api/user/check` <br>
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
>
> Updates last_login_utc and refresh_token in database.<br>

### Get all public information about user
(without id, login, password and refresh_token) <br>
`http://localhost:5000/api/user/fetch/` <br>
```
POST
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InRlc3RfdG9rZW4iLCJwYXNzd29yZCI6IiQyYSQxMCRsdG84SDVaUnBRWXZTQUZQbDMyTFB1QnFsdHJEL2tpZ3h1azYwMXpBbmpJUmNjUHp4eUI0VyIsImlhdCI6MTYzNzUwNzIxNCwiZXhwIjoxNjM3NTA5MDE0fQ.gaF2jkTmBt-EzE1vUmUVbWNHrywPejGSWEI1mF-I5Q4"
}
```
> If (200 status) then returns username, about, avatar_url, last_login_utc and register_utc.<br>
> If (401 status) then access_token has expired or bad access_token.<br>
> If (404 status) then user with this access_token not found.<br>
> If (500 status) then database is not available.<br>

### Reset password
`http://localhost:5000/api/user/resetPassword/` <br>
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

### Delete user
`http://localhost:5000/api/user/delete/` <br>
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

____
# NOT WORKING IN >V4.0-alpha


### Update avatar
`http://localhost:5000/api/user/changeAvatar/<USER_ID>` <br>
```
PUT:
{
    "avatarURL": "avatarURL_Link"
}
```
> Returns boolean status.<br>
> If false, then user not found.

### Update nickname
`http://localhost:5000/api/user/changeNickname/<USER_ID>` <br>
```
PUT:
{
    "nick": "MACTEP-qpJIoMaCTeP"
}
```
> Returns boolean status.<br>
> If false, then user not found.

## Apartments queries

### Add apartment
`http://localhost:5000/api/apart/add` <br>
```
POST:
{
    "userID": *OWNER_ID*,
    "name": "test",
    "canvas": "some big data"
}
```
> Returns boolean status.<br>
> If false then userID isn't found.

## Items queries

### Add item
`http://localhost:5000/api/item/add` <br>
```
POST:
{
    "name": "test",
    "image": "image_link"
}
```
> Returns item id of false.<br>
> If false then name already exists.