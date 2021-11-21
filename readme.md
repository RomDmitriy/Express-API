# API Documentation (v4.1-alpha)

____
Last tested on: v4.1-alpha
____

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
> If (201 status) then returns access_token (expires in 30 minutes) and refresh_token (expires after re-login or refresh tokens).<br>
> If (400 status) then login or password is null, or wrong length.<br>
> If (409 status) then user already exists.<br>

### Login user
`http://localhost:5000/api/user/login` <br>
```
POST:
{
    "login": "test",
    "password": "testtest"
}
```
> If (200 status) then returns access_token (expires in 30 minutes) and refresh_token (expires after re-login or refresh tokens).<br>
> If (400 status) then bad request.<br>
> If (401 status) then wrong password.<br>
> If (404 status) then user not found.<br>

### Get new tokens
`http://localhost:5000/api/user/check` <br>
```
POST:
{
    "refresh_token": "3VpMzWC4KZU29yPZzwgQmbvDQMiJJY9s5"
}
```
> If (200 status) then returns access_token (expires in 30 minutes) and refresh_token (expires after re-login or refresh tokens).<br>
> If (400 status) then refresh_token is null.<br>
> If (404 status) then user with this refresh_token not found.<br>
> Updates last_login_utc in database.<br>

____
# NOT WORKING IN V4.0-alpha

### Check user in database
`http://localhost:5000/api/user/check` <br>
```
POST:
{
    "login": "test",
    "password": "testtest"
}
```
> Returns nickname, about, avatar_url, last_login_utc or false.<br>
> If false, then there is no user with such a username and password, or missing parameters.<br>
> Update lastLoginIn in database.

### Get all information about user
(without id and password) <br>
`http://localhost:5000/api/user/fetch/<USER_ID>` <br>
```
GET
```
> Returns login, username, about, avatarURL, lastLoginUTC as JSON or false.
> If false, then user not found or missing <USER_ID>

### Get some user information
(id and password are not allowed) <br>
`http://localhost:5000/api/user/fetch/<USER_ID>/<FIELDS>` <br>
> Returns requested fields as JSON or false.
> If false, then user not found or missing <USER_ID>
> FIELDS - enumeration of needed fields (Avaliable fields: login, username, about, avatar_url, last_login_utc).
>> Example of crazy API Request:<br>`http://localhost:5000/api/user/fetch/<USER_ID>/login, nickname, id, avatar_urlabout ! last_login_utc->`<br>
>> This example returns login, about, avatarURL, lastLoginUTC as JSON.

### Update password
`http://localhost:5000/api/user/changePass/<USER_ID>` <br>
(minimum: password - 6 letters) <br>
```
PUT:
{
    "password": "New Password"
}
```
> Returns boolean status.<br>
> If false, then user not found.


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


### Delete user
`http://localhost:5000/api/user/delete/<USER_ID>` <br>
```
DELETE
```
> Returns boolean status.<br>
> If false, it means that the user with the given id does not exist.

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