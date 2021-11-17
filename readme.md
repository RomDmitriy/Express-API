# API Documentation (v2.3.2)

Last tested on: v2.0-alpha

## Auth queries

### Check user in database:
`http://localhost:5000/api/user/check` <br>
(minimum: login - 4 letters, password - 6 letters) <br>
(maximum: login - 32 letters, password - 32 letters) <br>
```
POST:
{
    "login": "test",
    "pass": "testtest"
}
```
> Returns boolean status.<br>
> If false, then there is no user with such a username and password, or missing parameters.<br>
> Update lastLoginIn in database.


### Register new user:
`http://localhost:5000/api/user/register` <br>
(minimum: login - 4 letters, password - 6 letters) <br>
(maximum: login - 32 letters, password - 32 letters) <br>
(login _must_ be unique) <br>
```
POST:
{
    "login": "test",
    "pass": "testtest"
}
```
> Returns boolean status.<br>
> If false, then means one of the conditions above is not met.


### Get all user information:
(without id and password) <br>
`http://localhost:5000/api/user/fetch/<USER_ID>` <br>
> Returns login, about, avatarURL, lastLoginUTC, roomList[] as JSON.

### Get some user information:
(id and password are not allowed) <br>
`http://localhost:5000/api/user/fetch/<USER_ID>/<FIELDS>` <br>
> FIELDS - enumeration of needed fields (Avaliable fields: login, about, avatarurl, lastloginutc, roomlist).
>> Example of crazy API Request:<br>`http://localhost:5000/api/user/1/login, id, avatarurlabout ! lastloginutc->roomlist`<br>
>> This example returns login, about, avatarURL, lastLoginUTC, roomList[] as JSON.

### Update password:
`http://localhost:5000/api/user/changePass` <br>
(minimum: password - 6 letters) <br>
```
PUT:
{
    "password": "New Password",
    "id": *USER_ID*
}
```
> Returns true.<br>


### Update avatar:
`http://localhost:5000/api/user/changeAvatar` <br>
```
PUT:
{
    "avatarURL": "avatarURL_Link",
    "id": *USER_ID*
}
```
> Returns true.<br>


### Delete user:
`http://localhost:5000/api/user/delete` <br>
```
DELETE:
{
    "id": *USER_ID*
}
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
> Returns bool status.<br>
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
> Returns bool status.<br>
> If false then name already exists.