How To Run:
```
open root project directory via terminal
run:

docker-compose up
npm run build
npm run start

```

api:

`localhost:3501/input`
 
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


`localhost:3501/output/${ticketNumber}`
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
