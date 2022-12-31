How To Run:
```
1.install node.js v19 https://nodejs.org/en/download/current/
2.open root project directory via terminal
run:

docker-compose up

3.open root project directory via another terminal
run:

4.npm install
5.npm run build
6.npm run start

```

api:

`localhost:7777/input`
 
```
request:
body, type: application.json
  {
    "number": ${value}
  }
```
```
response:
{
    "ticket": number
}

```
example
```
request:
{
    "number": 55
}

response:
{
    "ticket": 50
}
```


`localhost:7777/output/${ticketNumber}`
```
response:
{
    "Fibonacci": value(string)
}
```

example:
```
request:
localhost:3501/output/50

response:
{
    "Fibonacci": "139583862445"
}
```

WHAT'S new in next version
1. add Dockerization image (now problems with connection to redis)
2. adc .env config
3. upgrade algorithm, using good algorithm approaches, for example:
 https://codeforces.com/blog/entry/14385
 O(logn)
