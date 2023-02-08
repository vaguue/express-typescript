# Express + Typescript + Prisma + Mongo

Example of a Express.js server + Prisma (Mongo) + Redis + Typescript for CRUD

This server uses Redis-om to authenticate users via bearer tokens. API usage example can be found here. Routes:

    /signin [POST] - request bearer token with id + password (id is either a phone or email, after registration the type of id is stored in the database as well).
    /signup [POST] - create new user (return bearer token after a successful registration).
    /info [GET] - return id and id type (authenticated only).
    /car [POST] - create a car
    /car/:id [GET] - get a car by id
    /car/list [GET] - list cars (parameters: order_by, list_size, page, asc)
    /car/:id [PATCH] - update a car by id
    /car/:id [DELETE] - delete a car by id
    /latency [GET] - return server latency (authenticated only).
    /logout [GET] - has "all" query boolean parameter, which determines wheter to logout from all users's session of curent only.

CLI client can be found [here](test/cli.js)
