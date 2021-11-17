# API Documentation (v1.1)

##### Last tested on: v1.0

## Auth queries

### Check user in database:
`http://localhost:5000/api/user/check` <br>
(minimum: login - 4 letters, password - 6 letters) <br>
```
POST:
{
    "login": "test",
    "password": "testtest"
}
```
> Returns boolean status<br>
> If false, then there is no user with such a username and password


### Register:
`http://localhost:5000/api/user/register` <br>
(minimum: login - 4 letters, password - 6 letters, login *must* be unique) <br>
```
POST:
{
    "login": "test",
    "password": "testtest"
}
```
> Returns boolean status<br>
> If false, then either a user with the same name already exists, or the length of the login or password does not meet the requirements


### Get all user information:
(without id and password) <br>
`http://localhost:5000/api/user/*USER_ID*` <br>
> \*USER_ID\* - ID of user :/<br>
> Returns login, about, avatarurl, lastlogin as JSON

### Get some user information:
(id and password are not allowed) <br>
`http://localhost:5000/api/user/<USER_ID>/<FIELDS>` <br>
> USER_ID - ID of a user :/<br>
> FIELDS - enumeration of needed fields (Avaliable fields: login, about, avatarurl, lastloginutc, roomlist)
>> Example of crazy API Request: `http://localhost:5000/api/user/1/login, id, avatarurlabout ! lastloginutc->roomlist`
>> This example returns login, about, avatarurl, lastloginutc, roomlist

### Get single user information:
(without id and password) <br>
`http://localhost:5000/api/user/*USER_ID*` <br>
> \*USER_ID\* - ID of user :/<br>
> Returns login, about, avatarurl, lastlogin as JSON

### Update password:
`http://localhost:5000/api/user/changePass` <br>
(minimum: password - 6) <br>
```
PUT:
{
    "password": "New Password",
    "id": 1
}
```
> Returns boolean status<br>
> If false, then Express or Database are down


### Update avatar:
`http://localhost:5000/api/user/changeAvatar` <br>
```
PUT:
{
    "avatarURL": "avatarURL_Link",
    "id": 1
}
```
> Returns boolean status<br>
> If false, then Express or Database are down


### Delete user:
`http://localhost:5000/api/user/delete` <br>
```
DELETE:
{
    "id": 1
}
```
> Returns boolean status<br>
> If false, it means that the user with the given id does not exist