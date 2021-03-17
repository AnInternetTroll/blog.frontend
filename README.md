# What is this?

This is the repository for the frontend of [Assbok](https://github.com/andrevdal/blog/).

# How to run this?

Install the dependencies with `npm i` and then either `npm run dev` for development or `npm run build && npm start` for production mode.

# FAQ

## Q: Why is this a different repo?

This started as a side project and so @AnInternetTroll wasn't planning on incorporating it into the main project. But time is tight and here we are.

## Q: Advantages and disadvantages?

-   Advantages:
    -   Can run on a different server which may help with spliting workload
    -   ~~Can possibily run on a user's PC (I tried with [tauri](https://tauri.studio/en/) and it's having trouble generating files on the go so uhhhh)~~
    -   Coding wise you don't have to worry about security as long as the backend is ok.
-   Disadvantages:
    -   Making an HTTP request to get data from the Assbook API will **always** be slower than getting the data from mongodb. Security advantages are debatable.
    -   ~~react is ugly~~
